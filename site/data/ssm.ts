import {
    SSMClient,
    PutParameterCommand,
    GetParameterCommand,
    GetParameterResult,
    GetParametersByPathResult,
    GetParametersByPathCommand,
    DeleteParameterResult,
    DeleteParameterCommand,
    PutParameterCommandInput,
} from "@aws-sdk/client-ssm";
import logger from "../utils/logger";

const ssm = new SSMClient({ region: "eu-west-2" });

export const putParameter = async (
    name: string,
    value: string,
    type: "String" | "StringList" | "SecureString",
    overwrite: boolean,
): Promise<void> => {
    logger.info("", {
        context: "data.ssm",
        message: "uploading item to ssm",
    });

    try {
        const input: PutParameterCommandInput = {
            Name: name,
            Value: value,
            Type: type,
            Overwrite: overwrite,
        };
        const command = new PutParameterCommand(input);
        await ssm.send(command);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to put parameter into ssm: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const getParameter = async (name: string, withDecryption?: boolean): Promise<GetParameterResult> => {
    logger.info("", {
        context: "data.ssm",
        message: "get item from ssm",
    });

    try {
        const input = {
            Name: name,
            WithDecryption: withDecryption ? withDecryption : true,
        };
        const command = new GetParameterCommand(input);
        return await ssm.send(command);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get parameter from ssm: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const deleteParameter = async (name: string): Promise<DeleteParameterResult> => {
    logger.info("", {
        context: "data.ssm",
        message: "delete item from ssm",
    });

    try {
        const input = {
            Name: name,
        };
        const command = new DeleteParameterCommand(input);
        return await ssm.send(command);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete parameter from ssm: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const getParametersByPath = async (
    name: string,
    withDecryption?: boolean,
): Promise<GetParametersByPathResult> => {
    logger.info("", {
        context: "data.ssm",
        message: "get parameters by path from ssm",
    });

    try {
        const input = {
            Path: name,
            WithDecryption: withDecryption ? withDecryption : true,
        };
        const command = new GetParametersByPathCommand(input);
        return await ssm.send(command);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get parameters by path from ssm: ${error.stack || ""}`);
        }

        throw error;
    }
};
