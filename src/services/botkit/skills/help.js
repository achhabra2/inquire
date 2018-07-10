const fs = require('fs');
const path = require('path');
const mdHelp = fs.readFileSync(
  path.resolve(__dirname, '../templates/help.md'),
  'utf8'
);
const logger = require('../../../winston');

module.exports = function(controller) {
  // apiai.hears for intents. in this example is 'hello' the intent
  const helpLink = `[here](${controller.public_address}/#/help)`;

  controller.hears(['help$', 's*?help$'], 'direct_message', function(
    bot,
    message
  ) {
    bot.reply(message, {
      markdown: mdHelp
    });
  });
  controller.hears(['help$', 's*?help$'], 'direct_mention', function(
    bot,
    message
  ) {
    bot.startPrivateConversation(message, (error, convo) => {
      if (error) logger.error(error);
      convo.say({
        text: mdHelp,
        markdown: mdHelp
      });
    });
    let shortHelp = `Help has been sent to you individually. For the full help page click ${helpLink}. `;
    bot.reply(message, {
      markdown: shortHelp
    });
  });
};
