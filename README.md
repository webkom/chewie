# chewie [![Build status](https://ci.frigg.io/badges/webkom/chewie/)](https://ci.frigg.io/webkom/chewie/last/) [![Coverage status](https://ci.frigg.io/badges/coverage/webkom/chewie/)](https://ci.frigg.io/webkom/chewie/last/)
Server deploy tool, supports deployments from a web interface and through GitHub webhooks.

### Usage
There are currently two ways to make chewie deploy a project. By a status event hook
from GitHub, from which a success status on master will make it deploy the master
branch, and by using the web frontend.

## Setup
```bash
git clone git@github.com:webkom/chewie.git
cd chewie
npm install
gulp
```

There has to be a JSON-file with descriptions of the projects you want to deploy.
*chewie* will look for it on the location specified by the environment variable:
`SERVER_CONFIG_FILE`. The file should use the following format:

```json
{
  "<repo-name-from-github>": {
    "hostname": "<hostname-of-server-the-project-runs-on>",
    "user": "<ssh-user>",
    "path": "<path-to-project-on-the-server>"
  },
  "<another-repo>": { 
    ...
  }
}
```

### Deploy chewie with chewie
If you want to deploy chewie on a server with another hostname than `<server>.abakus.no` expose
the `CORRECT_HOSTNAME` environment variable in order to run `make production`.

#### Prepare the projects
All projects must have a `production` target in make. *chewie* will run 
`make production` in the given path on the given server. Thus, the target
must contain all tasks to successfully deploy the project. Except 
`git fetch && git reset --hard origin/master` which will run before
`make production` in order to make sure that the latest makefile is available.

## Tests
```bash
make test
```

--------
MIT © webkom, Abakus Linjeforening

