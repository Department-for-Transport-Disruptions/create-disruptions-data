stage = $(shell cat ./.sst/stage)

export PRISMA_CLI_BINARY_TARGETS := linux-arm64-openssl-3.0.x

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

dev-containers-up:
	docker compose --project-directory dev up -d

dev-containers-down:
	docker compose --project-directory dev down

dev-containers-kill:
	docker compose --project-directory dev kill

dev-containers-stop-%:
	docker compose --project-directory dev stop $*

run-ui-tests:
	pnpm playwright test --ui

prisma-migrate-dev:
	pnpm --filter @create-disruptions-data/shared-ts run prisma:migrate

prisma-format:
	pnpm --filter @create-disruptions-data/shared-ts run prisma:format

start-dev: dev-containers-up prisma-migrate-dev kill-site start-site

bastion-tunnel:
	./scripts/bastion-tunnel.sh

get-db-credentials:
	./scripts/get-db-credentials.sh

update-secrets:
	./scripts/update-secrets.sh $(STAGE)

sst-deploy:
	pnpm sst deploy --stage $(STAGE)

migrate-remote-db:
	aws lambda invoke --function-name cdd-prisma-migrator-$(STAGE) --log-type Tail  response.txt | jq -r .LogResult | base64 --decode
