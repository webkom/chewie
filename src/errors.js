var util = require('util');

function ConfigurationError(message) {
  this.message = message ||
    'Please see the README for information about the required environment variables';
}
util.inherits(ConfigurationError, Error);
exports.ConfigurationError = ConfigurationError;

exports.handleError = function(err, res) {
  res.status(500).json({
    status: 500,
    error: err
  });
};
