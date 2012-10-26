.PHONY: build test server

build:
	@echo -n "Minified size before: "
	@du -b ./traversty.min.js
	@jshint ./traversty.js
	@uglifyjs ./traversty.js > ./traversty.min.js
	@echo -n "Minified size after:  "
	@du -b ./traversty.min.js

test:
	buster test -R

server:
	buster server &

