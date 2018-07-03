const assert = require('assert');
const app = require('../../src/app');

describe('\'motds\' service', () => {
  it('registered the service', () => {
    const service = app.service('motds');

    assert.ok(service, 'Registered the service');
  });
});
