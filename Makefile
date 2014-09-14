test:
	node_modules/.bin/bailey ./ ./ --node
	ABAKUS_TOKEN=test HOOK_TOKEN=test node_modules/.bin/istanbul cover node_modules/.bin/_mocha

.PHONY: test
