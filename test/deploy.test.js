/* eslint no-unused-expressions: 0 */
var Bluebird = require('bluebird');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ssh = require('promised-ssh');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('../src/config');
var errors = require('../src/errors');

chai.use(chaiAsPromised);
var expect = chai.expect;

ssh.connect = ssh.connectMock;
var Deployment = require('../src/Deployment');
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

    it('should throw error if project is not defined in the projects list', function() {
      var create = function() {
        return new Deployment('unknown', { source: 'tests' });
      };

      expect(create).to.throw(errors.UnknownProjectError);
    });
  });

  describe('.run()', function() {
    it('should run the deployment', function() {
      ssh.setMockOptions({ commands: {} });
      return deployment
        .run()
        .then(function() {
          expect(deployment.success).to.be.true;
        });
    });

    it('should emit stdout', function() {
      ssh.setMockOptions({
        commands: {
          'cd /home/chewie/chewie && make production': {
            stdout: 'deploying all the things'
          }
        }
      });

      var stdout = '';
      deployment.on('stdout', function(data) {
        return stdout + data;
      });

      return deployment
        .run()
        .then(function() {
          expect(deployment.stdout).to.equal('deploying all the things');
          expect(stdout).to.equal('deploying all the things');
        });
    });

    it('should emit stderr', function() {
      var errorOut = 'All the errors';
      ssh.setMockOptions({
        commands: {
          'cd /home/chewie/chewie && make production': {
            stderr: errorOut
          }
        }
      });
      var stderr = '';
      deployment.on('stderr', function(data) {
        return stderr + data;
      });

      return deployment
        .run()
        .then(function() {
          expect(deployment.stderr).to.equal(errorOut);
          expect(stderr).to.equal(errorOut);
        });
    });

    it('should handle failure if the deployment fails', function() {
      ssh.setMockOptions({ failConnect: true });

      return deployment
        .run()
        .catch(function(err) {
          expect(err).to.be.an.instanceof(ssh.errors.ConnectionError);
        });
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
      deployment.success = true;
      return deployment
        .report()
        .then(function() {
          return client.selectAsync(3);
        })
        .then(function() {
          return client.hgetAsync('chewie:projects', 'chewie');
        })
        .then(function(value) {
          var parsed = JSON.parse(value);
          expect(parsed.commit).to.equal('51567bd');
          expect(parsed.timestamp).to.be.truthy;
        });
    });

    it('should return an empty promise if config.REDIS is false', function() {
      config.REDIS = false;
      return expect(deployment.report()).to.be.fulfilled;
    });
  });
});
