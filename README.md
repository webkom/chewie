# chewie

Server deploy tool. Will consist of an API and a frontend.

### Deploying
```bash
curl -X POST http://chewie.abakus.no/api/deploy/:projectName --data "debug=<true/false>"
```

## Setup
```bash
git clone git@github.com:webkom/chewie.git
cd chewie
npm install
gulp
```

## Tests
```bash
mocha
```

--------
MIT © webkom, Abakus Linjeforening

