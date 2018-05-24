module.exports = function(controller) {
  // apiai.hears for intents. in this example is 'hello' the intent
  const helpLink = `[here](${controller.public_address}/#/help)`;
  const mdMessage = `
  I cannot understand you unless I am @Mentioned, please remember! 
  My commands are: <br>
  1. \`\`{Your Question}?\`\` - Start by adding me to a room and tagging me with your question.  
  **eg: @Inquire What color is the sky?** <br>
  2. \`\`/a or answer\`\` Type in answer or /a followed by the question number followed by your response to answer an open question.   
  **eg: @Inquire /a 101 The Sky is Blue.**<br>
  3. \`\`list\`\` - Type the list command to receive a web link to view a dynamically created FAQ page with all the questions and answers. <br>
  4. \`\`open\`\` - List open ended / unanswered questions in the current Spark Space. <br>
  5. \`\`/b @person {Your Question}\`\` - Ask a question **on behalf** of someone else. <br>
  **eg: @Inquire /b @John Smith What color is the sky?** <br>
  6. \`\`/sticky {Your Sticky Message}\`\` - Add or update a sticky post to your FAQ page. <br> 
  **eg: @Inquire /sticky Taco Tuesday!!**<br>
  7. \`\`/update\`\` - Force Inquire to update the space memberships, moderators, and title. <br>
  Do not forget to tag me before each command! **@Mention @Mention @Mention!** Happy FAQing. <br>
  For the full help page click ${helpLink}. 
  `;
  controller.hears(['help$', 's*?help$'], 'direct_message', function(
    bot,
    message
  ) {
    bot.reply(message, {
      markdown: mdMessage
    });
  });
  controller.hears(['help$', 's*?help$'], 'direct_mention', function(
    bot,
    message
  ) {
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
