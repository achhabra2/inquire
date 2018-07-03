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
function formatGroupAnswer({ link }) {
  const message = `
  <blockquote class="info">Answer logged. Click <a href="${link}">here</a> to view all FAQ.</blockquote>
  `;
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
function formatPersonAnswer({ answer, question, answerer, questioner }) {
  const answerMessage = `
  Hello *${questioner}*! Your question has been answered by **${answerer}**.
  <blockquote class="warning">${question}</blockquote>
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
function formatPersonQuestion({ question }) {
  const message = `
  Your Question has been logged successfully.
  <blockquote class="warning">${question}</blockquote>
  `;
  return message;
}
