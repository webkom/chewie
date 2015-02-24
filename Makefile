BIN = node_modules/.bin
CHEWIE = ./index.js

HOSTNAME = $(shell hostname -f)
CORRECT_HOSTNAME ?= abakus.no
STYL = $(shell find src/stylus -name "*.styl")
JS = $(shell find src/ -name "*.js")

ifeq ($(findstring $(CORRECT_HOSTNAME),$(HOSTNAME)),$(CORRECT_HOSTNAME))
	ENV = production
	STYLUS = $(BIN)/stylus --compress --include node_modules/nib/lib < $(STYL)
else
	ENV = development
	STYLUS = $(BIN)/stylus --sourcemap --include node_modules/nib/lib < $(STYL)
endif

all: public/stylesheets/main.css

src/public/stylesheets/main.css: node_modules $(STYL)
	@mkdir -p public/stylesheets
	$(STYLUS) > $@

run: venv
	ABAKUS_TOKEN=test HOOK_TOKEN=test SERVER_CONFIG_FILE=$(PWD)/example.json $(CHEWIE)

test: venv
	ABAKUS_TOKEN=test HOOK_TOKEN=test REDIS=true SERVER_CONFIG_FILE=$(PWD)/example.json $(BIN)/istanbul cover $(BIN)/_mocha test

mocha:
	ABAKUS_TOKEN=test HOOK_TOKEN=test REDIS=true SERVER_CONFIG_FILE=$(PWD)/example.json $(BIN)/mocha test

jshint:
	$(BIN)/jshint

jscs:
	$(BIN)/jscs .

clean:
	rm -rf src/public/vendor src/public/stylesheets

install: node_modules venv

venv:
	virtualenv venv
	venv/bin/pip install -r requirements.txt
node_modules:
	npm install

production: venv
ifeq ($(ENV), production)
	git fetch && git reset --hard origin/master
	npm install
	bower install
	$(STYLUS) > src/public/stylesheets/main.css
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

.PHONY: test install clean production all
