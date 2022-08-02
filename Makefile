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

deploy-action:
	git checkout release
	git merge main
	git push origin release
	git checkout main
	git branch

deploy: 
	@echo "*** DEPLOYING TO production ***"
	@echo "ARE YOU SURE [Y/N]?"
	@read YN && [[ $$YN =~ ^[Yy]$$ ]]
	make deploy-action
