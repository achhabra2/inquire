/* eslint-disable no-unused-vars */
// Initializes the `files` service on path `/files`
const createService = require('./files.class.js');

module.exports = function(app) {
  // Initialize our service with any options it requires
  app.use('/files', createService(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('files');
};
