'use strict';

const qnaController = require( '../qnaController' );
// Connection Strings to MongoDB Instance
const reg1 = /(\<p\>)/i;
const reg2 = /(\<\/p\>)/i;
const reg3 = /(\<spark\-mention.*Inquire\<\/spark-mention\>)/i;


module.exports = function ( controller ) {
    controller.hears( [ '/a', '^\s*?answer', 'Inquire(.*)answer(.+)' ], 'direct_message,direct_mention', function ( bot, message ) {
        // console.log( 'Debugging answer: ' )
        // console.log( message )
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;

        var filterHtml;
        if ( message.original_message.html ) {
            filterHtml = message.original_message.html.replace( reg3, '' ).replace( reg1, '' ).replace( reg2, '' );
            message.original_message.html = filterHtml;
        }
        qnaController.handleAnswer( message ).then( response => {
            console.log( 'Handled Answer' );
            let questioner = response.personId;
            let question;
            let answer;
            var answerMessage = `Hello <@personEmail:${response.personEmail}>! `;
            answerMessage += `Your question has been responded to by: <@personEmail:${response.answers[response.answers.length-1].personEmail}>. <br>`;
            if ( response.html ) {
                question = response.html
                answerMessage += `Original Question: ${question}<br>`;
            } else {
                question = response.text
                answerMessage += `Original Question: __${question}__ <br>`;
            }
            if ( response.answers[ response.answers.length - 1 ].html ) {
                answer = response.answers[ response.answers.length - 1 ].html;
                answerMessage += `Answer: ${answer}`;
            } else {
                answer = response.answers[ response.answers.length - 1 ].text
                answerMessage += `Answer: **${answer}**. `;
            }
            bot.startPrivateConversationWithPersonId( questioner, ( error, convo ) => {
                if ( error )
                    console.error( error );
                convo.say( {
                    text: answerMessage,
                    markdown: answerMessage
                } );
            } );
            var mdMessage = `Ok <@personEmail:${message.user}> `;
            mdMessage += `your answer has been logged. Click ${mdLink} to view FAQ.`;
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
    controller.hears( [ '^\s*?list', '\/list', 'list$' ], 'direct_message,direct_mention', function ( bot, message ) {
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        let mdMessage = `<@personEmail:${message.user}> Please click ${mdLink} to view this rooms FAQ. `;
        bot.reply( message, {
            markdown: mdMessage
        } );
    } );
    controller.hears( [ '^\s*?open', '\/open', 'open$' ], 'direct_message,direct_mention', function ( bot, message ) {
        qnaController.listQuestions( message.channel, 'unanswered' ).then( response => {
            let mdMessage;
            let link = process.env.public_address + '/public/#/space/' + message.channel;
            let mdLink = `[here](${link})`;
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
        let link = process.env.public_address + '/public/#/space/' + message.channel;
        let mdLink = `[here](${link})`;
        var personalMessage;
        var mdMessage = `Ok <@personEmail:${message.user}> `
        var filterHtml;
        if ( message.original_message.html ) {
            filterHtml = message.original_message.html.replace( reg3, '' ).replace( reg1, '' ).replace( reg2, '' );
            message.original_message.html = filterHtml;
            personalMessage = `Your question: ` + `${ message.original_message.html }`;
        } else {
            personalMessage = `Your question: ` + `__${ message.text }__`;
        }
        let questioner = message.original_message.personId;
        qnaController.handleQuestion( message ).then( room => {
                if ( room ) {
                    personalMessage += ' has been logged. '
                    mdMessage += ' ? was logged as #: ' + `**${room.sequence}**`;
                    mdMessage += `<br>To answer this question please reply ${mdLink} or with: answer or <code>@Inquire /a ${room.sequence} [your response].</code> `;
                    bot.reply( message, {
                        markdown: mdMessage
                    } );
                    bot.startPrivateConversationWithPersonId( questioner, ( error, convo ) => {
                        if ( error )
                            console.error( error );
                        convo.say( {
                            text: personalMessage,
                            markdown: personalMessage
                        } );
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
    controller.on( 'user_space_join', function ( bot, data ) {
        qnaController.handleMembershipChange( data )
        console.log( 'Person Joined' )
    } );
    controller.on( 'user_space_leave', function ( bot, data ) {
        console.log( 'Person Left' )
        qnaController.handleMembershipChange( data )
    } );
}
