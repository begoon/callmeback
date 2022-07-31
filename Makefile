all: open

SITE=https://callmeback.in

live:
	open $(SITE)

open:
	open index.html

test:
	npx ava

ci:
	npm install
	npm run test
