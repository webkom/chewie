var express = require('express');
var errorHandler = require('express-error-middleware');
var hooks = require('../controllers/hooks');

var router = express.Router();

router.post('/github', hooks.github);

router.use(errorHandler.NotFoundMiddleware);
router.use(errorHandler.ApiErrorsMiddleware);

module.exports = router;
