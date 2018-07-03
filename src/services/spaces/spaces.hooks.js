const { authenticate } = require('@feathersjs/authentication').hooks;
const spaceMembership = require('./spaceMembership.hook');

module.exports = {
  before: {
    all: [authenticate('jwt'), spaceMembership],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
