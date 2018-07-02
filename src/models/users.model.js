// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const userSchema = new Schema({
    _id: String,
    githubId: String,
    ciscosparkId: String,
    ciscospark: {
      accessToken: String,
      refreshToken: String
    },
    roles: [String],
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
  });

  userSchema.virtual('webhooks', {
    ref: 'webhooks',
    localField: '_id',
    foreignField: 'ownerId'
  });

  userSchema.set('toJSON', {
    getters: true,
    virtuals: true
  });

  userSchema.set('toObject', {
    getters: true,
    virtuals: true
  });

  return mongooseClient.model('users', userSchema);
};
