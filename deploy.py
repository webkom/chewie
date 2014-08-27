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


class MissingServerError(Exception):
    def __init__(self, project_name):
        Exception.__init__(self, 'Cant\'t find a server with the project name %s' % project_name)


conf_file = 'servers.json'  # This could be an environment variable


def get_host(project_name):
    with open(conf_file) as f:
        servers = json.load(f)
        for hostname, projects in servers.iteritems():
            if project_name in projects:
                return hostname, projects[project_name]
        raise MissingServerError(project_name)


def deploy_project(project_name, branch='master'):
    env.host_string, meta_info = get_host(project_name)
    env.user = meta_info.get('  ') or 'root'

    with cd(meta_info['path']):
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
