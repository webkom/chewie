var Bluebird = require('bluebird');
var path = require('path');
var util = require('util');
var fs = require('fs');
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
  this.projectConfig = config.PROJECTS[project];
  this.options = options || {};
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
  this.projectConfig.tasks.deploy.forEach(function (task) {
    tasks.push('cd ' + this.projectConfig.path + ' && ' + task);
  }.bind(this));

  var sshOptions = {
    host: this.projectConfig.hostname,
    username: this.projectConfig.user,
    onStdout: onStdout,
    onStderr: onStderr,
    debug: true
  };
  if (config.SSH_PASSWORD) {
    sshOptions.password = config.SSH_PASSWORD;
  } else {
    sshOptions.privateKey = fs.readFileSync(config.PATH_TO_PRIVATE_KEY);
  }
  return ssh
    .connect(sshOptions)
    .then(function (connection) {
      return connection.exec(tasks);
    }.bind(this))
    .spread(function (code, stdout, stderr) {
      this.success = code === 0;

      if (this.success) {
        this.emit('done');
        this.report();
      } else {
        var error = new errors.DeploymentError(this.stderr);
        this.emit('done', error);
      }

      this.notify();
    }.bind(this));
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
    redisHandler
      .reportDeployment(this.project, this.deploymentStatus())
      .return(true);
  }

  return Bluebird.resolve(false);
};

module.exports = Deployment;
