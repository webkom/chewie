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
forever start $PWD/index.js
```
This will get the project up and running on port 3000 or the port specified in the `PORT` environment variable.

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

The user running chewie needs to have ssh access to the user on the server each project runs on.

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

## Settings
All settings should be set by environment variables.

#### `PORT`
The port the express web-server will listen to.

### `NODE_ENV`
Default: `'development'`  
The environment chewie is running in. This should be set to `production` in production.

#### `SERVER_CONFIG_FILE` - required
The config file with projects, mentioned in [the setup section](#setup)

#### `HOOK_TOKEN` - required
The secret token used to authenticate github webhooks.

#### `PASSPORT_STRATEGY`
The strategy passport should use to authenticate. This will be passed into require and the required file will be called like a function and passed into passport. [passport-abakus](https://github.com/webkom/passport-abakus) is an example of a passport strategy that comply with the structure chewie expects.

**Note:** If this is not set chewie will not require authentication for the deployment dashboard.

#### `PASSPORT_STRATEGY_OPTIONS`
Default: `{}`  
The options passed into the passport strategy

#### `REDIS`
Default: `false`  
Should redis dependent features be used.

#### `REDIS_PORT`
Default: `6379`

#### `REDIS_HOST`
Default: `'127.0.0.1'`

#### `REDIS_DB`
Default: `1`

#### `SLACK_URL`
Used to enable sending of slack notification on deployments.

#### `SLACK_CHANNEL`
The channel to send notifications to

#### `CORRECT_HOSTNAME`
Default: `abakus.no`  
Only used by the makefile to make sure `make production` only runs in the right environment.



--------
MIT © webkom, Abakus Linjeforening
