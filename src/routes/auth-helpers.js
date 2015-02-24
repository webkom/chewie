var config = require('../config');

var isAuthenticated = function(req, res, next) {
  if (!config.PASSPORT_STRATEGY || req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

module.exports = {
  isAuthenticated: isAuthenticated
};
