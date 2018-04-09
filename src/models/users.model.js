// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
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

  return mongooseClient.model('users', userSchema);
};
