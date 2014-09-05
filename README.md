# chewie

Server deploy tool. Will consist of an API and a frontend.

![Ship it!](http://1.bp.blogspot.com/_v0neUj-VDa4/TFBEbqFQcII/AAAAAAAAFBU/E8kPNmF1h1E/s640/squirrelbacca-thumb.jpg)

Ship it!

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

