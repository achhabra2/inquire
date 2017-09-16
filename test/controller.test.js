const fs = require('fs');
if (fs.existsSync('./.env')) {
  console.log('Found env file');
  const env = require('node-env-file');
  env('./.env');
}

const chai = require('chai');
chai.should();
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.use(require('chai-things'));

const qnaController = require('../src/qnaController');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

describe('Controller ', function () {
  it('Should connect to MongoDB', function (done) {
    if (!mongoose.connection.readyState)
      mongoose.connect(process.env.mongo, {
        useMongoClient: true});
    mongoose.connection.once('open', function () {
      mongoose.connection.readyState.should.equal(1);
      done();
    });
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

describe('Controller Database Functions', function() {
  it('Should GET MOTDs', function() {
    return qnaController.getMotd().should.eventually.be.an('array');
  });
});