/* eslint-disable no-unused-vars */
const express = require('@feathersjs/express');
const Botkit = require('botkit');
const Helpers = require('../utils');
const logger = require('../../winston');

module.exports = function(app) {
  const utils = new Helpers(app);
  const router = express.Router();
  // Create the Botkit controller, which controls all instances of the bot.
  const controller = Botkit.sparkbot({
    debug: false,
    logger,
    log: true,
    public_address: app.get('public_address'),
    ciscospark_access_token: app.get('access_token'),
    studio_token: app.get('studio_token'), // get one from studio.botkit.ai to enable content management, stats, message console and more
    secret: app.get('secret'), // this is an RECOMMENDED but optional setting that enables validation of incoming webhooks
    webhook_name: `${app.get('bot_name')} Webhook via Botkit`
  });

  controller.utils = utils;
  controller.public_address = app.get('public_address');
  controller.bot_name = app.get('bot_name');

  const normalizedPath = require('path').join(__dirname, 'skills');
  require('fs')
    .readdirSync(normalizedPath)
    .forEach(function(file) {
      require('./skills/' + file)(controller);
    });

  const bot = controller.spawn({});

  router.post('*', (req, res) => {
    res.sendStatus(200);
    controller.handleWebhookPayload(req, res, bot);
  });

  controller.createWebhookEndpoints(router, bot, function() {
    // debug('Cisco Spark: Webhooks set up!');
  });

  return router;
};
