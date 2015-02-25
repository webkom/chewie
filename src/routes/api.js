var express = require('express');
var hooks = require('../controllers/hooks');
var errors = require('../errors');

var router = express.Router();

router.post('/github', hooks.github);

router.use(function(err, req, res, next) {
  errors.handleError(res, err);
});

module.exports = router;
