var express = require('express');
var passport = require('passport');
var router = express.Router();

router.route('/login')
  .get(function(req, res) {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
