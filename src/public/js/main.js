var socket = io();

var projectButtons = $('.project');
var projectDetails = $('.project-details');

var outputField = projectDetails.find('pre');
var codeField = outputField.find('code');

var deployButton = projectDetails.find('#deploy-button');
var deployButtonText = deployButton.find('span');

var nameField = projectDetails.find('.name');
var commitField = projectDetails.find('.commit>.content');
var timestampField = projectDetails.find('.timestamp>.content');

var deploySpinner = deployButton.find('i');
var currentProject = null;

var formatTimestamp = function(timestamp) {
  return moment(parseInt(timestamp)).format('DD.MM.YYYY HH:mm');
};

$('.projects .timestamp>.content').each(function() {
  $(this).html(formatTimestamp($(this).html()));
});

socket.on('deploy_data', function(data) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  codeField.append(ansi_up.ansi_to_html(data));
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('deploy_done', function() {
  projectButtons.removeClass('disabled');
  deploySpinner.hide();
  deployButtonText.html('Done!');
});

socket.on('project_deployed', function(report) {
  report = JSON.parse(report);
  var project = $('.projects [data-name=' + report.project + ']');
  project.data('commit', report.commit);
  project.find('.commit>.content').html(report.commit);
  project.data('timestamp', report.timestamp);
  project.find('.timestamp>.content').html(formatTimestamp(report.timestamp));
  if (currentProject === report.project) {
    updateProjectDetails(report.project, report.commit, report.timestamp);
  }
});

var updateProjectDetails = function(project, commit, timestamp) {
  nameField.html(project);
  deployButtonText.html('Deploy ' + project + '?');
  if (commit) {
    commitField.html(commit);
  } else {
    commitField.html('Unknown');
  }

  if (timestamp) {
    timestampField.html(formatTimestamp(timestamp));
  } else {
    timestampField.html('Unknown');
  }
};

var deploy = function(projectName) {
  projectButtons.addClass('disabled');

  deploySpinner.show();
  deployButtonText.html('Deploying ' + projectName + '');

  socket.emit('deploy', projectName);
};

projectButtons.click(function(e) {
  if ($(this).hasClass('disabled')) {
    e.stopPropagation();
    return;
  }

  currentProject = $(this).data('name');
  projectButtons.removeClass('selected');
  $(this).addClass('selected');

  updateProjectDetails(currentProject, $(this).data('commit'), $(this).data('timestamp'));

  codeField.html('');

  deployButton.off('click');
  deployButton.click(function(e) {
    deploy(currentProject);
  });
  deploySpinner.hide();
  projectDetails.addClass('active');
});
