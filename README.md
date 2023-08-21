# Create Disruptions Data

This repo serves as the monorepo for the Create Disruptions Data service. It comprises the following components:

-   Create Disruptions Data Site
-   SIRI-SX Generator
-   SIRI-SX Validator
-   SIRI-SX API

## Running locally

The site is deployed using [SST](https://sst.dev/), this allows the creation of a dev environment that is deployed into AWS.

### Requirements

-   Node.js 18+

### Process

-   Authenticate against the target AWS account
-   Run `make install-deps` in the root of the project
-   Run `make start-sst`, this will start the sst infrastructure. If it is the first time running this, sst will ask for a stage name for your dev stage and will deploy the required infrastructure into the target AWS account
-   Run `make start-site` in another terminal, this will start the site at `http://localhost:3000`

### Issues

-   There is a known issue where the site process does not stop correctly and so continues to run on port 3000 in the background, this will lead to a port conflict error where the site will start on port 3001. To prevent this, run `make kill-site` to stop the process

## Components

### Site

The site is built using Next.js which runs in a serverless fashion using [OpenNext](https://github.com/sst/open-next). This is deployed using SST but needs to be ran manually (using `make start-site`) when running locally due to the time it takes to deploy the site into AWS. This can be bypassed so the site is deployed on all changes by updating `deploy: false` to `deploy: true` in the [Site Stack](./stacks/SiteStack.ts).

### SIRI-SX Generator

This TypeScript Lambda runs every 10 minutes (1 minute in prod). It retrieves all the disruptions data from the database and generates the SIRI-SX XML which it stores in S3. This can also be triggered by running `make trigger-siri-generator`.

### SIRI-SX Validator

This Python Lambda triggers every time a new SIRI-SX file is generated and stored in S3. It runs the file against the SIRI-SX XSD to make sure it conforms to the required structure and then saves the file to another S3 bucket.

### SIRI-SX API

This uses AWS API Gateway to expose an endpoint that proxies through to the S3 bucket and retrieves the contents of the SIRI-SX file. It is protected using API keys.
