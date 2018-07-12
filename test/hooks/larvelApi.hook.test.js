require('chai').should();
const {
  parseQuery,
  formatPagination,
  addAnchorTag
} = require('../../src/services/questions/laravelApi.hook');

const context_after = require('./fixtures/questions_context_after');

describe('ParseQuery hook', () => {
  it('Runs Parse Query', async () => {
    const context = {
      params: {
        query: {
          page: 1,
          $sort: 'createdOn',
          $search: 'test'
        }
      }
    };

    const result = await parseQuery()(context);
    result.params.query.should.be.an('object');
    result.params.query.should.have.property('$skip');
    result.params.query.should.have.property('$sort');
    result.params.query.should.have.property('$text');
  });
});

describe('formatPagination hook', () => {
  it('Runs formatPagination', async () => {
    const result = await formatPagination()(context_after);
    result.dispatch.should.be.an('object');
    result.dispatch.should.have.property('from');
    result.dispatch.should.have.property('to');
    result.dispatch.should.have.property('current_page');
    result.dispatch.should.have.property('last_page');
    result.dispatch.should.have.property('per_page');
    result.dispatch.should.have.property('next_page_url');
    result.dispatch.should.have.property('prev_page_url');
    result.dispatch.should.have.property('limit');
    result.dispatch.should.have.property('skip');
    result.dispatch.should.have.property('total');
  });
});

describe('addAnchor hook', () => {
  it('Runs AddAnchor', async () => {
    const context = {
      data: {
        html: 'Test html message https://www.cisco.com'
      }
    };
    const result = await addAnchorTag()(context);
    result.data.should.be.an('object');
    result.data.should.have.property('html');
  });

  it('Runs addAnchor on Answer', async () => {
    const context = {
      data: {
        $push: {
          answers: {
            html: 'Test html message https://www.cisco.com'
          }
        }
      }
    };

    const result = await addAnchorTag()(context);
    result.data.should.be.an('object');
    result.data.$push.answers.should.have.property('html');
  });
});
