/* jshint expr: true */
var Bluebird = require('bluebird');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var mSpawn = require('mock-spawn');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('../src/config');
var errors = require('../src/errors');

chai.use(chaiAsPromised);
var expect = chai.expect;
var spawn = mSpawn();
require('child_process').spawn = spawn;

var Deployment = require('../src/Deployment');
spawn.setDefault(spawn.simple(0, 'deploying all the things'));
var client = redis.createClient();

describe('Deployment', function() {
  var deployment;

  beforeEach(function() {
    deployment = new Deployment('chewie', { source: 'tests' });
    return client.flushallAsync();
  });

  describe('.init()', function() {
    it('should set stdout to ""', function() {
      return expect(deployment.stdout).to.equal('');
    });

    it('should set stderr to ""', function() {
      return expect(deployment.stderr).to.equal('');
    });

    it('should set variables from arguments', function() {
      expect(deployment.project).to.equal('chewie');
      expect(deployment.options.source).to.equal('tests');
    });
  });

  describe('.run()', function() {
    beforeEach(function() {
      deployment = new Deployment('src', { source: 'tests' });
    });

    it('should run the test', function(done) {
      deployment.on('done', function() {
        return done();
      });
      deployment.run();
    });

    it('should emit stdout', function(done) {
      var stdout = '';
      deployment.on('stdout', function(data) {
        return stdout += data;
      });
      deployment.on('done', function(err) {
        expect(err).to.not.exist;
        expect(deployment.stdout).to.equal('deploying all the things');
        expect(stdout).to.equal('deploying all the things');
        done();
      });
      deployment.run();
    });

    it('should emit stderr', function(done) {
      var errorOut = 'All the errors';
      spawn.sequence.add(spawn.simple(1, '', errorOut));
      var stderr = '';
      deployment.on('stderr', function(data) {
        return stderr += data;
      });
      deployment.on('done', function(err) {
        expect(deployment.stderr).to.equal(errorOut);
        expect(stderr).to.equal(errorOut);
        expect(err.message).to.equal(errorOut);
        done();
      });
      deployment.run();
    });

    it('should report failure if the command failed', function(done) {
      spawn.sequence.add(spawn.simple(1, '', ''));
      deployment = new Deployment('chewie', { source: 'tests' });
      deployment.on('done', function(err) {
        expect(err).to.be.an.instanceof(errors.DeploymentError);
        done();
      });
      deployment.run();
    });
  });

  describe('.commit()', function() {
    it('should return commit hash from deployment log', function() {
      deployment.stdout = 'HEAD is now at 51567bd Add npm install as frigg task';
      expect(deployment.commit()).to.equal('51567bd');
    });
  });

  describe('.report()', function() {
    it('should save project status in redis', function() {
      deployment.stdout = 'HEAD is now at 51567bd Add npm install as frigg task';
      return deployment
        .report()
        .then(function() {
          return client.selectAsync(3);
        })
        .then(function() {
          return client.hgetAsync('chewie:projects', 'chewie');
        })
        .then(function(value) {
          value = JSON.parse(value);
          expect(value.commit).to.equal('51567bd');
          expect(value.timestamp).to.be.truthy;
        });
    });

    it('should return an empty promise if config.REDIS is false', function() {
      config.REDIS = false;
      return expect(deployment.report()).to.be.fulfilled;
    });
  });
});
