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
    "cdd-local-database-creator-function": {
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

