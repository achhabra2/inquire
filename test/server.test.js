const chai = require('chai');
const sinon = require('sinon');

chai.should();

const request = require('supertest');
var app = require('../src/server');

const helloJSON = {
  "id": "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svMjYzODJlZTktZjhhMC00MDlmLTg2NjUtNTk3MjAxZjBhYWU3",
  "name": "Cisco Spark bot created with Botkit, override me before going to production",
  "targetUrl": "https://83876270.ngrok.io/ciscospark/receive",
  "resource": "messages",
  "event": "created",
  "orgId": "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi8xZWI2NWZkZi05NjQzLTQxN2YtOTk3NC1hZDcyY2FlMGUxMGY",
  "createdBy": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS84ZjAxZDc0NS04MWY0LTQ2NWItYWZlNi05MDViNjEwNjVjNzU",
  "appId": "Y2lzY29zcGFyazovL3VzL0FQUExJQ0FUSU9OL0MzMmM4MDc3NDBjNmU3ZGYxMWRhZjE2ZjIyOGRmNjI4YmJjYTQ5YmE1MmZlY2JiMmM3ZDUxNWNiNGEwY2M5MWFh",
  "ownedBy": "creator",
  "status": "active",
  "created": "2017-03-24T18:25:37.904Z",
  "actorId": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS84ZjAxZDc0NS04MWY0LTQ2NWItYWZlNi05MDViNjEwNjVjNzU",
  "data": {
      "id": "Y2lzY29zcGFyazovL3VzL01FU1NBR0UvZWM2MTYwYTAtOWEyZC0xMWU3LTkyZGUtM2I4N2U3MWI5OTJj",
      "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vYTM3Yjk0YjEtZDJkNi0zNzY4LTljZTgtMDRiMTliOTQxZjk2",
      "roomType": "direct",
      "personId": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS84ZjAxZDc0NS04MWY0LTQ2NWItYWZlNi05MDViNjEwNjVjNzU",
      "personEmail": "samurai@sparkbot.io",
      "created": "2017-09-15T15:52:48.810Z"
  }
};

describe('Bot Server', function () {
  this.timeout(5000);
  before(function (done) {
    setTimeout(function(){
      done();
    }, 4000);
  });
  it('Has an access token', function () {
    chai.expect(process.env.CISCOSPARK_ACCESS_TOKEN).to.equal(process.env.access_token);
  });
  it('Should respond to GET /', function () {
    return request(app)
      .get('/')
      .expect(302);
  });
  it('Should respond to Incoming Webhook', function () {
    return request(app)
      .post('/ciscospark/receive')
      .set('accept', 'json')
      .send(helloJSON)
      .expect(200)
  });
});