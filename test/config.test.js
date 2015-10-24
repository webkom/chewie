var chai = require('chai');
var config = require('../src/config');
chai.should();

describe('config', function() {
  it('should assign default tasks', function() {
    config.PROJECTS.chewie.tasks.should.deep.equal(
      config.DEFAULT_TASKS
    );
  });

  it('should not override custom tasks', function() {
    var tasks = config.PROJECTS.differentProject.tasks;
    tasks.deploy[0].should.equal('make deploy');
    tasks.start[0].should.equal(config.DEFAULT_TASKS.start[0]);
    tasks.stop[0].should.equal(config.DEFAULT_TASKS.stop[0]);
    tasks.restart[0].should.equal(config.DEFAULT_TASKS.restart[0]);
  });
});
