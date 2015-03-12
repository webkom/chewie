var util = require('util');

function ConfigurationError(message) {
  this.message = message ||
    'Please see the README for information about the required environment variables';
}
util.inherits(ConfigurationError, Error);
exports.ConfigurationError = ConfigurationError;

function InvalidHookSignature() {
  this.message = 'Invalid hook signature';
  this.status = 403;
}
util.inherits(InvalidHookSignature, Error);
exports.InvalidHookSignature = InvalidHookSignature;

function IgnoreHookError(message) {
  this.message = message || 'Hook ignored';
  this.status = 200;
}
util.inherits(IgnoreHookError, Error);
exports.IgnoreHookError = IgnoreHookError;

function DeploymentError(message) {
  this.message = message || 'Something went wrong during deployment';
  this.status = 500;
}
util.inherits(DeploymentError, Error);
exports.DeploymentError = DeploymentError;

function UnknownProjectError(project) {
  this.message = 'There is no configuration for project "' + project + '"';
  this.status = 200;
}
util.inherits(UnknownProjectError, Error);
exports.UnknownProjectError = UnknownProjectError;
