// spaces-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const qnaRoomSchema = new Schema({
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
    memberships: [String],
    mode: {
      type: String,
      enum: ['verbose', 'default']
    },
    moderators: {
      type: [String],
      default: []
    },
    active: {
      type: Boolean,
      default: true
    },
    createdOn: {
      type: Date,
      default: Date.now()
    }
  });

  qnaRoomSchema.virtual('questions', {
    ref: 'Question',
    localField: '_id',
    foreignField: '_room'
  });

  qnaRoomSchema.virtual('roomId').get(function() {
    return this._id;
  });

  qnaRoomSchema.set('toJSON', {
    getters: true,
    virtuals: false
  });

  qnaRoomSchema.set('toObject', {
    getters: true,
    virtuals: false
  });

  return mongooseClient.model('spaces', qnaRoomSchema);
};
