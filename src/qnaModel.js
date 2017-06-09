'use strict';

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var paginate = require( 'mongoose-paginate' );

// Defining MongoDB Schema for the users

var answerSchema = new Schema( {
    personEmail: String,
    personId: String,
    displayName: String,
    text: String,
    html: String,
    sequence: {
        type: Number,
        default: '1'
    },
    upvotes: Number,
    createdOn: {
        type: Date,
        default: Date.now()
    }
} );

var questionSchema = new Schema( {
    _room: {
        type: String,
        ref: 'Room'
    },
    personEmail: String,
    personId: String,
    displayName: String,
    text: {
        type: String
    },
    html: {
        type: String
    },
    sequence: {
        type: Number,
        default: '1'
    },
    answered: {
        type: Boolean,
        default: false,
        index: true
    },
    context: {
        type: String,
        index: true
    },
    tags: {
        type: String
    },
    starred: {
        type: Boolean,
        default: false
    },
    answers: [ answerSchema ],
    createdOn: {
        type: Date,
        default: Date.now()
    }
} );


var qnaRoomSchema = new Schema( {
    _id: {
        type: String
    },
    displayName: {
        type: String,
        index: true
    },
    orgId: {
        type: String,
        index: true
    },
    sequence: {
        type: Number,
        default: '0'
    },
    tags: String,
    teamId: String,
    teamName: String,
    lastActivity: Date,
    memberships: [ String ],
    createdOn: {
        type: Date,
        default: Date.now()
    }
} );

questionSchema.index( {
    text: 'text',
    displayName: 'text',
    'answers.text': 'text',
    'answers.displayName': 'text'
} );

questionSchema.plugin( paginate );

qnaRoomSchema.virtual( 'questions', {
    ref: 'Question',
    localField: '_id',
    foreignField: '_room'
} );

qnaRoomSchema.virtual( 'roomId' ).get( function () {
    return this._id;
} );

qnaRoomSchema.set( 'toJSON', {
    getters: true,
    virtuals: false
} );

qnaRoomSchema.set( 'toObject', {
    getters: true,
    virtuals: false
} );

module.exports = {
    Room: mongoose.model( 'Space', qnaRoomSchema ),
    Question: mongoose.model( 'Question', questionSchema )
};
