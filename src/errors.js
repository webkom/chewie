var util = require('util');

function ConfigurationError(message) {
  this.message = message ||
    'Please see the README for information about the required environment variables';
}
util.inherits(ConfigurationError, Error);
exports.ConfigurationError = ConfigurationError;

function InvalidHookSignature() {
  this.message = 'Invalid hook signature';
  this.statusCode = 403;
}
util.inherits(InvalidHookSignature, Error);
exports.InvalidHookSignature = InvalidHookSignature;

function IgnoreHookError(message) {
  this.message = message || 'Hook ignored';
  this.statusCode = 200;
}
util.inherits(IgnoreHookError, Error);
exports.IgnoreHookError = IgnoreHookError;

function DeploymentError(message) {
  this.message = message || 'Something went wrong during deployment';
  this.statusCode = 500;
}
util.inherits(DeploymentError, Error);
exports.DeploymentError = DeploymentError;

exports.handleError = function(res, err, statusCode) {
  if (!statusCode) {
    statusCode = err.statusCode ? err.statusCode : 500;
  }

  return res
    .status(statusCode)
    .json(err.payload || {
      name: err.name,
      statusCode: statusCode,
      message: err.message
    });
};
