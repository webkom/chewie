var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var checkEnv = require('check-env');
var ConfigurationError = require('./errors').ConfigurationError;

checkEnv(['SERVER_CONFIG_FILE', 'HOOK_TOKEN']);

config = {
  HOOK_TOKEN: process.env.HOOK_TOKEN,
  SLACK_URL: process.env.SLACK_URL,
  SLACK_CHANNEL: process.env.SLACK_CHANNEL,
  PASSPORT_STRATEGY: process.env.PASSPORT_STRATEGY,
  REDIS: process.env.REDIS,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_DB: process.env.REDIS_DB || 1,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  PATH_TO_PRIVATE_KEY: process.env.PATH_TO_PRIVATE_KEY || path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.ssh/id_rsa')
};

if (process.env.PASSPORT_STRATEGY_OPTIONS) {
  config.PASSPORT_STRATEGY_OPTIONS = JSON.parse(process.env.PASSPORT_STRATEGY_OPTIONS);
} else {
  config.PASSPORT_STRATEGY_OPTIONS = {};
}

if (process.env.DEFAULT_TASKS) {
  config.DEFAULT_TASKS = JSON.parse(process.env.DEFAULT_TASKS);
} else {
  config.DEFAULT_TASKS = {
    deploy: ['git fetch', 'git reset --hard origin/master', 'make production'],
    restart: ['make restart'],
    start: ['make start'],
    stop: ['make stop']
  };
}

function loadProjectConfigurations() {
  var configFilePath = path.resolve(process.env.SERVER_CONFIG_FILE);
  if (!fs.existsSync(configFilePath)) {
    throw new ConfigurationError('Can\'t find a file at the given SERVER_CONFIG_FILE-path');
  }
  var projects = require(configFilePath);
  _.each(projects, function(project) {
    project.tasks = project.tasks || {};
    _.defaults(project.tasks, config.DEFAULT_TASKS);
  });

  return projects;
}

config.PROJECTS = loadProjectConfigurations();
module.exports = config;
