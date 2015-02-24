var Bluebird = require('bluebird');
var childProcess = require('child_process');
var EventEmitter = require('eventemitter3');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('./config');
var notify = require('./notify');
var notifyError = notify.notifyError;
var notifySuccess = notify.notifySuccess;

var client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);

function Deployment(project, options) {
  this.stdout = '';
  this.stderr = '';
  this.success = null;
  this.project = project;
  this.options = options || {};
}
Deployment.prototype = Object.create(EventEmitter.prototype);
Deployment.prototype.python = process.cwd() + '/venv/bin/python';
Deployment.prototype.deployScript = process.cwd() + '/deploy.py';

Deployment.prototype.run = function() {
  var _this = this;
  var proc = childProcess.spawn(this.python, [this.deployScript, this.project]);
  proc.stdout.setEncoding('utf8');
  proc.stderr.setEncoding('utf8');

  proc.stdout.on('data', function(data) {
    _this.stdout += data;
    _this.emit('stdout', data);
  });

  proc.stderr.on('data', function(data) {
    _this.stderr += data;
    _this.emit('stderr', data);
  });

  proc.on('close', function(code) {
    _this.success = code === 0;
    _this.emit('done', _this.success);
    _this.notify();
    if (_this.success) {
      _this.report();
    }
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
    return client
      .selectAsync(config.REDIS_DB)
      .then(client.hsetAsync('chewie:projects', this.project, JSON.stringify(this.deploymentStatus())))
      .then(client.publish('chewie:pubsub:deployments', JSON.stringify(this.deploymentStatus())));
  }
};

module.exports = Deployment;
