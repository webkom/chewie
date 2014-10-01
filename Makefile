parse: node_modules
	node_modules/.bin/gulp

test: parse 
	ABAKUS_TOKEN=test HOOK_TOKEN=test node_modules/.bin/istanbul cover node_modules/.bin/_mocha

node_modules:
	npm install

.PHONY: test parse
