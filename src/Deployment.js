var Bluebird = require('bluebird');
var path = require('path');
var util = require('util');
var fs = Bluebird.promisifyAll(require('fs'));
var EventEmitter = require('eventemitter3');
var ssh = require('promised-ssh');
var config = require('./config');
var notify = require('./notify');
var errors = require('./errors');
var redisHandler = require('./redis');
var notifyError = notify.notifyError;
var notifySuccess = notify.notifySuccess;

function Deployment(project, options) {
  this.stdout = '';
  this.stderr = '';
  this.success = null;
  this.project = project;
  this.options = options;
  if (project in config.PROJECTS) {
    this.projectConfig = config.PROJECTS[project];
  } else {
    throw new errors.UnknownProjectError(project);
  }
}

util.inherits(Deployment, EventEmitter);

Deployment.prototype.run = function run() {
  var onStdout = function onStdout(data) {
    this.stdout += data;
    this.emit('stdout', data);
  }.bind(this);

  var onStderr = function onStderr(data) {
    this.stderr += data;
    this.emit('stderr', data);
  }.bind(this);

  var tasks = [];
  this.projectConfig.tasks.deploy.forEach(function(task) {
    tasks.push('cd ' + this.projectConfig.path + ' && ' + task);
  }.bind(this));
  return fs
    .readFileAsync(config.PATH_TO_PRIVATE_KEY)
    .bind(this)
    .then(function(key) {
      return ssh.connect({
        host: this.projectConfig.hostname,
        username: this.projectConfig.user,
        onStdout: onStdout,
        onStderr: onStderr,
        debug: true,
        privateKey: key
      });
    })
    .then(function(connection) {
      return connection.exec(tasks);
    })
    .spread(function(code, stdout, stderr) {
      this.success = code === 0;
      this.emit('done');
    }).catch(function(error) {
      this.success = false;
      this.emit('done', error);
      throw error;
    })
    .finally(function() {
      this.report();
      this.notify();
    });
};

Deployment.prototype.notify = function() {
  if (this.success) {
    notifySuccess(this.project, this.options.source);
  } else {
    notifyError(this.project, this.options.source, this.stderr);
  }
};

Deployment.prototype.commit = function() {
  var match = this.stdout.match(/HEAD is now at ([a-z0-9]{7})/);
  if (match) {
    return match[1];
  }
};

Deployment.prototype.deploymentStatus = function() {
  return {
    project: this.project,
    commit: this.commit(),
    timestamp: Date.now(),
    success: this.success
  };
};

Deployment.prototype.report = function() {
  if (config.REDIS) {
    return redisHandler
      .reportDeployment(this.project, this.deploymentStatus())
      .return(true);
  }

  return Bluebird.resolve(false);
};

module.exports = Deployment;
