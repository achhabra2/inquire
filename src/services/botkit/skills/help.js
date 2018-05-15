module.exports = function(controller) {
  // apiai.hears for intents. in this example is 'hello' the intent
  const helpLink = `[here](${controller.public_address}/#/help)`;
  controller.hears(['help$', 's*?help$'], 'direct_message', function(
    bot,
    message
  ) {
    var mdMessage = 'My commands are: <br>';
    mdMessage +=
      '1. ``[Your Question]?`` - Start by adding me to a room and tagging me with your question.  ';
    mdMessage += 'eg: What color is the sky? <br>';
    mdMessage +=
      '2. ``/a or answer`` Type in answer or /a followed by the question number followed by your response to answer an open question. ';
    mdMessage += 'eg: answer 101 The Sky is Blue. <br>';
    mdMessage +=
      '3. ``list`` - Type the list command to receive a web link to view a dynamically created FAQ page with all the questions and answers. <br>';
    mdMessage +=
      '4. ``open`` - List open ended / unanswered questions in the current Spark Space. <br>';
    mdMessage += 'Do not forget to tag me before each command! Happy FAQing. ';
    let shortHelp = `For the full help page click ${helpLink}. `;
    mdMessage += shortHelp;
    bot.reply(message, {
      markdown: mdMessage
    });
  });
  controller.hears(['help$', 's*?help$'], 'direct_mention', function(
    bot,
    message
  ) {
    var mdMessage = 'My commands are: <br>';
    mdMessage +=
      '1. ``[Your Question]?`` - Start by adding me to a room and tagging me with a sentence ending in ? to log your question. ';
    mdMessage += 'eg: What color is the sky? <br>';
    mdMessage +=
      '2. ``/a or answer`` Type in answer or /a followed by the question number followed by your response to answer an open question. ';
    mdMessage += 'eg: answer 101 The Sky is Blue. <br>';
    mdMessage +=
      '3. ``list`` - Type the list command to receive a web link to view a dynamically created FAQ page with all the questions and answers. <br>';
    mdMessage +=
      '4. ``open`` - List open ended / unanswered questions in the current Spark Space. <br>';
    mdMessage += 'Do not forget to tag me before each command! Happy FAQing. ';
    bot.startPrivateConversation(message, (error, convo) => {
      if (error) console.error(error);
      convo.say({
        text: mdMessage,
        markdown: mdMessage
      });
    });
    let shortHelp = `Help has been sent to you individually. For the full help page click ${helpLink}. `;
    bot.reply(message, {
      markdown: shortHelp
    });
  });
};
