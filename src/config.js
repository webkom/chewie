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
  PASSPORT_STRATEGY_OPTIONS: process.env.PASSPORT_STRATEGY_OPTIONS || {},
  REDIS: process.env.REDIS,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_DB: process.env.REDIS_DB || 1,
};

if (process.env.DEFAULT_TASKS) {
  config.DEFAULT_TASKS = JSON.parse(process.env.DEFAULT_TASKS);
} else {
  config.DEFAULT_TASKS = {
    deploy: ['make production'],
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
  projects = require(configFilePath);
  for (var project in projects) {
    if (projects[project].hasOwnProperty('tasks')) {
      _.merge(projects[project].tasks, config.DEFAULT_TASKS);
    } else {
      projects[project].tasks = config.DEFAULT_TASKS;
    }
  }
  return projects;
}

config.PROJECTS = loadProjectConfigurations();
module.exports = config;
