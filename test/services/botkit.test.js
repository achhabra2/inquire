const assert = require('assert');
const app = require('../../src/app');
const rp = require('request-promise');
const url = require('url');

const port = app.get('port') || 3030;
const getUrl = pathname =>
  url.format({
    hostname: app.get('host') || 'localhost',
    protocol: 'http',
    port,
    pathname
  });

const body = {
  id:
    'Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjRlNjA1NjAtNjYwMi00ZmIwLWEyNWEtOTQ5ODgxNjA5NDk3',
  name: 'New message in \'Project Unicorn\' room',
  resource: 'messages',
  event: 'created',
  filter:
    'roomId=Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0',
  orgId: 'OTZhYmMyYWEtM2RjYy0xMWU1LWExNTItZmUzNDgxOWNkYzlh',
  createdBy:
    'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mNWIzNjE4Ny1jOGRkLTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY',
  appId:
    'Y2lzY29zcGFyazovL3VzL0FQUExJQ0FUSU9OL0MyNzljYjMwYzAyOTE4MGJiNGJkYWViYjA2MWI3OTY1Y2RhMzliNjAyOTdjODUwM2YyNjZhYmY2NmM5OTllYzFm',
  ownedBy: 'creator',
  status: 'active',
  actorId:
    'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mNWIzNjE4Ny1jOGRkLTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY',
  data: {
    id:
      'Y2lzY29zcGFyazovL3VzL01FU1NBR0UvOTJkYjNiZTAtNDNiZC0xMWU2LThhZTktZGQ1YjNkZmM1NjVk',
    roomId:
      'Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0',
    personId:
      'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mNWIzNjE4Ny1jOGRkLTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY',
    personEmail: 'matt@example.com',
    created: '2015-10-18T14:26:16.000Z'
  }
};

describe('\'botkit\' service', () => {
  before(function(done) {
    this.server = app.listen(port);
    this.server.once('listening', () => done());
  });

  after(function(done) {
    this.server.close(done);
  });

  it('Responds to POST Requests', () => {
    return rp({
      method: 'POST',
      uri: getUrl('ciscospark/receive'),
      body: body,
      json: true,
      resolveWithFullResponse: true
    }).then(res => {
      assert.equal(res.statusCode, 200);
    });
  });
});
