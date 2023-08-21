stage = $(shell cat ./.sst/stage)

start-sst:
	npm run dev

start-site:
	npm run dev -w site

install-deps:
	npm install

kill-site:
	lsof -t -i:3000 | xargs -r kill

trigger-siri-generator:
	aws lambda invoke --function-name cdd-siri-sx-generator-$(stage) --invocation-type Event /tmp/outfile.txt > /dev/null