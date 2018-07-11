const logger = require('../../../winston');
const fs = require('fs');
const path = require('path');
const {
  formatGroupAnswer,
  formatGroupQuestion,
  formatPersonAnswer,
  formatPersonQuestion
} = require('../templates/responses');

// eslint-disable-next-line no-unused-vars
const mdError = fs.readFileSync(
  path.resolve(__dirname, '../templates/error.md'),
  'utf8'
);

module.exports = function(controller) {
  // remove html formatting for Spark Messages
  // eslint-disable-next-line no-useless-escape
  const reg1 = /(\<p\>)/i;
  // eslint-disable-next-line no-useless-escape
  const reg2 = /(\<\/p\>)/i;
  // eslint-disable-next-line no-useless-escape
  const reg3 = /(\<spark\-mention\sdata\-object\-type\=\"person\"\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\>)/gi;
  // eslint-disable-next-line no-useless-escape
  const sparkMentionReverse = /(\<spark\-mention\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\sdata\-object\-type\=\"person\"\>)/gi;
  // eslint-disable-next-line no-useless-escape
  const reg4 = /(\<\/spark-mention\>)/gi;
  const reg5 = new RegExp(controller.bot_name, 'gi');
  // eslint-disable-next-line no-useless-escape
  const regArray = [/(answer|\/a\/?)(?:\s+)?(\d+)\s+(?:\-\s+)?(.+.*)$/i];
  // eslint-disable-next-line no-useless-escape
  const onBehalf = /(.*)\/b\s+\<spark\-mention\sdata\-object\-type\=\"person\"\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\>.*\<\/spark-mention\>\s+(.*)/i;
  // eslint-disable-next-line no-useless-escape
  const onBehalfReverse = /(.*)\/b\s+\<spark\-mention\sdata\-object\-id=\"([a-zA-Z0-9\-]*)\"\sdata\-object\-type\=\"person\"\>.*\<\/spark-mention\>\s+(.*)/i;

  // Handler for Answers
  controller.on('direct_mention', function(bot, message) {
    logger.info('Received message: ', message.text);
    let match;
    for (let reg of regArray) {
      match = reg.exec(message.text);
      if (match) break;
    }

    logger.info('RegEx Match: ', match);
    let link = controller.public_address + '/#/space/' + message.channel;
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
      logger.info('Handling Answer message', message.text);
      controller.utils
        .handleAnswer(message)
        .then(({ question, space }) => {
          logger.info('Handled Answer');
          let questioner = question.personId;
          const sequence = question.sequence;
          const answerer =
            question.answers[question.answers.length - 1].displayName;
          const questionText = question.html || question.text;
          const answer =
            question.answers[question.answers.length - 1].html ||
            question.answers[question.answers.length - 1].text;
          const answerMessage = formatPersonAnswer({
            answer,
            question: questionText,
            answerer,
            sequence,
            questioner: question.displayName,
            space: space.displayName
          });
          bot.send(
            {
              toPersonId: questioner,
              text: answerMessage,
              markdown: answerMessage
            },
            // eslint-disable-next-line no-unused-vars
            (err, message) => {
              if (err) logger.error(err);
              logger.info('Answer sent successfully.');
            }
          );

          const mdMessage = formatGroupAnswer({ link });
          logger.info('Received Answer');
          bot.reply(message, {
            markdown: mdMessage
          });
        })
        .catch(err => {
          logger.error(err);
          bot.reply(message, {
            markdown: 'Sorry there was an error processing your answer. '
          });
        });
    } else {
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

      controller.utils
        .handleQuestion(message)
        .then(result => {
          if (result) {
            const questioner = message.user;
            const sequence = result.question.sequence;
            const question = message.html || message.text;
            const mdMessage = formatGroupQuestion({
              questioner,
              link,
              sequence
            });
            const personalMessage = formatPersonQuestion({
              question,
              sequence,
              space: result.space.displayName
            });
            bot.reply(message, {
              markdown: mdMessage
            });
            bot.startPrivateConversation(message, (error, convo) => {
              if (error) logger.error(error);
              convo.say({
                text: personalMessage,
                markdown: personalMessage
              });
            });
          } else {
            let errorMsg = 'Sorry there was an error processing your request.';
            bot.reply(message, {
              markdown: errorMsg
            });
          }
        })
        .catch(err => {
          logger.error(err);
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
          let link = controller.public_address + '/#/space/' + message.channel;
          let mdLink = `[here](${link})`;
          if (response.data.length > 0) {
            mdMessage = 'Here are the last 10 unanswered questions: <br>';
            response.data.forEach((doc, index) => {
              mdMessage += `<blockquote>Q #**${doc.sequence}**: _${
                doc.text
              }_ by ${doc.displayName}.</blockquote>`;
              if (index == 9) {
                mdMessage += `Click ${mdLink} for more. `;
              }
            });
          } else {
            mdMessage = 'There are no unanswered questions in this Space.';
          }
          bot.startPrivateConversation(message, (error, convo) => {
            if (error) logger.error(error);
            convo.say({
              text: mdMessage,
              markdown: mdMessage
            });
          });
        });
    }
  );

  controller.on('user_space_join', function(bot, data) {
    controller.utils.handleSpaceJoin(data);
    logger.info('Person Joined', data.channel);
  });
  controller.on('user_space_leave', function(bot, data) {
    controller.utils.handleSpaceJoin(data);
    logger.info('Person Left', data.channel);
  });

  controller.on('bot_space_join', function(bot, data) {
    logger.info('Bot joined space', data.channel);
    controller.utils.handleSpaceJoin(data);
  });

  controller.on('bot_space_leave', function(bot, data) {
    logger.info('Bot left space:', data.channel);
    controller.utils.handleSpaceLeave(data);
  });
};
