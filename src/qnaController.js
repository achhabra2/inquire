'use strict';

const Room = require( './qnaModel' ).Room;
const Question = require( './qnaModel' ).Question;
const Spark = require( 'ciscospark' ).init( {
    credentials: {
        authorization: {
            access_token: process.env.access_token
        }
    }
} );

var updateRoomActivity = ( roomId ) => {
    return Room.findById( roomId ).exec().then( room => {
            room.lastActivity = Date.now()
            return room.save()
        } )
        .then( savedRoom => {
            console.log( 'Updated Activity: ' + savedRoom.displayName )
            return savedRoom
        } )
        .catch( err => {
            console.error( 'Error updating Room Activity' )
            console.error( err )
        } )
}

var updateRoomMemberships = ( roomId ) => {
    return Room.findById( roomId ).exec().then( room => {
            return Spark.memberships.list( {
                    roomId: roomId,
                    max: 999
                } ).then( response => {
                    var memberArray = []
                    response.items.forEach( member => {
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
            console.log( 'Updated Room Memberships: ' + savedRoom.displayName )
            return savedRoom
        } )
        .catch( err => {
            console.log( 'Error saving Room Memberships ' )
        } )
}

var handleMembershipChange = ( data ) => {
    return checkRoom( data ).then( ( room ) => {
            if ( room )
                return updateRoomMemberships( data.original_message.data.roomId )
            else {
                console.log( 'Existing room not found' )
                return null
            }
        } )
        .catch( err => {
            console.error( 'Could not check room and Update memberships' )
        } )
}

var getUserDetails = ( message ) => {
    return Spark.people.get( message.original_message.personId )
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

// Upsert creation of room / question
var addQuestion = ( message, room ) => {
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
    if ( message.original_message.html ) {
        question.html = message.original_message.html
    }
    return room.save().then( room => {
        console.log( 'Updated room successfully.' );
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
    const regex = /(answer|\/a\/?)\s+?(\d+)\s+(\w+.*)$/i;
    let match = regex.exec( message.text );
    // console.log( 'Answer debug..' )
    // console.log( match )
    let sequence = Number( match[ 2 ] );
    let htmlMatch;
    let htmlMessage;
    if ( message.original_message.html ) {
        htmlMatch = regex.exec( message.original_message.html )
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
    const regex = /(answer|\/a\/?)\s+?(\d+)\s+(\w+.*)$/i;
    let match = regex.exec( message.text );
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

var listFilter = ( roomId, filter, sort = 'sequence', limit = 10, page = 1 ) => {
    var response = {};
    var query = {
        _room: roomId,
        answered: filter
    };
    var options = {
        limit: limit,
        page: page,
        sort: sort
    };
    return Question.paginate( query, options );
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
    return Room.find( {} ).select( '_id displayName lastActivity teamName' )
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
    handleAnswer: handleAnswer,
    handleQuestion: handleQuestion,
    listQuestions: listQuestions,
    listFilter: listFilter,
    findRoom: findRoom,
    searchQuestions: searchQuestions,
    findAllRooms: findAllRooms,
    authenticatedRooms: authenticatedRooms,
    checkRights: checkRights,
    removeQuestion: removeQuestion,
    handleMembershipChange: handleMembershipChange
};
