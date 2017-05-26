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
    let question = new Question( {
        _room: message.channel,
        personEmail: message.user,
        personId: message.original_message.personId,
        text: message.text,
        displayName: ( message.personDisplayName || 'Unknown' ),
        sequence: room.sequence,
        createdOn: Date.now()
    } );

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
    return newRoom.save();
};

// Add the answer object to the question object
var addAnswer = ( message ) => {
    const regex = /(answer|\/a)\s?(\d+)\s(\w+.*)$/i;
    let match = regex.exec( message.text );
    let sequence = Number( match[ 2 ] );
    let answer = {
        personEmail: message.user,
        personId: message.original_message.personId,
        displayName: message.personDisplayName,
        text: match[ 3 ],
        createdOn: Date.now()
    };
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
    const regex = /(answer|\/a)\s?(\d+)\s(\w+.*)$/i;
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
                    return handleQuestion( message );
                } );
    } );
};

var handleAnswer = ( message ) => {
    var msg = message;
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
    if ( filter == 'unanswered' )
        return listFilter( roomId, false, sort, limit, page );
    if ( filter == 'answered' )
        return listFilter( roomId, true, sort, limit, page );
    if ( search )
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

var searchQuestions = ( roomId, filter = true, sort = 'sequence', limit = 10, page = 1, search ) => {
    var query = {
        _room: roomId,
        $text: {
            $search: search
        }
    };
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
    return Room.find( {} ).exec();
}

var authenticatedRooms = ( personId ) => {
    return new Promise( ( resolve, reject ) => {
        findAllRooms().then( roomList => {
            // console.log( 'found rooms: ' + roomList )
            let total = roomList.length
            let matched = [];
            let counter = 0;
            roomList.forEach( room => {
                Spark.memberships.list( {
                    roomId: room._id,
                    personId: personId
                } ).then( matchedList => {
                    counter++
                    if ( matchedList.items.length > 0 ) {
                        matched.push( room )
                    }
                    if ( counter == total ) {
                        resolve( matched )
                    }
                } )
            } )
        } )
    } )
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
    checkRights: checkRights
};
