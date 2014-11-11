BIN = node_modules/.bin
GULP = $(BIN)/gulp
HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

parse: node_modules
	$(GULP)

test: parse 
	ABAKUS_TOKEN=test HOOK_TOKEN=test node_modules/.bin/istanbul cover node_modules/.bin/_mocha

node_modules:
	npm install

production:
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	git fetch && git reset --hard origin/master
	npm install
	$(BIN)/gulp
	forever restart index.js
else
	echo "Not in a production environment!"
endif

.PHONY: test parse
