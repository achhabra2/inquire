// const mongoose = require( 'mongoose' );

console.log( 'Loading env file...' );
const env = require( 'node-env-file' );
env( './.env' );

var qnaController = require( './src/qnaController' );
const mongoose = require( 'mongoose' );
// Connection Strings to MongoDB Instance
mongoose.Promise = global.Promise;
mongoose.connect( process.env.mongo ).then( ( err ) => {
    if ( err )
        console.error( err );
    var message = {
        user: 'amachhab@cisco.com',
        //channel: 'unknown',
        channel: 'Y2lzY29zcGFyazovL3VzL1JPT00vMGMzODJmYzktMDQ0My0zYzUyLWFmMzQtNTFlMWQ5NGIxODA4',
        text: 'answer 1 It\'s peanut butter jelly time!',
        id: 'Y2lzY29zcGFyazovL3VzL01FU1NBR0UvMDc1OTU0YzAtMzVlNC0xMWU3LTk2YTctZGIzOGFkNzJjZGYx',
        original_message: {
            id: 'Y2lzY29zcGFyazovL3VzL01FU1NBR0UvMDc1OTU0YzAtMzVlNC0xMWU3LTk2YTctZGIzOGFkNzJjZGYx',
            roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vMGMzODJmYzktMDQ0My0zYzUyLWFmMzQtNTFlMWQ5NGIxODA4',
            roomType: 'direct',
            text: 'answer 1 It\'s peanut butter jelly time!',
            personId: 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9kODhiZDc1ZS1iOGMzLTQ4Y2YtYWJjNy01ZWM1Y2JjNzU4YWM',
            personEmail: 'amachhab@cisco.com',
            created: '2017-05-11T00:51:55.020Z',
            orgId: 'Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi8xZWI2NWZkZi05NjQzLTQxN2YtOTk3NC1hZDcyY2FlMGUxMGY'
        }
    };

    qnaController.listTest( 'Y2lzY29zcGFyazovL3VzL1JPT00vYTM3Yjk0YjEtZDJkNi0zNzY4LTljZTgtMDRiMTliOTQxZjk2' ).then( response => {
            console.log( response );
        } )
        .catch( err => {
            console.error( err );
        } );

} ).catch( ( err ) => {
    console.error( err );
} );
