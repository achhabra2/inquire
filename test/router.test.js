const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require("chai-as-promised"));
const sinon = require('sinon');
const request = require('supertest');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const router = require('../src/qnaRouter');
const app = require('express')();

app.use(router);

describe('MongoDB ', function () {
  it('Connection Should Be Open', function (done) {
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

describe('Router: MOTDs', function() {
  let testMotd;
  const Motd = require('../src/motdModel');
  before(function () {
    testMotd = new Motd({
      message: 'Test Message'
    });
    return testMotd.save();
  });

  it('Should GET MOTDs', function() {
    return request(app)
    .get('/motd')
    .expect(200)
    .then(function(res) {
      res.body.should.contain.an.item.with.property('message', 'Test Message');
    })
  });

  after(function() {
    return Motd.remove(testMotd);
  });
})

// describe('Router: Space Functions', function() {
//   it('Should get API Data for a Space', function() {
//     return request(app)
//     .get('/spaces/Y2lzY29zcGFyazovL3VzL1JPT00vOTQ2ZDZlNTAtNTQ2MS0xMWU3LTgwZWYtODE4YzUxYmQyMWQw')
//     .expect(200)
//     .then(function(res) {
//       res.body.should.contain.an.item.with.property('message', 'Test Message');
//     })
//   });
// })