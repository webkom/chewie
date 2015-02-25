var Bluebird = require('bluebird');
var path = require('path');
var util = require('util');
var childProcess = require('child_process');
var EventEmitter = require('eventemitter3');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('./config');
var notify = require('./notify');
var notifyError = notify.notifyError;
var notifySuccess = notify.notifySuccess;

var client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);
var python = path.resolve('venv', 'bin', 'python');
var deployScript = path.resolve('deploy.py');

function Deployment(project, options) {
  this.stdout = '';
  this.stderr = '';
  this.success = null;
  this.project = project;
  this.options = options || {};
}
util.inherits(Deployment, EventEmitter);

Deployment.prototype.run = function() {
  var proc = childProcess.spawn(python, [deployScript, this.project]);
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
    this.emit('done', this.success);
    this.notify();
    if (this.success) {
      this.report();
    }
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
    return client
      .selectAsync(config.REDIS_DB).bind(this)
      .then(function() {
        return client.hsetAsync('chewie:projects', this.project, JSON.stringify(this.deploymentStatus()));
      })
      .then(function() {
        return client.publishAsync('chewie:pubsub:deployments', JSON.stringify(this.deploymentStatus()));
      });
  }

  return Bluebird.resolve();
};

module.exports = Deployment;
