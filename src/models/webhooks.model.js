// webhooks-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const webhooks = new Schema(
    {
      name: { type: String, required: true },
      targetUrl: { type: String, required: true },
      resource: { type: String, required: true },
      event: { type: String, required: true },
      spaceId: { type: String, required: false },
      secret: { type: String, required: false },
      ownerId: { type: String }
    },
    {
      timestamps: true
    }
  );

  // webhooks.virtual('spaces', {
  //   ref: 'spaces',
  //   localField: 'ownerId',
  //   foreignField: 'memberships'
  // });

  // webhooks.set('toJSON', {
  //   getters: true,
  //   virtuals: true
  // });

  // webhooks.set('toObject', {
  //   getters: true,
  //   virtuals: true
  // });

  return mongooseClient.model('webhooks', webhooks);
};
