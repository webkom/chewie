var express = require('express');
var passport = require('passport');
var router = express.Router();

router.route('/login')
  .get(function(req, res) {
    res.render('login', { error: req.flash('error') });
  })
  .post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: 'Invalid username or password.'
  }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
