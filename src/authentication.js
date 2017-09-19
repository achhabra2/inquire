const qnaController = require('./qnaController');

function ensureAuthenticated( req, res, next ) {
  if ( req.isAuthenticated() ) {
      return next();
  }
  res.redirect( authUrl )
}

function ensureAccessRights( req, res, next ) {
  if ( req.params.room ) {
      let roomId = req.params.room;
      let personId = req.user.id;
      qnaController.checkRights( personId, roomId ).then( rights => {
          if ( rights )
              return next()
          else
              res.redirect( errorUrl )
      } )
  } else {
      res.redirect( errorUrl )
  }
}

module.exports = {
  ensureAccessRights,
  ensureAccessRights
}