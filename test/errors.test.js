var chai = require('chai');
var rewire = require('rewire');
var errors = require('../src/errors');
var expect = chai.expect;

describe('Errors', function() {
  it('should throw an error when SERVER_CONFIG_FILE is an invalid file', function() {
    process.env.SERVER_CONFIG_FILE = 'nonexistantfile';
    function fn() { rewire('../src/config'); }
    expect(fn).to.throw(errors.ConfigurationError, /Can't find a file at the given SERVER_CONFIG_FILE-path/);
  });
});
