// Initializes the `spaces` service on path `/spaces`
const createService = require('feathers-mongoose');
const createModel = require('../../models/spaces.model');
const hooks = require('./spaces.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'spaces',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/spaces', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('spaces');

  service.hooks(hooks);
};
