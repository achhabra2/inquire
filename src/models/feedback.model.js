// motds-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const feedbackSchema = new Schema({
    feedback: String,
    title: String,
    person: String,
    email: String,
    createdOn: {
      type: Date,
      default: Date.now()
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvoters: {
      type: [String],
      default: []
    }
  });

  return mongooseClient.model('feedback', feedbackSchema);
};
