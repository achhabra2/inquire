'use strict';
const debug = require('debug')('Skills:Question');
const qnaController = require('../qnaController');
// remove html formatting for Spark Messages
const reg1 = /(\<p\>)/i;
const reg2 = /(\<\/p\>)/i;
const reg3 = /(\<spark\-mention\sdata\-object\-type\=\"person\"\sdata\-object\-id=\"([a-zA-Z0-9]*)\"\>)/gi;
const reg4 = /(\<\/spark-mention\>)/gi;
const reg5 = new RegExp(process.env.bot_name, 'i');
const regArray = [/(answer|\/a\/?)(?:\s+)?(\d+)\s+(?:\-\s+)?(\w+.*)$/i]

module.exports = function (controller) {
    controller.on('direct_mention', function (bot, message) {
        // debug( 'Debugging answer: ' )
        // debug( message )
        let match;
        for (let reg of regArray) {
            match = reg.exec(message.text)
            if (match)
                break
        }
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        var filterHtml;
        if (match) {
            if (message.html) {
                filterHtml = message.html.replace(reg5, '').replace(reg4, '').replace(reg3, '').replace(reg1, '').replace(reg2, '');
                // debug( 'HTML Filtering: ' )
                // debug( filterHtml )
                // debug( message.html )
                message.html = filterHtml;
            }
            qnaController.handleAnswer(message).then(response => {
                debug('Handled Answer');
                let questioner = response.personId;
                let question;
                let answer;
                var answerMessage = `Hello <@personEmail:${response.personEmail}>! `;
                answerMessage += `Your question has been responded to by: <@personEmail:${response.answers[response.answers.length - 1].personEmail}>. <br>`;
                if (response.html) {
                    question = response.html
                    answerMessage += `<strong>Q -</strong> ${question}<br>`;
                } else {
                    question = response.text
                    answerMessage += `<strong>Q -</strong> __${question}__ <br>`;
                }
                if (response.answers[response.answers.length - 1].html) {
                    answer = response.answers[response.answers.length - 1].html;
                    answerMessage += `<strong>A -</strong> ${answer}`;
                } else {
                    answer = response.answers[response.answers.length - 1].text
                    answerMessage += `<strong>A -</strong> **${answer}**. `;
                }

                bot.send({
                    toPersonId: questioner,
                    text: answerMessage,
                    markdown: answerMessage
                }, (err, message) => {
                    if(err) console.error(err)
                    debug('Answer sent successfully.')
                })
                // bot.startPrivateConversationWithPersonId(questioner, (error, convo) => {
                //     if (error)
                //         console.error(error);
                //     convo.say({
                //         text: answerMessage,
                //         markdown: answerMessage
                //     });
                // });
                var mdMessage = `Answer logged. Click ${mdLink} to view all FAQ.`;
                debug('Received Answer');
                bot.reply(message, {
                    markdown: mdMessage
                });
            }).catch(err => {
                console.error(err);
                bot.reply(message, {
                    markdown: 'Sorry there was an error processing your answer. '
                });
            });
        }
    });
    controller.hears([/^\s*?list/i, /\/list/i, /list$/i], 'direct_mention', function (bot, message) {
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        let mdMessage = `<@personEmail:${message.user}> Please click ${mdLink} to view this rooms FAQ. `;
        bot.reply(message, {
            markdown: mdMessage
        });
    });
    controller.hears([/^\s*?open/i, /\/open/i, /open$/i], 'direct_mention', function (bot, message) {
        qnaController.listQuestions(message.channel, 'unanswered').then(response => {
            let mdMessage;
            let questioner = message;
            let link = process.env.public_address + '/public/#/space/' + message.channel;
            let mdLink = `[here](${link})`;
            if (response.docs.length > 0) {
                mdMessage = `<@personEmail:${message.user}> Here are the last 10 unanswered questions: <br>`;
                response.docs.forEach((doc, index) => {
                    mdMessage += `Question **${doc.sequence}**: _${doc.text}_ by ${doc.displayName}.<br>`;
                    if (index == 9) {
                        mdMessage += `Click for ${mdLink}. `
                    }
                });
            } else {
                mdMessage = 'There are no unanswered questions in this Space.';
            }
            bot.startPrivateConversation(message, (error, convo) => {
                if (error)
                    console.error(error);
                convo.say({
                    text: mdMessage,
                    markdown: mdMessage
                });
            });
        })
    });
    controller.hears(/^(.*)/i, 'direct_mention', function (bot, message) {
        for (let reg of regArray) {
            match = reg.exec(message.text)
            if (match)
                break
        }
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        var personalMessage;
        var mdMessage;
        var filterHtml;
        let questioner = message.user;
        if (!match) {
            if (message.html) {
                filterHtml = message.html.replace(reg5, '').replace(reg4, '').replace(reg3, '').replace(reg1, '').replace(reg2, '');
                message.html = filterHtml;
                personalMessage = `<strong>Q - </strong>` + `${message.html}`;
            } else {
                personalMessage = `<strong>Q - </strong>` + `__${message.text}__`;
            }
            // debug( 'Debugging' )
            // debug( message )
            qnaController.handleQuestion(message).then(room => {
                if (room) {
                    personalMessage += ' has been logged. '
                    mdMessage = `Answer <@personEmail:${message.user}>'s ? ${mdLink} or with: <code>@${process.env.bot_name} /a ${room.sequence} [your response].</code> `;
                    bot.reply(message, {
                        markdown: mdMessage
                    });
                    bot.startPrivateConversation(message, (error, convo) => {
                        if (error)
                            console.error(error);
                        convo.say({
                            text: personalMessage,
                            markdown: personalMessage
                        });
                    });
                    debug('Handled question successfully. ');
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
    controller.on('user_space_join', function (bot, data) {
        qnaController.handleMembershipChange(data)
        debug('Person Joined')
    });
    controller.on('user_space_leave', function (bot, data) {
        debug('Person Left')
        qnaController.handleMembershipChange(data)
    });
    controller.hears(/^dbstats/i, 'direct_message', function (bot, message) {
        qnaController.getDbStats().then(stats => {
            bot.reply(message, {
                markdown: 'DBStats: ' + `<br> Questions: ${stats.questions} <br> Spaces: ${stats.spaces}`
            });
        })
            .catch(err => {
                bot.reply(message, {
                    markdown: 'Error getting DB Stats'
                });
            })
    })
}
