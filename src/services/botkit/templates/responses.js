module.exports = {
  formatGroupAnswer,
  formatGroupQuestion,
  formatPersonAnswer,
  formatPersonQuestion
};

/**
 *
 *
 * @param {string} { link }
 * @returns {string}
 */
function formatGroupAnswer({ link, question }) {
  const message = `
  <blockquote class="info"><p>Answer logged. Click <a href="${link}">here</a> to view all FAQ.</p></blockquote><blockquote class="danger"><p>${question}</p></blockquote>`;
  return message;
}

/**
 *
 *
 * @param {any} { questioner, link, sequence }
 * @returns {string}
 */
function formatGroupQuestion({ questioner, link, sequence }) {
  const mdMessage = `
  <blockquote class="info">
  Answer <@personEmail:${questioner}>'s ? <a href="${link}">here</a> or with: 
  <code>@Inquire /a ${sequence} [your response].</code> 
  </blockquote>`;
  return mdMessage;
}

/**
 *
 *
 * @param {any} { answer, question, answerer, questioner }
 * @returns {string}
 */
function formatPersonAnswer({
  answer,
  question,
  answerer,
  questioner,
  sequence = '',
  space = ''
}) {
  const answerMessage = `
  Your question has been answered by *${answerer}*. <br>
  **${'Q #' + sequence}** ${`&nbsp;in <code>${space}</code>`}: <br>
  <blockquote class="danger">${question}</blockquote>
  <blockquote class="success">${answer}</blockquote>
  `;
  return answerMessage;
}

/**
 *
 *
 * @param {any} { question }
 * @returns {string}
 */
function formatPersonQuestion({ question, sequence = '', space = '' }) {
  const message = `
  Your **${'Q #' +
    sequence}** ${`&nbsp;in <code>${space}</code>`} has been recorded: <br>
  <blockquote class="danger">${question}</blockquote>
  `;
  return message;
}
