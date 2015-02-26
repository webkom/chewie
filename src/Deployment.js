var Bluebird = require('bluebird');
var path = require('path');
var util = require('util');
var childProcess = require('child_process');
var EventEmitter = require('eventemitter3');
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
  this.options = options || {};
}
util.inherits(Deployment, EventEmitter);

Deployment.prototype.python = path.resolve('venv', 'bin', 'python');
Deployment.prototype.deployScript = path.resolve('deploy.py');

Deployment.prototype.run = function() {
  var proc = childProcess.spawn(this.python, [this.deployScript, this.project]);
  proc.stdout.setEncoding('utf8');
  proc.stderr.setEncoding('utf8');

  proc.stdout.on('data', function(data) {
    this.stdout += data;
    this.emit('stdout', data);
  }.bind(this));

  proc.stderr.on('data', function(data) {
    this.stderr += data;
    this.emit('stderr', data);
  }.bind(this));

  proc.on('close', function(code) {
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
