/* eslint-disable no-unused-vars */
const express = require('@feathersjs/express');
const request = require('request');
const logger = require('../../winston');

module.exports = function(app) {
  const router = express.Router();

  // const contents =
  //   'Y2lzY29zcGFyazovL3VzL0NPTlRFTlQvODY0NWM4MTAtYjE2YS0xMWU4LTgxZGUtYjVmZDhlMDg1ZTY4LzA';

  router.get('*', (req, res) => {
    const token = app.get('access_token');
    if (req.query && req.query.contents) {
      const contents = req.query.contents;
      const options = {
        uri: `https://api.ciscospark.com/v1/contents/${contents}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      request(options).pipe(res);
    } else {
      res.status(400).send('Unspecified contents');
    }
  });

  return router;
};
