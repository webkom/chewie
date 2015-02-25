var express = require('express');
var frontpage = require('../controllers/frontpage');
var isAuthenticated = require('./auth-helpers').isAuthenticated;

var router = express.Router();

router.get('/', isAuthenticated, frontpage.render);

module.exports = router;
