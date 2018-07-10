const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');

const oauth2 = require('@feathersjs/authentication-oauth2');
const CiscoSparkStrategy = require('passport-cisco-spark');
const makeHandler = require('./oauth-handler');

module.exports = function(app) {
  const config = app.get('authentication');
  const handler = makeHandler(app);
  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());

  let scopes;
  if (app.get('env') === 'production') {
    scopes = [
      'spark:messages_write',
      'spark:rooms_read',
      'spark:people_read',
      'spark:teams_read'
    ];
  } else {
    scopes = [
      'spark:people_read',
      'spark:messages_read',
      'spark:rooms_read',
      'spark:teams_read'
    ];
    // scopes = ['spark:all'];
  }
  app.configure(
    oauth2(
      Object.assign(
        {
          name: 'ciscospark',
          Strategy: CiscoSparkStrategy,
          clientID: app.get('oauth_client'),
          clientSecret: app.get('oauth_secret'),
          handler: handler(config.ciscospark.successRedirect),
          scope: scopes
        },
        config.ciscospark
      )
    )
  );

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [authentication.hooks.authenticate(config.strategies)],
      remove: [authentication.hooks.authenticate('jwt')]
    }
  });
};
