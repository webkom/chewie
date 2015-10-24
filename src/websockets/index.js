var createClient = require('../redis').createClient;
var Deployment = require('../Deployment');

var redisClient = createClient();
redisClient.subscribe('chewie:pubsub:deployments');

var handleDeploy = function(client, project) {
  var deployment = new Deployment(project, {source: 'web-ui'});

  deployment.on('stderr', function(data) {
    return client.emit('deploy_data', data);
  });

  deployment.on('stdout', function(data) {
    return client.emit('deploy_data', data);
  });

  deployment
    .run()
    .then(function() {
      return client.emit('deploy_done');
    })
    .catch(function(error) {
      return client.emit('deploy_done', error);
    });
};

var handleMessages = function(io) {
  io.on('connection', function(client) {
    client.on('deploy', function(projectName) {
      handleDeploy(this, projectName);
    });

    redisClient.on('message', function(channel, message) {
      if (channel === 'chewie:pubsub:deployments') {
        client.emit('project_deployed', message);
      }
    });
  });
};

module.exports = handleMessages;
