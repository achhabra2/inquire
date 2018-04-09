const { authenticate } = require('@feathersjs/authentication').hooks;
const { parseQuery, formatPagination } = require('./laravelApi.hook');
module.exports = {
  before: {
    all: [authenticate('jwt'), parseQuery()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [formatPagination()],
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
