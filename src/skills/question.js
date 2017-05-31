'use strict';

const qnaController = require( '../qnaController' );
// Connection Strings to MongoDB Instance


module.exports = function ( controller ) {
    controller.hears( [ '/a', '^\s*?answer' ], 'direct_message,direct_mention', function ( bot, message ) {
        qnaController.handleAnswer( message ).then( response => {
            console.log( 'Handled Answer' );
            let questioner = response.personId;
            let question = response.text;
            let answer = response.answers[ response.answers.length - 1 ].text;
            var answerMessage = `Hello <@personEmail:${response.personEmail}>! `;
            answerMessage += `Your question has been responded to by: <@personEmail:${response.answers[response.answers.length-1].personEmail}>. <br>`;
            answerMessage += `Original Question: __${question}__ <br>`;
            answerMessage += `Answer: **${answer}**. `;
            bot.startPrivateConversationWithPersonId( questioner, ( error, convo ) => {
                if ( error )
                    console.error( error );
                convo.say( {
                    text: answerMessage,
                    markdown: answerMessage
                } );
            } );
            var mdMessage = `Ok <@personEmail:${message.user}> `;
            mdMessage += `your has answer been logged.`;
            console.log( 'Received Answer' );
            bot.reply( message, {
                markdown: mdMessage
            } );
        } ).catch( err => {
            console.error( err );
            bot.reply( message, {
                markdown: 'Sorry there was an error processing your answer. '
            } );
        } );
    } );
    controller.hears( [ '^\s*?list' ], 'direct_message,direct_mention', function ( bot, message ) {
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        let mdMessage = `<@personEmail:${message.user}> Please click ${mdLink} to view this rooms FAQ. `;
        bot.reply( message, {
            markdown: mdMessage
        } );
    } );
    controller.hears( [ '^\s*?open' ], 'direct_message,direct_mention', function ( bot, message ) {
        qnaController.listQuestions( message.channel, 'unanswered' ).then( response => {
            let mdMessage;
            let link = process.env.public_address + '/public/#/space/' + message.channel;
            let mdLink = `[more](${link})`;
            if ( response.docs.length > 0 ) {
                mdMessage = `<@personEmail:${message.user}> Here are the last 10 unanswered questions: <br>`;
                response.docs.forEach( ( doc, index ) => {
                    mdMessage += `Question **${doc.sequence}**: _${doc.text}_ by ${doc.displayName}.<br>`;
                    if ( index == 9 ) {
                        mdMessage += `Click for ${mdLink}. `
                    }
                } );
            } else {
                mdMessage = 'There are no unanswered questions in this Spark Space.';
            }
            bot.reply( message, {
                markdown: mdMessage
            } );
        } )
    } );
    controller.hears( '^(.*)', 'direct_message,direct_mention', function ( bot, message ) {
        var mdMessage = `Ok <@personEmail:${message.user}> `;
        mdMessage += `your question: ` + `__${ message.text }__`;
        qnaController.handleQuestion( message ).then( room => {
                if ( room ) {
                    mdMessage += ' has been logged as #: ' + `**${room.sequence}**`;
                    mdMessage += `<br>To answer this question please reply with: answer or /a + ${room.sequence} + your response. `;
                    bot.reply( message, {
                        markdown: mdMessage
                    } );
                    console.log( 'Handled question successfully. ' );
                } else {
                    let errorMsg = 'Sorry there was an error processing your request.';
                    bot.reply( message, {
                        markdown: errorMsg
                    } );
                }
            } )
            .catch( err => {
                console.error( err );
                let errorMsg = 'Sorry there was an error processing your request. ';
                bot.reply( message, {
                    markdown: errorMsg
                } );
            } );
    } );
};
