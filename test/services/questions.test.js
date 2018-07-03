const assert = require('assert');
const app = require('../../src/app');

describe('\'questions\' service', () => {
  it('registered the service', () => {
    const service = app.service('questions');

    assert.ok(service, 'Registered the service');
  });
});
