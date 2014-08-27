import sys, json
from fabric.api import env, run, cd


class MissingProjectNameError(Exception):
    pass


class MissingServerError(Exception):
    pass


conf_file = 'servers.json'
env.user = 'root'

def get_host(project_name):
    with open(conf_file) as f:
        servers = json.load(f, 'utf-8')
        print servers
        for hostname, projects in servers.iteritems():
            if project_name in projects:
                return hostname, projects[project_name]
        raise MissingServerError


def deploy_project(project_name, branch='master'):
    env.host_string, meta_info = get_host(project_name)

    with cd(meta_info['path']):
        run('git fetch && git reset --hard origin/%s' % branch)
        run('make update')


if __name__ == '__main__':
    if len(sys.argv):
        deploy_project(*sys.argv[1:])
    else:
        raise MissingProjectNameError
