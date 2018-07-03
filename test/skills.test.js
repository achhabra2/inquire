const chai = require('chai');
chai.should();

const sinon = require('sinon');
// const expect = chai.expect;

describe('Hello Skills Test', function() {
  it('Should respond to Hello', function() {
    let mdMessage =
      'Welcome. I am the *Inquire Bot*. I will help you ask questions and get answers! Please refer to the ``help`` command for more information. ';
    let bot = {
      reply: function() {}
    };
    let mBot = sinon.mock(bot);
    let controller = {
      hears: function(string1, string2, callback) {}
    };
    let message = 'Hello';
    let mController = sinon.mock(controller);
    mController
      .expects('hears')
      .once()
      .withArgs(sinon.match.array, sinon.match.string, sinon.match.func)
      .yields(bot, message);
    mBot
      .expects('reply')
      .withArgs(sinon.match.string, sinon.match({ markdown: mdMessage }));
    const hello = require('../src/services/botkit/skills/hello')(controller);
    mBot.verify();
    mController.verify();
  });
});

describe('Help Skills Test', function() {
  it('Should respond to Help', function() {
    let bot = {
      reply: function() {},
      startPrivateConversation: function() {}
    };
    let mBot = sinon.mock(bot);
    let controller = {
      hears: function(string1, string2, callback) {}
    };
    let message = 'Hello';
    let mController = sinon.mock(controller);
    mController
      .expects('hears')
      .atLeast(2)
      .withArgs(sinon.match.array, sinon.match.string, sinon.match.func)
      .yields(bot, message);
    mBot
      .expects('reply')
      .atLeast(2)
      .withArgs(
        sinon.match.string,
        sinon.match({ markdown: sinon.match.string })
      );
    mBot
      .expects('startPrivateConversation')
      .withArgs(sinon.match.string, sinon.match.func);
    const hello = require('../src/services/botkit/skills/help')(controller);
    mBot.verify();
    mController.verify();
  });
});
