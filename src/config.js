var fs = require('fs');
var path = require('path');
var checkEnv = require('check-env');
var ConfigurationError = require('./errors').ConfigurationError;

checkEnv(['SERVER_CONFIG_FILE', 'HOOK_TOKEN']);

function configFile() {
  var configFilePath = path.resolve(process.env.SERVER_CONFIG_FILE);
  if (!fs.existsSync(configFilePath)) {
    throw new ConfigurationError('Can\'t find a file at the given SERVER_CONFIG_FILE-path');
  }

  return configFilePath;
}

module.exports = {
  HOOK_TOKEN: process.env.HOOK_TOKEN,
  SLACK_URL: process.env.SLACK_URL,
  SLACK_CHANNEL: process.env.SLACK_CHANNEL,
  PASSPORT_STRATEGY: process.env.PASSPORT_STRATEGY,
  PASSPORT_STRATEGY_OPTIONS: process.env.PASSPORT_STRATEGY_OPTIONS || {},
  SERVER_CONFIG_FILE: configFile(),
  REDIS: process.env.REDIS,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_DB: process.env.REDIS_DB || 1
};
