const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-authentication-hooks');
const logger = require('../../winston');

function customizeProfile(context) {
  logger.info('Customizing Profile');

  if (context.data.github) {
    context.data.displayName = context.data.github.profile.displayName;
  }

  if (context.data.ciscospark) {
    const {
      avatar = 'none',
      displayName = 'none',
      emails,
      id
    } = context.data.ciscospark.profile;
    context.data._id = id;
    context.data.avatar = avatar;
    context.data.displayName = displayName;
    context.data.email = emails[0];
  }

  // If you want to do something whenever any OAuth
  // provider authentication occurs you can do this.
  if (context.params.oauth) {
    // do something for all OAuth providers
  }

  if (context.params.oauth.provider === 'github') {
    // do something specific to the github provider
  }

  return Promise.resolve(context);
}

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      hooks.restrictToOwner({ idField: '_id', ownerField: '_id' })
    ],
    get: [
      authenticate('jwt'),
      hooks.restrictToOwner({ idField: '_id', ownerField: '_id' })
    ],
    create: [customizeProfile],
    update: [
      authenticate('jwt'),
      customizeProfile,
      hooks.restrictToOwner({ idField: '_id', ownerField: '_id' })
    ],
    patch: [
      authenticate('jwt'),
      customizeProfile,
      hooks.restrictToOwner({ idField: '_id', ownerField: '_id' })
    ],
    remove: [
      authenticate('jwt'),
      hooks.restrictToOwner({ idField: '_id', ownerField: '_id' })
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
