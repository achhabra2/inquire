const logger = require('winston');
const Debug = require('debug');

const debug = Debug('botkit:skills:question');

module.exports = function(controller) {
  // remove html formatting for Spark Messages
  const reg1 = /(\<p\>)/i;
  const reg2 = /(\<\/p\>)/i;
  const reg3 = /(\<spark\-mention\sdata\-object\-type\=\"person\"\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\>)/gi;
  const sparkMentionReverse = /(\<spark\-mention\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\sdata\-object\-type\=\"person\"\>)/gi;
  const reg4 = /(\<\/spark-mention\>)/gi;
  const reg5 = new RegExp(controller.bot_name, 'gi');
  const regArray = [/(answer|\/a\/?)(?:\s+)?(\d+)\s+(?:\-\s+)?(.+.*)$/i];
  const onBehalf = /(.*)\/b\s+\<spark\-mention\sdata\-object\-type\=\"person\"\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\>.*\<\/spark-mention\>\s+(.*)/i;
  const onBehalfReverse = /(.*)\/b\s+\<spark\-mention\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\sdata\-object\-type\=\"person\"\>.*\<\/spark-mention\>\s+(.*)/i;

  // Handler for Answers
  controller.on('direct_mention', function(bot, message) {
    logger.log('Received message: ', message.text);
    let match;
    for (let reg of regArray) {
      match = reg.exec(message.text);
      if (match) break;
    }
    // if (message.data.hasOwnProperty('files') && message.data.files.length > 0) {
    //   console.log('files received', message.data.files);
    //   message.html += '<br/>Attachments:';
    //   message.data.files.forEach((file, index) => {
    //     message.html += `<a href="${file}">File${index + 1}</a>`;
    //   });
    // }
    logger.log('RegEx Match: ', match);
    let link = controller.public_address + '/#/space/' + message.channel;
    let mdLink = `[here](${link})`;
    let filterHtml;
    if (message.html) {
      message.raw_html = message.html;
      filterHtml = message.html
        .replace(reg5, '')
        .replace(reg4, '')
        .replace(sparkMentionReverse, '')
        .replace(reg3, '')
        .replace(reg1, '')
        .replace(reg2, '');
      message.html = filterHtml;
    }
    if (match) {
      console.log('Handling Answer message', message.text);
      controller.utils
        .handleAnswer(message)
        .then(response => {
          debug('Handled Answer');
          let questioner = response.personId;
          let question;
          let answer;
          var answerMessage = `Hello <@personEmail:${response.personEmail}>! `;
          answerMessage += `Your question has been responded to by: <@personEmail:${
            response.answers[response.answers.length - 1].personEmail
          }>. <br>`;
          if (response.html) {
            question = response.html;
            answerMessage += `<strong>Q -</strong> ${question}<br>`;
          } else {
            question = response.text;
            answerMessage += `<strong>Q -</strong> __${question}__ <br>`;
          }
          if (response.answers[response.answers.length - 1].html) {
            answer = response.answers[response.answers.length - 1].html;
            answerMessage += `<strong>A -</strong> ${answer}`;
          } else {
            answer = response.answers[response.answers.length - 1].text;
            answerMessage += `<strong>A -</strong> **${answer}**. `;
          }

          bot.send(
            {
              toPersonId: questioner,
              text: answerMessage,
              markdown: answerMessage
            },
            (err, message) => {
              if (err) console.error(err);
              debug('Answer sent successfully.');
            }
          );

          var mdMessage = `Answer logged. Click ${mdLink} to view all FAQ.`;
          debug('Received Answer');
          bot.reply(message, {
            markdown: mdMessage
          });
        })
        .catch(err => {
          console.error(err);
          bot.reply(message, {
            markdown: 'Sorry there was an error processing your answer. '
          });
        });
    } else {
      let personalMessage;
      let mdMessage;
      if (onBehalf.test(message.raw_html)) {
        let behalfMatch = onBehalf.exec(message.raw_html);
        message.html = behalfMatch[3];
        message.text = behalfMatch[3];
        message.data.personId = behalfMatch[2];
      } else if (onBehalfReverse.test(message.raw_html)) {
        let behalfMatch = onBehalfReverse.exec(message.raw_html);
        message.html = behalfMatch[3];
        message.text = behalfMatch[3];
        message.data.personId = behalfMatch[2];
      }
      if (message.html) {
        personalMessage = '<strong>Q - </strong>' + `${message.html}`;
      } else {
        personalMessage = '<strong>Q - </strong>' + `__${message.text}__`;
      }
      // debug( 'Debugging' )
      // debug( message )
      controller.utils
        .handleQuestion(message)
        .then(room => {
          if (room) {
            personalMessage += ' has been logged. ';
            mdMessage = `Answer <@personEmail:${
              message.user
            }>'s ? ${mdLink} or with: <code>@${controller.bot_name} /a ${
              room.sequence
            } [your response].</code> `;
            bot.reply(message, {
              markdown: mdMessage
            });
            bot.startPrivateConversation(message, (error, convo) => {
              if (error) console.error(error);
              convo.say({
                text: personalMessage,
                markdown: personalMessage
              });
            });
            //   debug('Handled question successfully. ');
          } else {
            let errorMsg = 'Sorry there was an error processing your request.';
            bot.reply(message, {
              markdown: errorMsg
            });
          }
        })
        .catch(err => {
          console.error(err);
          let errorMsg = 'Sorry there was an error processing your request. ';
          bot.reply(message, {
            markdown: errorMsg
          });
        });
    }
  });

  // Handler for List command
  controller.hears(
    [/^\s*?list/i, /\/list/i, /list$/i],
    'direct_mention',
    function(bot, message) {
      let link = controller.public_address + '/#/space/' + message.channel;
      let mdLink = `[here](${link})`;
      let mdMessage = `<@personEmail:${
        message.user
      }> Please click ${mdLink} to view this rooms FAQ. `;
      bot.reply(message, {
        markdown: mdMessage
      });
    }
  );

  // Handler for Open Command
  controller.hears(
    [/^\s*?open/i, /\/open/i, /open$/i],
    'direct_mention',
    function(bot, message) {
      controller.utils
        .listQuestions(message.channel, 'unanswered')
        .then(response => {
          let mdMessage;
          let questioner = message;
          let link = controller.public_address + '/#/space/' + message.channel;
          let mdLink = `[here](${link})`;
          if (response.data.length > 0) {
            mdMessage = `<@personEmail:${
              message.user
            }> Here are the last 10 unanswered questions: <br>`;
            response.data.forEach((doc, index) => {
              mdMessage += `Question **${doc.sequence}**: _${doc.text}_ by ${
                doc.displayName
              }.<br>`;
              if (index == 9) {
                mdMessage += `Click ${mdLink} for more. `;
              }
            });
          } else {
            mdMessage = 'There are no unanswered questions in this Space.';
          }
          bot.startPrivateConversation(message, (error, convo) => {
            if (error) console.error(error);
            convo.say({
              text: mdMessage,
              markdown: mdMessage
            });
          });
        });
    }
  );

  controller.on('user_space_join', function(bot, data) {
    controller.utils.handleMembershipChange(data);
    debug('Person Joined');
  });
  controller.on('user_space_leave', function(bot, data) {
    controller.utils.handleMembershipChange(data);
    debug('Person Left');
  });

  controller.on('bot_space_join', function(bot, data) {
    debug('Bot joined space');
    controller.utils.handleSpaceJoin(data);
  });

  controller.on('bot_space_leave', function(bot, data) {
    debug('Bot left space');
    controller.utils.handleSpaceLeave(data);
  });
};
