'use strict';
const debug = require('debug')('Controller');
const Room = require( './qnaModel' ).Room;
const Question = require( './qnaModel' ).Question;
const Spark = require( 'ciscospark/env');
const rp = require( 'request-promise-native' );
const parseLink = require( 'parse-link-header' );
const Motd = require( './motdModel' );
const request = require('superagent');

const answerRegex = /(answer|\/a\/?)(?:\s+)?(\d+)\s+(?:\-\s+)?(\w+.*)$/i;

var formatText = (message) => {
    let reg = new RegExp(process.env.bot_name, 'i');
    message.text = message.text.replace(reg,'');
    return message;
}

var getPerson = (personId) => {
    return request.get(`https://api.ciscospark.com/v1/people/${personId}`)
    .set('Authorization', `Bearer ${process.env.access_token}`)
    .then(res => {
      return res.body;
    });
}

var getMotd = () => {
    return Motd.find( {} ).sort( '-createdOn' ).exec()
}

var updateRoomActivity = ( roomId ) => {
    return Room.findById( roomId ).exec().then( room => {
            room.lastActivity = Date.now()
            return room.save()
        } )
        .then( savedRoom => {
            debug( 'Updated Activity: ' + savedRoom.displayName )
            return savedRoom
        } )
        .catch( err => {
            console.error( 'Error updating Room Activity' )
            console.error( err )
        } )
}

function getMembershipsPaginated( url = 'https://api.ciscospark.com/v1/memberships', roomId, members = [] ) {
    let qs
    let options = {
        'auth': {
            'bearer': process.env.access_token
        },
        resolveWithFullResponse: true
    }
    if ( roomId ) {
        options.qs = {
            'roomId': roomId,
            'max': 999
        }
    }
    return rp.get( url, options ).then( response => {
        let links;
        let responseArray = members.concat( JSON.parse( response.body ).items )
        if ( response.headers.link ) {
            links = parseLink( response.headers.link )
            if ( links.next.url ) {
                return getMembershipsPaginated( links.next.url, null, responseArray )
            }
        } else
            return responseArray
    } )
}


var updateRoomMemberships = ( roomId ) => {
    return Room.findById( roomId ).exec().then( room => {
            return getMembershipsPaginated( undefined, roomId ).then( response => {
                    var memberArray = []
                    response.forEach( member => {
                        memberArray.push( member.personId )
                    } )
                    room.memberships = memberArray
                    return room.save()
                } )
                .catch( err => {
                    console.error( 'Error getting Room Memberships' )
                    console.error( err )
                } )
        } )
        .then( savedRoom => {
            debug( 'Updated Room Memberships: ' + savedRoom.displayName )
            return savedRoom
        } )
        .catch( err => {
            debug( 'Error saving Room Memberships ' )
        } )
}

var handleMembershipChange = ( data ) => {
    return checkRoom( data ).then( ( room ) => {
            if ( room )
                return updateRoomMemberships( data.channel )
            else {
                debug( 'Existing room not found' )
                return null
            }
        } )
        .catch( err => {
            console.error( 'Could not check room and Update memberships' )
        } )
}

var getUserDetails = ( message ) => {
    return getPerson( message.original_message.personId )
        .then( person => {
            let msg = message;
            msg.personDisplayName = person.displayName;
            return msg;
        } )
        .catch( err => {
            console.error( err );
            return message;
        } );
};

var getRoomDetails = ( message ) => {
    return Spark.rooms.get( message.channel )
        .then( room => {
            let msg = message;
            msg.roomTitle = room.title;
            if ( room.teamId ) {
                msg.roomTeamId = room.teamId
            }
            return msg;
        } )
        .catch( err => {
            console.error( err );
            return message;
        } );
};

var getDbStats = () => {
    let stats = {}
    return Room.count( {} ).exec().then( count => {
            stats.spaces = count
            return Question.count( {} ).exec()
        } )
        .then( count => {
            stats.questions = count
            return stats
        } )
        .catch( err => {
            console.error( 'Error getting Db Stats' )
            console.error( err )
        } )
}

// Upsert creation of room / question
var addQuestion = ( message, room ) => {
    message = formatText(message);
    room.sequence += 1;
    room.lastActivity = Date.now();
    let question = new Question( {
        _room: message.channel,
        personEmail: message.user,
        personId: message.original_message.personId,
        text: message.text,
        displayName: ( message.personDisplayName || 'Unknown' ),
        sequence: room.sequence,
        createdOn: Date.now()
    } );
    if ( message.html ) {
        question.html = message.html
    }
    return room.save().then( room => {
        debug( 'Updated room successfully.' );
        return question.save()
    } );
};

// Create a new room object
var checkRoom = ( message ) => {
    return Room.findById( message.channel ).exec();
};

