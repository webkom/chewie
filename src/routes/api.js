var express = require('express');
var errorHandler = require('express-error-middleware');
var hooks = require('../controllers/hooks');
var publicKey = require('../controllers/public_key');

var router = express.Router();

router.post('/github', hooks.github);

router.get('/public-key', publicKey.getPublicKey);

router.use(errorHandler.NotFoundMiddleware);
router.use(errorHandler.ApiErrorsMiddleware);

module.exports = router;
