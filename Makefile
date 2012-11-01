.PHONY: build test server

build:
	@echo "Minified size before: "
	@echo -n "\t"
	@du -b ./traversty.min.js
	@gzip ./traversty.min.js
	@echo -n "\t"
	@du -b ./traversty.min.js.gz
	@gunzip ./traversty.min.js.gz
	@jshint ./traversty.js
	@uglifyjs ./traversty.js > ./traversty.min.js
	@echo "Minified size after:  "
	@echo -n "\t"
	@du -b ./traversty.min.js
	@gzip ./traversty.min.js
	@echo -n "\t"
	@du -b ./traversty.min.js.gz
	@gunzip ./traversty.min.js.gz

test:
	buster test -R

server:
	buster server &

