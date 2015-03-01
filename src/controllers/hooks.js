var crypto = require('crypto');
var config = require('../config');
var Deployment = require('../Deployment');
var errors = require('../errors');

function deploy(project, res, next) {
  var deployment = new Deployment(project, {
    source: 'webhook'
  });

  deployment
    .run()
    .then(function (err) {
      res.json({
        status: 200,
        output: deployment.stdout
      });
    })
    .catch(function (err) {
        return next(err);
    });
}

exports.github = function(req, res, next) {
  var payload = req.body;
  var signature = req.headers['x-hub-signature'];
  var hmac = crypto.createHmac('sha1', config.HOOK_TOKEN);
  hmac.setEncoding('hex');
  hmac.write(JSON.stringify(payload));
  hmac.end();

  var correct = 'sha1=' + hmac.read();

  if (signature !== correct) {
    return next(new errors.InvalidHookSignature());
  }

  var error;
  if (req.headers['x-github-event'] !== 'status') {
    error = new errors.IgnoreHookError('Not a status event, nothing will be done');
    return next(error);
  }

  if (payload.state !== 'success') {
    error = new errors.IgnoreHookError('State is not success, nothing will be done');
    return next(error);
  }

  if (payload.branches[0].name !== 'master') {
    error = new errors.IgnoreHookError(
      'Received hook from a different branch than master, nothing will be done'
    );
    return next(error);
  }

  deploy(payload.repository.name, res, next);
};
