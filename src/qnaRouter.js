'use strict';

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const qnaController = require( './qnaController' );

var router = express.Router();

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );

let base = process.env.public_address;
let authUrl = base + '/login';
let errorUrl = base + '/error';
let apiUrl = base + '/api/spaces/';

router.get( '/spaces/:room', ensureAuthenticated, ensureAccessRights, ( req, res ) => {
    let room = req.params.room;
    console.log( 'Received room api query for' + room );
    let page = 1;
    let limit = 10;
    let search;
    let sort = 'createdOn';
    let filter;
    if ( req.query.page )
        page = Number( req.query.page );
    if ( req.query.per_page )
        limit = Number( req.query.per_page );
    if ( req.query.filter )
        search = req.query.filter;
    if ( req.query.sort && req.query.sort != '' )
        sort = formatSort( req.query.sort );
    qnaController.listQuestions( room, filter, sort, limit, page, search ).then( response => {
        let formattedResponse = handleQuery( response );
        let nextPage = page + 1;
        let prevPage = null;
        if ( page - 1 > 0 )
            prevPage = page - 1;
        let prevPageUrl = '';
        let nextPageUrl = '';
        if ( response.pages > page )
            nextPageUrl = apiUrl + room + '?page=' + nextPage;
        if ( prevPage )
            prevPageUrl = apiUrl + room + '?page=' + prevPage;
        formattedResponse.next_page_url = nextPageUrl;
        formattedResponse.prev_page_url = prevPageUrl;
        res.send( formattedResponse );
    } ).catch( err => {
        res.status( 500 ).send( 'Error in query' );
    } );
} );

router.get( '/listSpaces', ensureAuthenticated, ( req, res ) => {
    console.log( 'Received detail api query for all rooms' );
    qnaController.authenticatedRooms( req.user.id )
        .then( rooms => {
            res.json( rooms );
        } ).catch( err => {
            res.status( 403 ).send( 'You must first authenticate. ' );
        } );
} );

router.get( '/spaces/detail/:room', ensureAuthenticated, ensureAccessRights, ( req, res ) => {
    let room = req.params.room;
    console.log( 'Received detail api query for' + room );
    qnaController.findRoom( room )
        .then( roomDetail => {
            res.send( roomDetail );
        } ).catch( err => {
            res.send( err );
        } );
} );

var handleQuery = ( response ) => {
    let entries;
    if ( response.total > response.limit * response.page )
        entries = response.limit;
    else
        entries = response.total % response.limit;
    let from = response.page * response.limit - response.limit + 1;
    let to = from + entries - 1;
    let formattedResponse = {
        total: response.total,
        per_page: response.limit,
        current_page: response.page,
        last_page: response.pages,
        next_page_url: '',
        prev_page_url: '',
        from: from,
        to: to,
        data: response.docs
    };
    return formattedResponse;
};

var formatSort = ( expression ) => {
    let sortregex = /^(createdOn|sequence|displayName)(\|)(asc|dsc)$/i;
    let sort;
    let match = sortregex.exec( expression );
    if ( match && match[ 3 ] == 'dsc' ) {
        sort = match[ 1 ];
    } else if ( match && match[ 3 ] == 'asc' ) {
        sort = '-' + match[ 1 ];
    } else {
        sort = 'createdOn';
    }
    return sort;
};

function ensureAuthenticated( req, res, next ) {
    if ( req.isAuthenticated() ) {
        return next();
    }
    res.redirect( authUrl )
}

function ensureAccessRights( req, res, next ) {
    if ( req.params.room ) {
        let roomId = req.params.room;
        let personId = req.user.id;
        qnaController.checkRights( personId, roomId ).then( rights => {
            if ( rights )
                return next()
            else
                res.redirect( errorUrl )
        } )
    } else {
        res.redirect( errorUrl )
    }
}

module.exports = router;
