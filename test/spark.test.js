// const env = require( 'node-env-file' );
// env( './.env' );
// process.env.CISCOSPARK_ACCESS_TOKEN = process.env.access_token;
// const CiscoSpark = require('ciscospark/env');
// const chai = require('chai');
// chai.should();

// describe('Spark Tests', function() {
//   this.timeout(5000);
//   it('Has an access token', function () {
//     chai.expect(process.env.CISCOSPARK_ACCESS_TOKEN).to.equal(process.env.access_token);
//   });
//   it('Can Get ME', function(done) {
//     // console.log(CiscoSpark);
//     CiscoSpark.people.get('me').then(res => {
//       done();
//     })
//     .catch(err => {
//       done(err);
//     })
//   });
//   let personId = 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9kODhiZDc1ZS1iOGMzLTQ4Y2YtYWJjNy01ZWM1Y2JjNzU4YWM';
//   it('Can get a person', function() {
//     return CiscoSpark.people.get(personId).then(res => {
//       res.id.should.equal(personId);
//     });
//   });
//   it('Custom User Query ', function () {
//     const request = require('superagent');
//     return request.get(`https://api.ciscospark.com/v1/people/${personId}`)
//     .set('Authorization', `Bearer ${process.env.access_token}`)
//     .then(res => {
//       res.body.id.should.equal(personId)
//     })
//   });
// });