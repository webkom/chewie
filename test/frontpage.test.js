var chai = require('chai');
var Bluebird = require('bluebird');
var request = require('supertest');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('../src/config');
var app = require('../src/app');

var expect = chai.expect;
var client = redis.createClient();

describe('Frontpage', function() {
  var deploymentStatus = {
    project: 'chewie',
    commit: 'testcommit',
    timestamp: Date.now(),
    success: true
  };

  beforeEach(function() {
    return client.flushallAsync()
      .then(function() {
        return client.selectAsync(config.REDIS_DB);
      })
      .then(function() {
        return client.hsetAsync(
          'chewie:projects',
          'chewie',
          JSON.stringify(deploymentStatus)
        );
      });
  });

  it('should render with projects as context', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.text).to.contain(deploymentStatus.commit);
        expect(res.text).to.contain(deploymentStatus.timestamp);
        done();
      });
  });
});
