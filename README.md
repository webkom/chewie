# chewie [![Build status](https://ci.frigg.io/badges/webkom/chewie/)](https://ci.frigg.io/webkom/chewie/last/)
Server deploy tool. Will consist of an API and a frontend.

![Ship it!](http://1.bp.blogspot.com/_v0neUj-VDa4/TFBEbqFQcII/AAAAAAAAFBU/E8kPNmF1h1E/s640/squirrelbacca-thumb.jpg)

### Usage
There is currently to ways to make chewie deploy a project. By status event hook
from Github, from which a success status on master will make it deploy the master
branch, and by clickong on a button on the the front page. 

## Setup
```bash
git clone git@github.com:webkom/chewie.git
cd chewie
npm install
gulp
```
There has to be a projects json file with descriptions of the projects you have.
*chewie* will look for it on the location specified by the environment variable:
`SERVER_CONFIG_FILE`. The file should be on the format below:
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
#### Prepare the projects
All projects must have a `production` target in make. *chewie* will run 
`make production` in the given path on the given server. Thus, the target
must contain all tasks to successfully deploy the project. Except 
`git fetch && git reset --hard origin/master` which will run before
`make production` in order to make sure that the latest makefile is available.

## Tests
```bash
mocha
```

--------
MIT © webkom, Abakus Linjeforening

