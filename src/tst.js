const Room = require( './qnaModel' ).Room;
const Question = require( './qnaModel' ).Question;
const Spark = require( 'ciscospark' ).init( {
    credentials: {
        authorization: {
            access_token: process.env.access_token
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

function delay( t ) {
    return new Promise( function ( resolve ) {
        setTimeout( resolve, t )
    } );
}


var updateRoomInfo = () => {
    Room.find( {} ).exec().then( roomList => {
        roomList.forEach( room => {
            Spark.rooms.get( room._id ).then( roomDetail => {
                    room.displayName = roomDetail.title;
                    room.lastActivity = roomDetail.lastActivity;
                    if ( roomDetail.teamId ) {
                        room.teamId = roomDetail.teamId
                        delay( 10000 ).then( () => {
                            Spark.teams.get( roomDetail.teamId ).then( teamDetail => {
                                    room.teamName = teamDetail.name
                                    room.save()
                                    console.log( 'Saved room with team' )
                                } )
                                .catch( err => {
                                    console.log( err )
                                    console.error( 'Error getting team from Spark' )
                                } )
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

function getMemberships() {
    Room.find( {} ).sort( '-lastActivity' ).exec().then( roomList => {
        roomList.forEach( room => {
            Spark.memberships.list( {
                    roomId: room._id,
                } ).then( response => {
                    var memberArray = []
                    response.items.forEach( member => {
                        memberArray.push( member.personId )
                    } )
                    room.memberships = memberArray
                    return room.save()
                } )
                .then( savedRoom => {
                    console.log( 'Saved Room: ' )
                    console.log( savedRoom )
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
    getMemberships()
} );
