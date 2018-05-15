// Initializes the `questions` service on path `/questions`
const createService = require('feathers-mongoose');
const request = require('superagent');
const createModel = require('../../models/questions.model');
const hooks = require('./questions.hooks');

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'questions',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/questions', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('questions');

  service.hooks(hooks);

  service.on('patched', async (question, context) => {
    const token = app.get('access_token');
    if (context.params && context.params.user && context.data.$push) {
      let answerer = question.answers[question.answers.length - 1].personEmail;
      let link =
        context.app.get('public_address') + '/#/space/' + question._room;
      let markdown = `Hello <@personEmail:${question.personEmail}>! `;
      markdown += `Your question has been responded to by: <@personEmail:${answerer}>. <br>`;
      let questionText = question.text;
      let answerText = question.answers[question.answers.length - 1].text;
      markdown += `<strong>Q -</strong> ${questionText}<br>`;
      markdown += `<strong>A -</strong> ${answerText}`;
      let roomNotification = `Question **${
        question.sequence
      }** has been answered by <@personEmail:${answerer}>: `;
      if (answerText.length < 160) {
        roomNotification += `${answerText}`;
      } else {
        roomNotification += `click [here](${link}) to view.`;
      }
      try {
        await request
          .post('https://api.ciscospark.com/v1/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({ toPersonEmail: question.personEmail, markdown: markdown });
        await request
          .post('https://api.ciscospark.com/v1/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: question._room, markdown: roomNotification });
      } catch (error) {
        console.error(error);
        console.error('Could not send update message');
      }
    } else if (!context.data.$push) {
      let markdown = `**Q #${question.sequence}** has been edited by __${
        question.displayName
      }__: <br><blockquote>${question.text}</blockquote>`;
      try {
        await request
          .post('https://api.ciscospark.com/v1/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: question._room, markdown: markdown });
      } catch (error) {
        console.error(error);
        console.error('Could not send update message');
      }
    }
  });
  service.on('created', async (question, context) => {
    if (context.params && context.params.user) {
      const token = app.get('access_token');
      const markdown = `**Q #${question.sequence}** has been asked by __${
        question.displayName
      }__: <br><blockquote>${question.text}</blockquote>`;
      try {
        await request
          .post('https://api.ciscospark.com/v1/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: question._room, markdown: markdown });
      } catch (error) {
        console.error(error);
        console.error('Could not send update message');
      }
    }
  });
  service.on('removed', async (question, context) => {
    if (context.params && context.params.user) {
      const token = app.get('access_token');
      const markdown = `**Q #${question.sequence}** has been removed.`;
      try {
        await request
          .post('https://api.ciscospark.com/v1/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: question._room, markdown: markdown });
      } catch (error) {
        console.error(error);
        console.error('Could not send update message');
      }
    }
  });
};
