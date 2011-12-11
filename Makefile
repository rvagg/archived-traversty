.PHONY: build test server

build:
	@node build.js

test:
	buster test

server:
	buster server &

