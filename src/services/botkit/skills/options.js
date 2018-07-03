const logger = require('winston');
const Debug = require('debug');

const debug = Debug('botkit:skills:options');

module.exports = function(controller) {
  controller.hears(
    [/\/mode\s+(.*)/i],
    'direct_mention',
    async (bot, message) => {
      let mode = message.match[1];
      switch (mode) {
      case 'verbose': {
        await controller.utils.switchMode(message.channel, mode);
        let mdMessage = `Space mode has been switched to **${mode}**.`;
        bot.reply(message, { markdown: mdMessage });
        break;
      }
      case 'default': {
        await controller.utils.switchMode(message.channel, mode);
        let mdMessage = `Space mode has been switched to **${mode}**.`;
        bot.reply(message, { markdown: mdMessage });
        break;
      }
      default: {
        let mdMessage = 'Error updating space mode. ';
        bot.reply(message, { markdown: mdMessage });
      }
      }
    }
  );
  controller.hears([/\/update/i], 'direct_mention', async (bot, message) => {
    try {
      await controller.utils.updateRoomMemberships(message.channel);
      await controller.utils.patchRoom(message.channel);
      let mdMessage = 'Memberships updated successfully. ';
      bot.reply(message, { markdown: mdMessage });
    } catch (error) {
      let mdMessage = 'Error: Could not update memberships. ';
      bot.reply(message, { markdown: mdMessage });
    }
  });
};
