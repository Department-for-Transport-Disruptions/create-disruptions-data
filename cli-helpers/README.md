# cdd-helpers

<!-- toc -->

-   [Usage](#usage)
-   [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install && npm run build
$ ./bin/run.js COMMAND
running command...
$ ./bin/run.js (--version)
@create-disruptions-data/cli-helpers/0.0.0 darwin-arm64 node-v18.15.0
$ ./bin/run.js --help [COMMAND]
USAGE
  $ ./bin/run.js COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [cdd-helpers](#cdd-helpers)
- [Usage](#usage)
- [Commands](#commands)
  - [`cdd-helpers create-org`](#cdd-helpers-create-org)
  - [`cdd-helpers create-user`](#cdd-helpers-create-user)
  - [`cdd-helpers change-group`](#cdd-helpers-change-group)
  - [`cdd-helpers help [COMMANDS]`](#cdd-helpers-help-commands)

## `cdd-helpers create-org`

Create organisation

```
USAGE
  $ ./bin/run.js create-org --name <value> --adminAreaCodes <value> --stage <value>

FLAGS
  --adminAreaCodes=<value>  (required) Comma-separated list of admin area codes
  --name=<value>            (required) Name of organisation
  --stage=<value>           (required) SST stage to use

DESCRIPTION
  Create organisation
```

_See code: [dist/cli-helpers/src/commands/create-org/index.ts](https://github.com/Department-for-Transport-Disruptions/create-disruptions-data/blob/v0.0.0/dist/cli-helpers/src/commands/create-org/index.ts)_

## `cdd-helpers create-user`

Create user

Note: If creating an org admin user in your local environment, you must add the email address associated with that org admin account as a verified identity in SES in order to test SES-based features like disruption approval emails.

```
USAGE
  $ ./bin/run.js create-user --stage <value> [--orgId <value>] [--group <value>] [--email <value>] [--firstName
    <value>] [--lastName <value>] [--poolId <value>]

FLAGS
  --email=<value>      Email for user
  --firstName=<value>  First name of user
  --group=<value>      Cognito group to add user to
  --lastName=<value>   Last name of user
  --orgId=<value>      ID for organisation that user belongs to
  --poolId=<value>     ID of user pool to add user to
  --stage=<value>      (required) SST stage to use

DESCRIPTION
  Create user
```

_See code: [dist/cli-helpers/src/commands/create-user/index.ts](https://github.com/Department-for-Transport-Disruptions/create-disruptions-data/blob/v0.0.0/dist/cli-helpers/src/commands/create-user/index.ts)_

## `cdd-helpers change-group`

Change a users group

```
USAGE
  $ ./bin/run.js change-group --stage <value>

FLAGS
  --stage=<value>           (required) SST stage to use

DESCRIPTION
  Change a users group.
```

_See code: [dist/cli-helpers/src/commands/change-group/index.ts](https://github.com/Department-for-Transport-Disruptions/create-disruptions-data/blob/v0.0.0/dist/cli-helpers/src/commands/change-group/index.ts)_

## `cdd-helpers help [COMMANDS]`

Display help for cdd-helpers.

```
USAGE
  $ ./bin/run.js help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for cdd-helpers.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

<!-- commandsstop -->
