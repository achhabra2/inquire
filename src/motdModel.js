'use strict';

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

// Defining MongoDB Schema for the users

var motdSchema = new Schema( {
    message: String,
    createdOn: {
        type: Date,
        default: Date.now()
    }
} );


module.exports = mongoose.model( 'motd', motdSchema );
