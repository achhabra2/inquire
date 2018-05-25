// Initializes the `questions` service on path `/questions`
const createService = require('feathers-mongoose');
const request = require('superagent');
const createModel = require('../../models/questions.model');
const hooks = require('./questions.hooks');
const { formatPersonAnswer } = require('../botkit/templates/responses');

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
    if (context.params && context.data.$push) {
      try {
        const spaceId = context.params.query._room;
        const result = await context.app.service('questions').find({
          query: {
            _room: spaceId,
            answered: true,
            $limit: 0
          }
        });
        let spaceData = {
          answerCount: result.total
        };
        await context.app.service('spaces').patch(spaceId, spaceData);
        console.log('Successfully updated answer count for:', spaceId);
      } catch (error) {
        console.error('Could not update answer count');
      }
    }
    if (context.params && context.params.user && context.data.$push) {
      let answerer = question.answers[question.answers.length - 1].personEmail;
      let questioner = question.personEmail;
      let link =
        context.app.get('public_address') + '/#/space/' + question._room;
      let questionText = question.text;
      let answerText = question.answers[question.answers.length - 1].text;
      const markdown = formatPersonAnswer({
        questioner,
        answerer,
        question: questionText,
        answer: answerText
      });
      let roomNotification = `
      <blockquote class="info">
      Question **${question.sequence}** has been answered by 
      <@personEmail:${answerer}>: 
      `;
      if (answerText.length < 160) {
        roomNotification += `${answerText} </blockquote>`;
      } else {
        roomNotification += `click [here](${link}) to view. </blockquote>`;
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
      }__: <br><blockquote class="info">${question.text}</blockquote>`;
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
    updateQuestionCount(question, context);
    if (context.params && context.params.user) {
      const token = app.get('access_token');
      const markdown = `**Q #${question.sequence}** has been asked by __${
        question.displayName
      }__: <br><blockquote class="info">${question.text}</blockquote>`;
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
    updateQuestionCount(question, context);
    if (context.params && context.params.user) {
      const token = app.get('access_token');
      const markdown = `
      <blockquote class="info">**Q #${question.sequence}** has been removed. 
      </blockquote>
      `;
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

async function updateQuestionCount(question, context) {
  try {
    const spaceId = question._room;
    const result = await context.app.service('questions').find({
      query: {
        _room: spaceId,
        $limit: 0
      }
    });
    let spaceData = {
      questionCount: result.total
    };
    await context.app.service('spaces').patch(spaceId, spaceData);
    console.log('Successfully updated question count for:', spaceId);
  } catch (error) {
    console.error('Could not update answer count');
  }
}
