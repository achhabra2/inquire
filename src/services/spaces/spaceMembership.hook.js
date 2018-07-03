module.exports = function spaceMemberships(context) {
  if (context.params && context.params.user) {
    const query = {
      $select: [
        '_id',
        'displayName',
        'lastActivity',
        'teamId',
        'teamName',
        'sequence',
        'moderators',
        'answerCount',
        'questionCount',
        'sticky'
      ],
      memberships: {
        $in: [context.params.user.ciscosparkId]
      },
      $sort: {
        lastActivity: -1
      }
    };
    context.params.query = Object.assign({}, context.params.query, query);
  }

  return context;
};
