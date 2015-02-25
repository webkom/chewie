var slackNotify = require('slack-notify');
var config = require('./config');

var notifySlack = function(type, text, error) {
  if (config.SLACK_URL) {
    var slackGateway = slackNotify(config.SLACK_URL);

    var options = {
      text: text,
      channel: config.SLACK_CHANNEL
    };

    if (error) {
      options.fields = {
        'Error message': error
      };
    }

    slackGateway[type](options);
  }
};

exports.notifySuccess = function(projectName, source) {
  var text = 'Successfully deployed ' + projectName + ' (source: ' + source + ')';
  notifySlack('success', text);
};

exports.notifyError = function(projectName, source, error) {
  var text = 'Failed deploying ' + projectName + ' (source: ' + source + ')';
  notifySlack('alert', text, error);
};
