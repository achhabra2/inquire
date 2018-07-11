require('chai').should();

const app = require('../../../src/app');
const Helpers = require('../../../src/services/utils');
const helpers = new Helpers(app);
const mockPerson = require('../fixtures/person');
const mockSpace = require('../fixtures/space');
const mockMessage = require('../fixtures/message_object');
const mockQuestion = require('../fixtures/message_question');
const mockAnswer = require('../fixtures/message_answer');
const mockAnswerRich = require('../fixtures/message_answer_markdown');

describe('Utils Tests', () => {
  before(async function() {
    await app.service('questions').remove(null, {});
    await app.service('spaces').remove(null, {});
    await app.service('webhooks').remove(null, {});
    await app.service('spaces').create(mockSpace);
  });

  it('Can get Spark User Details', async () => {
    const person = await helpers.getPerson(mockPerson._id);
    person.should.be.an('object');
    person.should.have.property('id');
  });

  it('Can Update space Activity', async () => {
    const updatedSpace = await helpers.updateRoomActivity(mockSpace._id);
    updatedSpace.should.be.an('object');
    updatedSpace.should.have.property('lastActivity');
  });

  it('Should get the paginated space memberships', async () => {
    const memberships = await helpers.getMembershipsPaginated(
      undefined,
      mockSpace._id
    );
    memberships.should.be.an('array');
    memberships[0].should.have.property('id');
  });

  it('Should be able to update room memberships', async () => {
    const updatedSpace = await helpers.updateRoomMemberships(mockSpace._id);
    updatedSpace.should.be.an('object');
    updatedSpace.should.have.property('memberships');
  });

  it('Should handle space join event', async () => {
    const data = {
      channel: mockSpace._id
    };
    const space = await helpers.handleSpaceJoin(data);
    space.should.be.an('object');
  });

  it('Should handle space leave event', async () => {
    const data = {
      channel: mockSpace._id
    };
    const space = await helpers.handleSpaceLeave(data);
    space.should.be.an('object');
    space.active.should.equal(false);
  });

  it('Can attach user details to botkit message', async () => {
    const message = await helpers.getUserDetails(mockMessage);
    message.personDisplayName.should.be.a('string');
  });

  it('Should attach space title and team to message object', async () => {
    const message = await helpers.getRoomDetails(mockMessage);
    message.should.have.property('roomTitle');
  });

  it('Can create a space in the database from a botkit message object', async () => {
    const space = await helpers.createRoom(mockMessage);
    space.should.be.an('object');
    space.should.have.property('_id');
    space.should.have.property('orgId');
    space.should.have.property('displayName');
  });

  describe('Add Questions tests', async () => {
    before(async function() {
      await app.service('questions').remove(null, {});
      await app.service('spaces').remove(null, {});
      await helpers.handleSpaceJoin(mockQuestion);
    });

    it('Can handle an incoming question from a botkit message', async () => {
      const response = await helpers.handleQuestion(mockMessage);
      response.question.should.be.an('object');
      response.question.should.include.keys(
        'personEmail',
        'personId',
        'text',
        'displayName',
        'sequence',
        'createdOn',
        '_room'
      );
    });

    it('Can multiple incoming questions for a space', async () => {
      await helpers.handleQuestion(mockMessage);
      const response = await helpers.handleQuestion(mockMessage);
      response.question.should.have.property('sequence');
      response.question.sequence.should.equal(3);
    });

    after(async function() {
      await app.service('questions').remove(null, {});
      await app.service('spaces').remove(null, {});
    });
  });

  describe('Add Answers tests', async () => {
    before(async function() {
      await app.service('questions').remove(null, {});
      await app.service('spaces').remove(null, {});
      await helpers.handleSpaceJoin(mockQuestion);
      await helpers.handleQuestion(mockQuestion);
    });

    it('Can handle an incoming answer from a botkit message', async () => {
      const { question } = await helpers.handleAnswer(mockAnswer);
      question.answers.should.be.an('array').of.length(1);
    });

    it('Can handle an incoming markdown answer from a botkit message', async () => {
      const { question } = await helpers.handleAnswer(mockAnswerRich);
      question.answers.should.be.an('array').of.length(2);
    });
  });

  describe('Searching Tests', async () => {
    before(async function() {
      await app.service('questions').remove(null, {});
      await app.service('spaces').remove(null, {});
      await helpers.handleSpaceJoin(mockQuestion);
      await helpers.handleQuestion(mockQuestion);
      await helpers.handleQuestion(mockQuestion);
      await helpers.handleAnswer(mockAnswer);
    });

    it('Can sort through questions', async () => {
      const questions = await helpers.listQuestions(
        mockAnswer.channel,
        'unanswered'
      );
      questions.data.should.be.an('array').of.length(1);
    });

    it('Can filter by answered questions', async () => {
      const questions = await helpers.listQuestions(
        mockAnswer.channel,
        'answered'
      );
      questions.data.should.be.an('array').of.length(1);
    });

    it('Text searching', async () => {
      let newQuestion = Object.assign({}, mockQuestion, {
        text: 'Can you search me?',
        html: 'Can you search me?'
      });
      await helpers.handleQuestion(newQuestion);
      const questions = await helpers.listQuestions(
        mockAnswer.channel,
        'unanswered',
        'sequence',
        10,
        1,
        'Can you'
      );
      questions.data.should.be.an('array').of.length(1);
      questions.data[0].text.should.equal('Can you search me?');
    });
  });

  after(async function() {
    await app.service('questions').remove(null, {});
    await app.service('spaces').remove(null, {});
  });
});
