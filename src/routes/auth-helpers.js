var config = require('../config');

exports.isAuthenticated = function(req, res, next) {
  if (!config.PASSPORT_STRATEGY || req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};
