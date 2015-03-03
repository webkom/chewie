/* jshint expr: true */
var chai = require('chai');
var spies = require('chai-spies');
var request = require('supertest');
var Bluebird = require('bluebird');
var app = require('../src/app');
var Deployment = require('../src/Deployment');
var ghPushFixture = require('./fixtures/github-push.json');
var ghStatusSuccessFixture = require('./fixtures/github-status-success.json');
var ghStatusFailureFixture = require('./fixtures/github-status-failure.json');
var ghWrongBranchFixture = require('./fixtures/github-wrong-branch.json');

var expect = chai.expect;
chai.use(spies);

describe('API', function() {
  describe('/github', function() {
    var hash = {
      empty: 'sha1=7876c938d38e99b954b3d839c7bafb343d29e776',
      payload: 'sha1=afc5f9b9343a32bdb7c3c5357a9b5aeebe69ebd8',
      wrongStatus: 'sha1=99eb999cad90ad98c78b1affb516b5018954eaa7',
      correctStatus: 'sha1=d167d37201caf04118a96982080827898c969163',
      wrongBranch: 'sha1=a8a62aa8e11029cef4fe0473b7158458f6a84622'
    };

    var deploySpy;
    beforeEach(function() {
      //Deployment.prototype.run = Bluebird.method(function() { return true; });
      deploySpy = chai.spy(Deployment.prototype.run);
    });

    it('should deploy with a correct payload', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', hash.correctStatus)
        .set('x-github-event', 'status')
        .send(ghStatusSuccessFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.status).to.equal(200);
          expect(deploySpy).to.have.been.called;
          done();
        });
    });

    it('should return 200 when auth succeeds', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', hash.empty)
        .expect(200, done);
    });

    it('should not deploy when given incorrect hash', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', 'wrong')
        .expect(403)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          var error = res.body;
          expect(error.statusCode).to.equal(403);
          expect(error.message).to.equal('Invalid hook signature');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });

    it('should not deploy if status is failure', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', hash.wrongStatus)
        .set('x-github-event', 'status')
        .send(ghStatusFailureFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          var error = res.body;
          expect(error.statusCode).to.equal(200);
          expect(error.message).to.equal('State is not success, nothing will be done');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });

    it('should not deploy if event is not status', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', hash.payload)
        .set('x-github-event', 'push')
        .send(ghPushFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          var error = res.body;
          expect(error.statusCode).to.equal(200);
          expect(error.message).to.equal('Not a status event, nothing will be done');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });

    it('should not deploy if branch is not master', function(done) {
      request(app)
        .post('/api/github')
        .set('x-hub-signature', hash.wrongBranch)
        .set('x-github-event', 'status')
        .send(ghWrongBranchFixture)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          var error = res.body;
          expect(error.statusCode).to.equal(200);
          expect(error.message).to.equal('Received hook from a different branch than master, nothing will be done');
          expect(deploySpy).not.to.have.been.called;
          done();
        });
    });
  });
});
