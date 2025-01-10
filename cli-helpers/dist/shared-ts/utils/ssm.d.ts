import { DeleteParameterResult, GetParameterResult, GetParametersByPathResult } from "@aws-sdk/client-ssm";
import { Logger } from "./index";
export declare const putParameter: (name: string, value: string, type: "String" | "StringList" | "SecureString", overwrite: boolean, logger: Logger) => Promise<void>;
export declare const getParameter: (name: string, logger: Logger, withDecryption?: boolean) => Promise<GetParameterResult>;
export declare const deleteParameter: (name: string, logger: Logger) => Promise<DeleteParameterResult>;
export declare const getParametersByPath: (name: string, logger: Logger, recursive?: boolean, withDecryption?: boolean) => Promise<GetParametersByPathResult>;
