BIN = node_modules/.bin
GULP = $(BIN)/gulp
ISTANBUL = $(BIN)/istanbul
MOCHA = $(BIN)/_mocha

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

parse: node_modules
	$(GULP)

test: parse 
	ABAKUS_TOKEN=test HOOK_TOKEN=test $(ISTANBUL) cover $(MOCHA)

node_modules:
	npm install

production:
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	git fetch && git reset --hard origin/master
	npm install
	$(GULP)
	forever restart index.js
else
	@echo "Not in a production environment!"
endif

.PHONY: test parse
