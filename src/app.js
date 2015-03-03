var express = require('express');
var flash = require('express-flash');
var session = require('cookie-session');
var path = require('path');
var logging = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var passport = require('passport');
var passportMemcached = require('passport-memcached');
var config = require('./config');
var api = require('./routes/api');
var index = require('./routes/index');
var auth = require('./routes/auth');

var app = express();

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

app.use(express.static(path.join(__dirname, './public')));
app.use(logging('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  cookie: {
    maxAge: 60000
  },
  secret: 'This is top secret'
}));

passport.serializeUser(passportMemcached.memcachedSerializeUser);
passport.deserializeUser(passportMemcached.memcachedDeserializeUser);

if (config.PASSPORT_STRATEGY) {
  passport.use(require(config.PASSPORT_STRATEGY)(config.PASSPORT_STRATEGY_OPTIONS));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function(req, res, next) {
    res.locals.authenticated = req.isAuthenticated();
    next();
  });
  app.use('/auth', auth);
}

if (process.env.NODE_ENV == 'production') {
  var raven = require('raven');
  app.use(raven.middleware.express(process.env.RAVEN_DSN));
}


app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  err.template = 'error/404';
  next(err);
});

app.use(function(err, req, res, next) {
  var template;
  if (process.env.NODE_ENV === 'production') {
    template = 'error/production';
  } else {
    template = 'error/debug';
  }
  res.status(err.status || 500);
  res.render(err.template || template, {
    message: err.message,
    error: err
  });
});

module.exports = app;
