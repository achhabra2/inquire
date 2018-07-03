const logger = require('winston');
const Debug = require('debug');
const anchorme = require('anchorme').default;

const debug = Debug('botkit:skills:sticky');
const stickyMatch = /(.*)\/sticky\s?(.*)(<\/p>)?/i;

const anchormeOptions = {
  truncate: [15, 15],
  attributes: [
    {
      name: 'target',
      value: '_blank'
    }
  ]
};

module.exports = function(controller) {
  controller.hears([/\/sticky/i], 'direct_mention', async (bot, message) => {
    if (message.html) {
      const result = stickyMatch.exec(message.html);
      message.html = result[2];
    } else {
      message.html = message.text;
    }
    const html = message.html;
    message.html = anchorme(html, anchormeOptions);
    const rights = await controller.utils.checkModerator(message);
    let reply = {};
    if (rights) {
      try {
        await controller.utils.updateSticky(message);
        reply.markdown = 'Updated sticky post.';
      } catch (error) {
        reply.markdown = 'Error updating sticky.';
      }
    } else {
      reply.markdown = 'You do not have rights to update the sticky post. ';
    }
    bot.reply(message, reply);
  });
};
