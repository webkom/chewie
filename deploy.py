#!/usr/bin/env python

"""
Takes a project name as the first argument and a git-branch as the second (optional).
Finds the hostname from a config file, then uses ssh to deploy the project.
"""

import sys
import json
from fabric.api import env, run, cd


class MissingProjectNameError(Exception):
    def __init__(self):
        Exception.__init__(self, 'Missing project name argument.')

class MissingProjectError(Exception):
    def __init__(self, project_name):
        Exception.__init__(self, 'Cant\'t find a project with the project name %s' % project_name)


conf_file = 'servers.json'  # This could be an environment variable


def get_project(project_name):
    with open(conf_file) as f:
        projects = json.load(f)
        try:
            project = projects[project_name]
            return project
        except KeyError:
            raise MissingProjectError(project_name)


def deploy_project(project_name, branch='master'):
    project = get_project(project_name)
    env.host_string = project['hostname']
    env.user = project.get('user') or 'root'

    with cd(project['path']):
        run('git fetch && git reset --hard origin/%s' % branch)
        run('make update')


if __name__ == '__main__':
    try:
        if len(sys.argv):
            deploy_project(*sys.argv[1:])
        else:
            raise MissingProjectNameError
    except Exception as e:
        sys.stderr.write(e.message)
