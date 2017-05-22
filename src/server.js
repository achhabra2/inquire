'use strict';

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

const bodyParser = require( 'body-parser' );
const Botkit = require( 'botkit' );
const qnaRouter = require( './qnaRouter' );
const path = require( 'path' );
const express = require( 'express' );

process.env.CISCOSPARK_ACCESS_TOKEN = process.env.access_token;

const mongoose = require( 'mongoose' );
// Connection Strings to MongoDB Instance
mongoose.Promise = global.Promise;
mongoose.connect( process.env.mongo ).then( ( err ) => {
    if ( err )
        console.error( err );
} );

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.sparkbot( {
    // debug: true,
    public_address: process.env.public_address,
    ciscospark_access_token: process.env.access_token,
    studio_token: process.env.studio_token, // get one from studio.botkit.ai to enable content management, stats, message console and more
    secret: process.env.secret, // this is an RECOMMENDED but optional setting that enables validation of incoming webhooks
    webhook_name: 'Cisco Spark bot created with Botkit, override me before going to production',
    studio_command_uri: process.env.studio_command_uri,
} );

var normalizedPath = require( "path" ).join( __dirname, "skills" );
require( "fs" ).readdirSync( normalizedPath ).forEach( function ( file ) {
    require( "./skills/" + file )( controller );
} );

var bot = controller.spawn( {} );

controller.setupWebserver( 3000, function ( err, webserver ) {
    controller.createWebhookEndpoints( webserver, bot, function () {
        console.log( "Cisco Spark: Webhooks set up!" );
    } );
} );

controller.webserver.all( '*', function ( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token' );
    // intercept OPTIONS method
    if ( 'OPTIONS' == req.method ) {
        res.send( 200 );
    } else {
        next();
    }
} );

controller.webserver.use( '/public', express.static( path.join( __dirname, '../views' ) ) );
controller.webserver.use( '/qna', qnaRouter );
