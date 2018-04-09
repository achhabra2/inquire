// Initializes the `motds` service on path `/motds`
const createService = require('feathers-mongoose');
const createModel = require('../../models/motds.model');
const hooks = require('./motds.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'motds',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/motds', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('motds');

  service.hooks(hooks);
};
