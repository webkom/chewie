#!/usr/bin/env node

require('colors');

try {
  var chewie = require('./dist/index');
  module.export = chewie;
} catch(e) {
  if (e.code == 'MODULE_NOT_FOUND') {
    console.log('You need to run make parse'.red);
  } else {
    throw e; 
  }
}
