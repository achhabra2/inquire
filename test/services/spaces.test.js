const assert = require('assert');
require('chai').should();

const app = require('../../src/app');
const mockSpace = require('./fixtures/space');

describe('\'spaces\' service', () => {
  it('registered the service', () => {
    const service = app.service('spaces');

    assert.ok(service, 'Registered the service');
  });

  it('Can find spaces', async () => {
    const spaces = await app.service('spaces').find({});
    spaces.should.have.property('data');
    spaces.data.should.be.an('array');
  });

  it('Can clear all spaces', async () => {
    const spaces = await app.service('spaces').remove(null, {});
    spaces.should.be.an('array');
  });

  it('Can create a space', async () => {
    const space = await app.service('spaces').create(mockSpace);
    space.should.be.an('object');
  });

  it('Can patch a space', async () => {
    const time = new Date(Date.parse('2018-03-31T04:34:11.971Z'));
    const space = await app.service('spaces').patch(mockSpace._id, { lastActivity: time });
    space.should.have.property('lastActivity');
    const lastActivityDate = new Date(Date.parse(space.lastActivity)).toDateString();
    lastActivityDate.should.equal(time.toDateString());
  });

});
