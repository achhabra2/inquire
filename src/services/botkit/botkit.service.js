// Initializes the `botkit` service on path `/ciscospark/receive`
const createService = require('./botkit.class.js');

module.exports = function (app) {

  // Initialize our service with any options it requires
  app.use('/ciscospark/receive', createService(app));

};
