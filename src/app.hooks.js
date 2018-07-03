// Application hooks that run for every service
const logger = require('./hooks/logger');
const { publishWebhook } = require('./services/webhooks/publish.webhook');

module.exports = {
  before: {
    all: [logger()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [logger()],
    find: [],
    get: [],
    create: [publishWebhook()],
    update: [publishWebhook()],
    patch: [publishWebhook()],
    remove: [publishWebhook()]
  },

  error: {
    all: [logger()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
