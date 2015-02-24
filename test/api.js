var chai = require('chai');
var spies = require('chai-spies');
var request = require('supertest');
var app = require('../src/app');
var messages = require('../src/routes/api').messages;
var Deployment = require('../src/Deployment');
var ghPushFixture = require('./fixtures/github-push');
var ghStatusFailureFixture = require('./fixtures/github-status-failure');
var ghWrongBranchFixture = require('./fixtures/github-wrong-branch');

var expect = chai.expect;
chai.use(spies);

describe('API', function() {
  describe('/github', function() {
    var HASH_EMPTY_PAYLOAD = 'sha1=7876c938d38e99b954b3d839c7bafb343d29e776';
    var HASH_WITH_PAYLOAD = 'sha1=afc5f9b9343a32bdb7c3c5357a9b5aeebe69ebd8';
    var HASH_WITH_STATUS_PAYLOAD = 'sha1=99eb999cad90ad98c78b1affb516b5018954eaa7';
    var HASH_WITH_WRONG_BRANCH_PAYLOAD = 'sha1=a8a62aa8e11029cef4fe0473b7158458f6a84622';

    var deploySpy;
    beforeEach(function() {
      deploySpy = chai.spy(Deployment);
    });

    it('should return 200 when auth succeeds', function(done) {
      request(app).post('/api/github').set('x-hub-signature', HASH_EMPTY_PAYLOAD).expect(200, done);
    });

    it('should not deploy when given incorrect hash', function(done) {
      request(app).post('/api/github').set('x-hub-signature', 'wrong').expect(403).expect('Content-Type', /json/).end(function(err, res) {
        expect(err).to.be.null;
        expect(res.body.status).to.equal(403);
        expect(res.body.error).to.equal('Invalid hook signature.');
        expect(deploySpy).not.to.have.been.called;
        done();
      });
    });

    it('should not deploy if status is failure', function(done) {
      request(app).post('/api/github')
        .set('x-hub-signature', HASH_WITH_STATUS_PAYLOAD)
        .set('x-github-event', 'status')
        .send(ghStatusFailureFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.body.status).to.equal(200);
          expect(res.body.error).to.equal('State is not success, nothing will be done.');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });

    it('should not deploy if event is not status', function(done) {
      request(app).post('/api/github')
        .set('x-hub-signature', HASH_WITH_PAYLOAD)
        .set('x-github-event', 'push')
        .send(ghPushFixture).expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.body.status).to.equal(200);
          expect(res.body.error).to.equal('Not a status event, nothing will be done.');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });

    it('should not deploy if branch is not master', function(done) {
      request(app).post('/api/github')
        .set('x-hub-signature', HASH_WITH_WRONG_BRANCH_PAYLOAD)
        .set('x-github-event', 'status')
        .send(ghWrongBranchFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.body.status).to.equal(200);
          expect(res.body.error).to.equal('Received hook from a different branch than master, nothing will be done.');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });
  });
});
