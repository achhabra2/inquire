// eslint-disable-next-line no-unused-vars

const questions = require('./questions/questions.service.js');

const spaces = require('./spaces/spaces.service.js');

const users = require('./users/users.service.js');

const motds = require('./motds/motds.service.js');

const botkit = require('./botkit/botkit.service.js');

const feedback = require('./feedback/feedback.service.js');

module.exports = function(app) {
  app.configure(questions);
  app.configure(spaces);
  app.configure(users);
  app.configure(motds);
  app.configure(botkit);
  app.configure(feedback);
};
