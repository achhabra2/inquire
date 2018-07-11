const superagent = require('superagent');
const logger = require('../../winston');

module.exports = {
  publishWebhook
};

function publishWebhook() {
  return function(context) {
    // Get Webhooks and publish the events
    const resources = ['spaces', 'questions', 'answers'];
    const events = ['create', 'patch', 'remove'];
    const resource = context.path;
    const event = context.method;
    if (resources.indexOf(resource) !== -1 && events.indexOf(event) !== -1) {
      matchWebhookEvents(context);
    }
    return context;
  };
}

async function matchWebhookEvents(context) {
  const resource = context.path;
  const event = context.method;
  const data = context.result;
  try {
    // const query = {
    //   $populate: {
    //     path: 'spaces',
    //     select: '_id'
    //   },
    //   $or: [{ resource: resource }, { resource: 'all' }]
    // };
    let match;
    if (resource === 'spaces') {
      match = context.result._id;
    } else if (resource === 'questions') {
      if (Array.isArray(data) && data.length > 0) {
        match = data[0]._room;
      } else {
        match = data._room;
      }
    }
    const query = {
      spaceId: match,
      $or: [{ resource: resource }, { resource: 'all' }]
    };
    const webhookQuery = await context.app.service('webhooks').find({ query });
    for (const webhook of webhookQuery.data) {
      try {
        await superagent
          .post(webhook.targetUrl)
          .set('Accept', 'application/json')
          .send({ event, resource, data });
      } catch (error) {
        logger.error('Could not post event to webhook url. ');
      }
    }
  } catch (error) {
    logger.error('Error in match webhook event');
  }
}
