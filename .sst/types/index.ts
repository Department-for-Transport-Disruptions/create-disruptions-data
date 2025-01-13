import "sst/node/config";
declare module "sst/node/config" {
  export interface ConfigTypes {
    APP: string;
    STAGE: string;
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_USERNAME": {
      value: string;
    }
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_PASSWORD": {
      value: string;
    }
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_HOST": {
      value: string;
    }
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_RO_HOST": {
      value: string;
    }
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_PORT": {
      value: string;
    }
  }
}

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    "DB_NAME": {
      value: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-kysely-db-migrator-migrate-function": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-kysely-db-migrator-rollback-function": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-custom-email-cognito-trigger": {
      functionName: string;
    }
  }
}

import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    "cdd-dynamodb-disruptions-table": {
      tableName: string;
    }
  }
}

import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    "cdd-dynamodb-template-disruptions-table": {
      tableName: string;
    }
  }
}

import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    "cdd-dynamodb-organisations-v2-table": {
      tableName: string;
    }
  }
}

import "sst/node/bucket";
declare module "sst/node/bucket" {
  export interface BucketResources {
    "cdd-image-bucket": {
      bucketName: string;
    }
  }
}

import "sst/node/site";
declare module "sst/node/site" {
  export interface NextjsSiteResources {
    "Site": {
      url: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-nextdoor-token-refresher": {
      functionName: string;
    }
  }
}

import "sst/node/bucket";
declare module "sst/node/bucket" {
  export interface BucketResources {
    "cdd-siri-sx": {
      bucketName: string;
    }
  }
}

import "sst/node/bucket";
declare module "sst/node/bucket" {
  export interface BucketResources {
    "cdd-siri-sx-unvalidated": {
      bucketName: string;
    }
  }
}

import "sst/node/bucket";
declare module "sst/node/bucket" {
  export interface BucketResources {
    "cdd-disruptions-json": {
      bucketName: string;
    }
  }
}

import "sst/node/bucket";
declare module "sst/node/bucket" {
  export interface BucketResources {
    "cdd-disruptions-csv": {
      bucketName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-siri-sx-generator": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-siri-stats-generator": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-siri-sx-validator": {
      functionName: string;
    }
  }
}

import "sst/node/api";
declare module "sst/node/api" {
  export interface ApiGatewayV1ApiResources {
    "cdd-siri-sx-api": {
      url: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-roadworks-cancelled-notification": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-roadworks-new-notification": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-dynamo-disruption-bulk-migrator": {
      functionName: string;
    }
  }
}

import "sst/node/function";
declare module "sst/node/function" {
  export interface FunctionResources {
    "cdd-dynamo-disruption-incremental-migrator": {
      functionName: string;
    }
  }
}

