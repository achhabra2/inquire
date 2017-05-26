'use strict';

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var paginate = require( 'mongoose-paginate' );

// Defining MongoDB Schema for the users

var userSchema = new Schema( {
    _id: String,
    displayName: String,
    firstName: String,
    lastName: String,
    email: String,
    avatar: String,
    orgId: String,
    createdOn: {
        type: Date,
        default: Date.now()
    }
} );

userSchema.plugin( paginate );

module.exports = mongoose.model( 'sparkUser', userSchema );
