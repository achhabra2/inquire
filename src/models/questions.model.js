// questions-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const answerSchema = new Schema({
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
    messageId: String,
    files: [String],
    createdOn: {
      type: Date,
      default: Date.now()
    }
  });

  const questionSchema = new Schema({
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
    messageId: String,
    files: [String],
    answers: [answerSchema],
    createdOn: {
      type: Date,
      default: Date.now()
    }
  });

  questionSchema.index({
    text: 'text',
    displayName: 'text',
    'answers.text': 'text',
    'answers.displayName': 'text'
  });

  return mongooseClient.model('questions', questionSchema);
};
