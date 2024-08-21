# cdd-helpers

<!-- toc -->

-   [Usage](#usage)
-   [Commands](#commands)
-   [Dev Notes](#devnotes)
<!-- tocstop -->

# Dev Notes

<!-- devnotes -->

If you are creating a new command create a folder that represents the command name, add an index.ts file in that folder with the code and run `pnpm i` and `pnpm run build` once the code is ready to be tested.

<!-- devnotesstop -->

# Usage

<!-- usage -->

```sh-session
$ pnpm install && pnpm run build
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
- [Dev Notes](#dev-notes)
- [Usage](#usage)
- [Commands](#commands)
  - [`cdd-helpers create-org`](#cdd-helpers-create-org)
  - [`cdd-helpers create-operator-org`](#cdd-helpers-create-operator-org)
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

## `cdd-helpers create-operator-org`

Create operator organisation

```
USAGE
  $ ./bin/run.js create-operator-org --name <value> --nocCodes <value> --stage <value> --orgId <value>

FLAGS
  --nocCodes=<value>        (required) Comma-separated list of noc codes
  --name=<value>            (required) Name of operator organisation
  --stage=<value>           (required) SST stage to use
  --orgId=<value>           (required) ID for organisation that the operator organisation belongs to

DESCRIPTION
  Create operator organisation
```

_See code: [dist/cli-helpers/src/commands/create-operator-org/index.ts](https://github.com/Department-for-Transport-Disruptions/create-disruptions-data/blob/v0.0.0/dist/cli-helpers/src/commands/create-operator-org/index.ts)_

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
  --operatorOrgId=<value> Operator organisation ID
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
