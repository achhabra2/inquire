'use strict';

const session = require( 'express-session' );
const passport = require( 'passport' );
const logger = require( 'morgan' );
const util = require( 'util' );
const userModel = require( './userModel' );

const OAuth2Strategy = require( 'passport-oauth2' );
const MongoStore = require( 'connect-mongo' )( session );
const sparkUser = require( './userModel' );
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

// Default case for no bot name specification
if(!process.env.bot_name)
    process.env.bot_name = 'Inquire';

const bodyParser = require( 'body-parser' );
const Botkit = require( 'botkit' );
const qnaRouter = require( './qnaRouter' );
const path = require( 'path' );
const express = require( 'express' );

const uiUrl = process.env.public_address + '/public/#/';
const redirectUrl = process.env.public_address + '/auth/redirect';

console.log( 'Oauth RedirectUrl:' );
console.log( redirectUrl );

process.env.CISCOSPARK_ACCESS_TOKEN = process.env.access_token;

const mongoose = require( 'mongoose' );
// Connection Strings to MongoDB Instance
mongoose.Promise = global.Promise;

// Heroku Addon Case - use mongo connection string
if(process.env.MONGODB_URI)
    process.env.mongo = process.env.MONGODB_URI

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

// controller.setupWebserver( 3000, function ( err, webserver ) {
// } );

passport.serializeUser( function ( user, done ) {
    // console.log( 'serializing' );
    // console.log( user );
    done( null, user );
} );

passport.deserializeUser( function ( obj, done ) {
    // console.log( 'deserializing' );
    // sparkUser.findById(obj.id).then(user => {
    //   done(null, user)
    // })
    // .catch(err => {
    //   done(err, obj)
    // })
    done( null, obj );
} );


const sparkOauth = new OAuth2Strategy( {
        authorizationURL: 'https://api.ciscospark.com/v1/authorize',
        tokenURL: 'https://api.ciscospark.com/v1/access_token',
        clientID: process.env.oauth_client,
        clientSecret: process.env.oauth_secret,
        callbackURL: redirectUrl
    },
    function ( accessToken, refreshToken, profile, done ) {
        console.log( 'Access token: ' + accessToken )
        console.log( 'Refresh token: ' + refreshToken )
        if ( profile.id ) {
            sparkUser.findById( profile.id ).then( returnedUser => {
                    if ( returnedUser ) {
                        console.log( 'User Found.. no need to create.' );
                        done( null, profile );
                    } else {
                        console.log( 'No Profile ID Creating new User' );
                        let user = new sparkUser( {
                            _id: profile.id,
                            displayName: profile.displayName,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: profile.emails[ 0 ],
                            avatar: profile.avatar,
                            orgId: profile.orgId,
                            createdOn: Date.now()
                        } )
                        user.save().then( createdUser => {
                            done( null, profile )
                        } );
                    }
                } )
                .catch( err => {
                    console.err( 'Error finding existing user.' );
                    console.err( err );
                    done( err, profile )
                } );

        } else {
            console.log( 'No profile id?: ' );
            console.log( profile );
            done( null, profile );
        }
    } );

sparkOauth.userProfile = function ( accessToken, done ) {
    const rp = require( 'request-promise-native' );

    rp.get( 'https://api.ciscospark.com/v1/people/me', {
            'auth': {
                'bearer': accessToken
            }
        } ).then( response => {
            let user = JSON.parse( response )
            user.token = accessToken;
            return done( null, user )
        } )
        .catch( err => {
            console.error( err )
            return done( err, {} );
        } );
};

passport.use( sparkOauth );

var app = express();

// app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
    extended: true
} ) );
app.use( session( {
    secret: 'cisco spark',
    store: new MongoStore( {
        mongooseConnection: mongoose.connection
    } ),
    resave: false,
    saveUninitialized: false
} ) );

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use( passport.initialize() );
app.use( passport.session() );
// app.use( express.static( __dirname + '/public' ) );
// });
app.all( '*', function ( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', 'http://localhost:8080' );
    res.header( 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token' );
    res.header( 'Access-Control-Allow-Credentials', true );
    // intercept OPTIONS method
    if ( 'OPTIONS' == req.method ) {
        res.send( 200 );
    } else {
        next();
    }
} );

app.get( '/', ( req, res ) => {
    res.redirect( uiUrl + 'about' )
} );

app.get( '/login', ( req, res ) => {
    res.redirect( uiUrl + 'login' )
} );

app.post( '/ciscospark/incoming', ( req, res ) => {
    controller.handleWebhookPayload( req, res, bot )
} );

controller.createWebhookEndpoints( app, bot, function () {
    console.log( "Cisco Spark: Webhooks set up!" );
} );

app.get( '/auth/login',
    passport.authenticate( 'oauth2', {
        scope: [ 'spark:messages_write', 'spark:rooms_read', 'spark:people_read', 'spark:teams_read' ]
    } ),
    function ( req, res ) {
        // The request will be redirected to Cisco Spark for authentication, so this
        // function will not be called.
    } );

app.get( '/auth/redirect',
    passport.authenticate( 'oauth2', {
        scope: [ 'spark:messages_write', 'spark:rooms_read', 'spark:people_read', 'spark:teams_read' ],
        failureRedirect: '/error'
    } ),
    function ( req, res ) {
        // console.log( 'Logging redirect Req' );
        // console.log( req.user );
        res.redirect( uiUrl );
    } )

app.get( '/auth/logout', function ( req, res ) {
    req.logout();
    res.json( {
        loggedOut: true
    } );
} );

app.get( '/error', function ( req, res ) {
    res.redirect( uiUrl + 'error' )
} );

app.get( '/auth/isAuthenticated', function ( req, res ) {
    res.json( {
        isAuthenticated: req.isAuthenticated()
    } );
} );

app.get( '/auth/getUser', function ( req, res ) {
    res.json( req.user );
} );

function ensureAuthenticated( req, res, next ) {
    if ( req.isAuthenticated() ) {
        return next();
    }
    res.redirect( uiUrl + 'login' )
}

app.use( '/public', express.static( path.join( __dirname, '../views' ) ) );
app.use( '/api', qnaRouter );

if ( process.env.NODE_ENV != 'production' ) {
    app.use( '/inquire/public', express.static( path.join( __dirname, '../views' ) ) );
}

app.listen( process.env.PORT || 3000 );
