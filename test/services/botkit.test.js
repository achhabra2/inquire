const assert = require('assert');
const app = require('../../src/app');

describe('\'botkit\' service', () => {
  it('registered the service', () => {
    const service = app.service('ciscospark/receive');

    assert.ok(service, 'Registered the service');
  });
});
