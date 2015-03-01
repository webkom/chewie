BIN = node_modules/.bin
CHEWIE = ./index.js

HOSTNAME = $(shell hostname -f)
CORRECT_HOSTNAME ?= abakus.no
STYL = $(shell find src/public/stylus -name "*.styl")
JS = $(shell find src/ -name "*.js")

ifeq ($(findstring $(CORRECT_HOSTNAME),$(HOSTNAME)),$(CORRECT_HOSTNAME))
	ENV = production
	STYLUS = $(BIN)/stylus --compress --include node_modules/nib/lib < $(STYL)
else
	ENV = development
	STYLUS = $(BIN)/stylus --sourcemap --include node_modules/nib/lib < $(STYL)
endif

all: src/public/main.css

src/public/main.css: $(STYL)
	$(STYLUS) > $@

run:
	ABAKUS_TOKEN=test HOOK_TOKEN=test SERVER_CONFIG_FILE=$(PWD)/example.json $(CHEWIE)

test:
	SSH_PASSWORD=test ABAKUS_TOKEN=test HOOK_TOKEN=test REDIS=true REDIS_DB=3 SERVER_CONFIG_FILE=$(PWD)/example.json $(BIN)/istanbul cover $(BIN)/_mocha test

mocha:
	SSH_PASSWORD=test ABAKUS_TOKEN=test HOOK_TOKEN=test REDIS=true REDIS_DB=3 SERVER_CONFIG_FILE=$(PWD)/example.json $(BIN)/mocha test

jshint: $(JS)
	@$(BIN)/jshint . --exclude-path .gitignore

jscs: $(JS)
	@$(BIN)/jscs .

clean:
	rm -rf src/public/vendor src/public/stylesheets

install:
	npm install
	bower install

src/public/vendor: bower.json
	bower install

node_modules: package.json
	npm install

server:
	@DEBUG=chewie supervisor index.js

production: venv
ifeq ($(ENV), production)
	git fetch && git reset --hard origin/master
	npm install
	bower install
	make all
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

.PHONY: test install clean production all
