module.exports = function(controller) {
  // apiai.hears for intents. in this example is 'hello' the intent
  controller.hears(
    [/hello$/i, /\s*?hello$/i],
    'direct_message,direct_mention',
    function(bot, message) {
      var mdMessage =
        'Welcome. I am the *Inquire Bot*. I will help you ask questions and get answers! Please refer to the ``help`` command for more information. ';
      bot.reply(message, {
        markdown: mdMessage
      });
    }
  );
};
