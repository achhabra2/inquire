const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-authentication-hooks');
const { checkRights } = require('./hook.utils');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [hooks.queryWithCurrentUser({ idField: '_id', as: 'ownerId' })],
    get: [hooks.restrictToOwner({ idField: '_id', ownerField: 'ownerId' })],
    create: [
      hooks.associateCurrentUser({ idField: '_id', as: 'ownerId' }),
      checkRights()
    ],
    update: [
      hooks.restrictToOwner({ idField: '_id', ownerField: 'ownerId' }),
      checkRights()
    ],
    patch: [
      hooks.restrictToOwner({ idField: '_id', ownerField: 'ownerId' }),
      checkRights()
    ],
    remove: [hooks.restrictToOwner({ idField: '_id', ownerField: 'ownerId' })]
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
