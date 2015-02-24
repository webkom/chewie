var express = require('express');
var crypto = require('crypto');
var config = require('../config');
var Deployment = require('../Deployment');
var handleError = require('./handle-error');
var isAuthenticated = require('./auth-helpers').isAuthenticated;

var router = express.Router();

router.post('/github', function(req, res) {
  var payload = req.body;
  var signature = req.headers['x-hub-signature'];
  var hmac = crypto.createHmac('sha1', config.HOOK_TOKEN);
  hmac.setEncoding('hex');
  hmac.write(JSON.stringify(payload));
  hmac.end();

  var correct = 'sha1=' + hmac.read();

  if (signature === correct) {
    var response = { status: 200 };

    if (req.headers['x-github-event'] !== 'status') {
      response.error = messages.notStatusEvent;
      res.status(200).json(response);
    } else if (payload.state !== 'success') {
      response.error = messages.notSuccess;
      res.status(200).json(response);
    } else if (payload.branches[0].name !== 'master') {
      response.error = messages.notMaster;
      res.status(200).json(response);
    } else {
      deployAndHandle(payload.repository.name, true, res);
    }
  } else {
    res.status(403).json({
      status: 403,
      error: 'Invalid hook signature.'
    });
  }
});

var messages = {
  notMaster: 'Received hook from a different branch than master, nothing will be done.',
  notStatusEvent: 'Not a status event, nothing will be done.',
  notSuccess: 'State is not success, nothing will be done.'
};

var deployAndHandle = function(project, debug, res) {
  var deployment = new Deployment(project, {
    debug: debug,
    source: 'webhook'
  });
  deployment.on('done', function(success) {
    if (success) {
      res.json({
        status: 200,
        output: deployment.stdout
      });
    } else {
      handleError(deployment.error, res);
    }
  });
  deployment.run();
};

module.exports = router;
