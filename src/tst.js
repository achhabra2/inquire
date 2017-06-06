const Room = require( './qnaModel' ).Room;
const Question = require( './qnaModel' ).Question;
const Spark = require( 'ciscospark' ).init( {
    credentials: {
        authorization: {
            access_token: process.env.
        }
    }
} );
// console timestamps
require( 'console-stamp' )( console, 'yyyy.mm.dd HH:MM:ss.l' );
console.log( 'Initializing App In: ' + process.env.NODE_ENV + ' mode.' );

// Check for production
// If development environment load .env file
if ( process.env.NODE_ENV != 'production' ) {
    console.log( 'Loading env file...' );
    const env = require( 'node-env-file' );
    env( './.env' );
}


var updateRoomInfo = () => {
    findAllRooms().then( roomList => {
        roomList.forEach( room => {
            Spark.rooms.get( room._id ).then( roomDetail => {
                    room.displayName = roomDetail.title;
                    room.lastActivity = roomDetail.lastActivity;
                    if ( roomDetail.teamId ) {
                        console.log( 'Room Team Detail: ' )
                        console.log( roomDetail )
                        room.teamId = roomDetail.teamId
                        Spark.teams.get( roomDetail.teamId ).then( teamDetail => {
                                room.teamName = teamDetail.name
                                room.save()
                                console.log( 'Saved room with team' )
                            } )
                            .catch( err => {
                                console.error( 'Error getting team from Spark' )
                                console.error( err )
                            } )
                    } else {
                        room.save()
                        console.log( 'Saved room' )
                    }
                } )
                .catch( err => {
                    console.error( 'Error getting Room Detail' )
                    console.error( err )
                } )
        } )
    } )
}

const mongoose = require( 'mongoose' );
// Connection Strings to MongoDB Instance
mongoose.Promise = global.Promise;
mongoose.connect( process.env.mongo ).then( ( err ) => {
    if ( err )
        console.error( err );
    qna.updateRoomInfo()
} );
