const errors = require('@feathersjs/errors');

module.exports = {
  checkRights
};

function checkRights() {
  return async function(context) {
    // const { user } = context.params;
    // context.data.ownerId = user._id;
    // context.data.ownerEmail = user.email;
    if (context.data.filter) {
      const filterSpace = /spaceId=(.*)/i;
      const match = filterSpace.exec(context.data.filter);
      if (match) {
        const spaceId = match[1];
        const query = {
          _id: spaceId,
          memberships: {
            $in: [context.params.user.ciscosparkId]
          }
        };
        try {
          const result = await context.app.service('spaces').find({ query });
          if (result.total > 0) {
            context.data.spaceId = spaceId;
            delete context.filter;
          } else {
            throw new errors.BadRequest(
              'Space not found or you do not have rights to access that space.'
            );
          }
        } catch (error) {
          throw new errors.GeneralError('Could not verify rights. ');
        }
      } else {
        throw new errors.BadRequest(
          'Filter format invalid, please specify spaceId'
        );
      }
    } else {
      throw new errors.BadRequest('Unspecified filter');
    }
    return context;
  };
}
