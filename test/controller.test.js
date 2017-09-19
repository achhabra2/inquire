// require('dotenv').config()

const chai = require('chai');
chai.should();

chai.use(require('chai-things'));
chai.use(require("chai-as-promised"));

const qnaController = require('../src/qnaController');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

describe('Controller ', function () {
  it('Should connect to MongoDB', function (done) {
    if (!mongoose.connection.readyState)
      mongoose.connect(process.env.mongo, {
        useMongoClient: true
      });
    mongoose.connection.once('open', function () {
      mongoose.connection.readyState.should.equal(1);
      done();
    });
    if(mongoose.connection.readyState == 1) 
    done();
  });
});

describe('Function: Format Text', function () {
  it('Should remove bot name from message.text', function () {
    let message = {
      text: `${process.env.bot_name} test`
    }
    qnaController.formatText(message).text.should.equal(' test')
  });
});

describe('Function: MOTD', function () {
  let testMotd;
  const Motd = require('../src/motdModel');
  before(function () {
    testMotd = new Motd({
      message: 'Test Message'
    });
    return testMotd.save();
  });
  it('Should GET MOTDs', function () {
    return qnaController.getMotd().should.eventually.contain.an.item.with.property('message', 'Test Message');
  });
  after(function() {
    return Motd.remove(testMotd);
  });
});