// Create a new room object
var createRoom = ( message ) => {
    let newRoom = new Room( {
        _id: message.channel,
        orgId: message.original_message.orgId,
        displayName: ( message.roomTitle || 'Unknown' )
    } );
    if ( message.roomTeamId ) {
        newRoom.teamId = message.roomTeamId
    }
    return newRoom.save();
};

// Add the answer object to the question object
var addAnswer = ( message ) => {
    let match = answerRegex.exec( message.original_message.text );
    let sequence = Number( match[ 2 ] );
    let htmlMatch;
    let htmlMessage;
    if ( message.html ) {
        htmlMatch = answerRegex.exec( message.html )
        htmlMessage = htmlMatch[ 3 ];
    }
    let answer = {
        personEmail: message.user,
        personId: message.original_message.personId,
        displayName: message.personDisplayName,
        text: match[ 3 ],
        createdOn: Date.now()
    };
    if ( htmlMessage ) {
        answer.html = htmlMessage
    }
    let query = {
        _room: message.channel,
        sequence: sequence
    };
    let update = {
        $push: {
            answers: answer
        },
        answered: true
    }
    return Question.update( query, update );
};

// Find the answer to a specific question.
var findQuestion = ( message ) => {
    let match = answerRegex.exec( message.original_message.text );
    let sequence = Number( match[ 2 ] );
    let query = {
        _room: message.channel,
        sequence: sequence
    };
    return Question.findOne( query ).exec();
};

var handleQuestion = ( message ) => {
    return checkRoom( message ).then( ( room ) => {
        if ( room )
            return getUserDetails( message )
                .then( updatedMessage => {
                    return addQuestion( updatedMessage, room )
                } );
        else
            return getRoomDetails( message )
                .then( updatedMessage => {
                    return createRoom( updatedMessage );
                } )
                .then( room => {
                    updateRoomMemberships( room._id )
                    return handleQuestion( message );
                } );
    } );
};

var handleAnswer = ( message ) => {
    var msg = message;
    updateRoomActivity( message.original_message.roomId )
    return getUserDetails( msg )
        .then( updatedMessage => {
            return addAnswer( updatedMessage );
        } )
        .then( status => {
            if ( status.nModified == 0 )
                return Promise.reject( 'Error adding answer to question. ' );
            else
                return findQuestion( msg );
        } )
        .catch( err => {
            console.error( err );
            return Promise.reject( 'Error adding answer to question. ' );
        } );
};

var listQuestions = ( roomId, filter, sort = 'sequence', limit = 10, page = 1, search = null ) => {
    if ( search || filter )
        return searchQuestions( roomId, filter, sort, limit, page, search );
    else {
        var response = {};
        var query = {
            _room: roomId
        };
        var options = {
            limit: limit,
            page: page,
            sort: sort
        };
        return Question.paginate( query, options );
    }
};

var searchQuestions = ( roomId, filter, sort = 'sequence', limit = 10, page = 1, search ) => {
    let answered
    if ( filter == 'unanswered' ) {
        answered = {
            $ne: true
        }
    } else if ( filter == 'answered' ) {
        answered = {
            $ne: false
        }
    }
    var query = {
        _room: roomId,
    };
    if ( answered ) {
        query.answered = answered
    }
    if ( search ) {
        query.$text = {
            $search: search
        }
    }
    var options = {
        limit: limit,
        page: page,
        sort: sort
    };
    return Question.paginate( query, options );
};

var findRoom = ( roomId ) => {
    return Room.findById( roomId ).exec();
}

var findAllRooms = () => {
    return Room.find( {} ).sort( '-lastActivity' ).exec();
}

var removeQuestion = ( id ) => {
    return Question.findByIdAndRemove( id )
}

// var removeAnswer = ( id ) => {
//     return Room.answers.id( id ).remove();
// }

var authenticatedRooms = ( personId ) => {
    return Room.find( {} ).select( '_id displayName lastActivity teamId teamName sequence' )
        .where( 'memberships' )
        .in( [ personId ] )
        .sort( '-lastActivity' ).exec()
}

var checkRights = ( personId, roomId ) => {
    let query = {
        personId: personId,
        roomId: roomId
    };
    return Spark.memberships.list( query ).then( response => {
            if ( response.items.length > 0 )
                return true
            else
                return false
        } )
        .catch( err => {
            console.error( err )
            return false
        } )
}

module.exports = {
    formatText: formatText,
    handleAnswer: handleAnswer,
    handleQuestion: handleQuestion,
    listQuestions: listQuestions,
    findRoom: findRoom,
    searchQuestions: searchQuestions,
    findAllRooms: findAllRooms,
    authenticatedRooms: authenticatedRooms,
    checkRights: checkRights,
    removeQuestion: removeQuestion,
    handleMembershipChange: handleMembershipChange,
    getDbStats: getDbStats,
    getMotd: getMotd
};
