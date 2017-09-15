const env = require( 'node-env-file' );
env( './.env' );

const chai = require('chai');
chai.should();

const qnaController = require('../src/qnaController');


describe('Function: Format Text', function() {
  it('Should remove bot name from message.text', function() {
    let message = {
      text: `${process.env.bot_name} test`
    }    
    qnaController.formatText(message).text.should.equal(' test')
  })
})