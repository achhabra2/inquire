'use strict';

const Room = require( './qnaModel' ).Room;
const Question = require( './qnaModel' ).Question;
const User = require( './userModel' );
const Spark = require( 'ciscospark/env' );

var router = express.Router();

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );

var addRoom = ( req, res ) => {
    if ( req.data.id && req.data.orgId && req.data.orgId ) {
        let newRoom = new Room( {
            _id: req.data.id,
            orgId: req.data.orgId,
            displayName: req.data.title
        } );
        newRoom.save().then( room => {
            res.json( room );
        } )
    } else {
        res.status( 400 ).end()
    }
}

var addQuestion = ( req, res ) => {
    if ( req.data.id && req.data.orgId && req.data.orgId ) {
        let newQuestion = new Question( {
            _id: req.data.id,
            orgId: req.data.orgId,
            displayName: req.data.title
        } );
        newQuestion.save().then( question => {
            res.json( question );
        } )
    } else {
        res.status( 400 ).end()
    }
}

var removeRoom = ( req, res ) => {
    if ( req.data.id || req.data._id ) {
        let deleteId;
        if ( req.data.id ) {
            deleteId = req.data.id
        }
        if ( req.data._id ) {
            deleteId = req.data._id
        }
        Room.findByIdAndRemove( deleteId ).then( response => {
                res.status( 204 ).end()
            } )
            .catch( err => {
                res.status( 500 ).end()
            } )
    } else {
        res.status( 400 ).end()
    }
}

var removeQuestion = ( req, res ) => {
    if ( req.data.id || req.data._id ) {
        let deleteId;
        if ( req.data.id ) {
            deleteId = req.data.id
        }
        if ( req.data._id ) {
            deleteId = req.data._id
        }
        Question.findByIdAndRemove( deleteId ).then( response => {
                res.status( 204 ).end()
            } )
            .catch( err => {
                res.status( 500 ).end()
            } )
    } else {
        res.status( 400 ).end()
    }
}


router.route( 'spaces' )
    .post( addRoom )
    .put()
router.route( 'spaces/:space' )
    .delete( removeQuestion )
router.route( 'questions' )
    .post( addQuestion )
    .put()
router.route( 'questions/:question' )
    .delete( removeRoom )
router.route( 'users' )
    .post()
    .put()
router.route( 'users/:user' )
    .delete()

module.exports = router
