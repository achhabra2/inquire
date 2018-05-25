module.exports = {
  formatGroupAnswer,
  formatGroupQuestion,
  formatPersonAnswer,
  formatPersonQuestion
};

function formatGroupAnswer({ link }) {
  const message = `
  <blockquote class="info">Answer logged. Click <a href="${link}">here</a> to view all FAQ.</blockquote>
  `;
  return message;
}

function formatGroupQuestion({ questioner, link, sequence }) {
  const mdMessage = `
  <blockquote class="info">
  Answer <@personEmail:${questioner}>'s ? <a href="${link}">here</a> or with: 
  <code>@Inquire /a ${sequence} [your response].</code> 
  </blockquote>`;
  return mdMessage;
}

function formatPersonAnswer({ answer, question, answerer, questioner }) {
  const answerMessage = `
  Hello <@personEmail:${questioner}>! Your question has been answered. 
  <blockquote class="warning">${question}</blockquote>
  <blockquote class="success"><@personEmail:${answerer}>: ${answer}</blockquote>
  `;
  return answerMessage;
}

function formatPersonQuestion({ question }) {
  const message = `
  Your Question has been logged successfully.
  <blockquote class="warning">${question}</blockquote>
  `;
  return message;
}
