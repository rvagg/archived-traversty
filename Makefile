.PHONY: build test server

build:
	@node build.js

test:
	buster test -R

server:
	buster server &

