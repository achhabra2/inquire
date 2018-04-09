// motds-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const motdSchema = new Schema({
    message: String,
    createdOn: {
      type: Date,
      default: Date.now()
    }
  });

  return mongooseClient.model('motds', motdSchema);
};
