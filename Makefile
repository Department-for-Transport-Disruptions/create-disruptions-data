stage = $(shell cat ./.sst/stage)

start-sst:
	pnpm run dev

start-site:
	pnpm --filter @create-disruptions-data/site run dev

install-deps:
	pnpm install

kill-site:
	lsof -t -i:3000 | xargs -r kill

trigger-siri-generator:
	aws lambda invoke --function-name cdd-siri-sx-generator-$(stage) --invocation-type Event /tmp/outfile.txt > /dev/null

trigger-stats-generator:
	aws lambda invoke --function-name cdd-siri-stats-generator-$(stage) --invocation-type Event /tmp/outfile.txt > /dev/null

test-all:
	pnpm run test

test-%:
	pnpm run test:$*

lint-with-fix:
	pnpm run lint:fix

run-ui-tests:
	pnpm playwright test --ui