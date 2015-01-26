BIN = node_modules/.bin
BAILEY = $(BIN)/bailey
ISTANBUL = $(BIN)/istanbul
MOCHA = $(BIN)/_mocha
CHEWIE = ./index.js

HOSTNAME = $(shell hostname -f)
CORRECT_HOSTNAME = abakus.no
STYL = $(shell find src/frontend/stylus -name "*.styl")
BS = $(shell find src/frontend/stylus -name "*.styl")

PARSE = $(BAILEY) src/server dist --node && \
			  $(BAILEY) src/frontend public/js --bare && \
				$(BAILEY)	test dist/test --node

ifeq ($(findstring $(CORRECT_HOSTNAME),$(HOSTNAME)),$(CORRECT_HOSTNAME))
	ENV = production
	STYLUS = $(BIN)/stylus --compress --include node_modules/nib/lib < $(STYL)
else
	ENV = development
	STYLUS = $(BIN)/stylus --sourcemap --include node_modules/nib/lib < $(STYL)
endif

help:
	@echo "Available commands:"
	@echo "  parse"
	@echo "  public/stylesheets/main.css"
	@echo "  install"
	@echo "  run"
	@echo "  test"
	@echo "  clean"
	@echo "  production"

parse: node_modules $(BS)
	$(PARSE)

public/stylesheets/main.css: node_modules $(STYL)
	$(STYLUS) > $@

install: node_modules

run: parse
	ABAKUS_TOKEN=test HOOK_TOKEN=test SERVER_CONFIG_FILE=$(PWD)/example.json $(CHEWIE)

test: parse
	ABAKUS_TOKEN=test HOOK_TOKEN=test $(ISTANBUL) cover $(MOCHA) dist/test

clean:
	rm -rf dist public/js public/stylesheets

node_modules:
	npm install

production:
ifeq ($(ENV), production)
	git fetch && git reset --hard origin/master
	npm install
	$(PARSE)
	$(STYLUS)
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

.PHONY: test install parse clean production
