var redisHandler = require('../redis');
var config = require('../config');

exports.render = function(req, res, next) {
  var context = { projects: require(config.SERVER_CONFIG_FILE) };

  redisHandler.getProjects()
    .then(function(projects) {
      for (var key in projects) {
        if (context.projects.hasOwnProperty(key)) {
          context.projects[key].status = JSON.parse(projects[key]);
        }
      }

      res.render('index', context);
    })
    .catch(next);
};
