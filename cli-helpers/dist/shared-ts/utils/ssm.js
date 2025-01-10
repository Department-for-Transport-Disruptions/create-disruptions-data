import { DeleteParameterCommand, GetParameterCommand, GetParametersByPathCommand, PutParameterCommand, SSMClient, } from "@aws-sdk/client-ssm";
const ssm = new SSMClient({ region: "eu-west-2" });
export const putParameter = async (name, value, type, overwrite, logger) => {
    logger.info("Uploading item to ssm");
    try {
        const input = {
            Name: name,
            Value: value,
            Type: type,
            Overwrite: overwrite,
        };
        const command = new PutParameterCommand(input);
        await ssm.send(command);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to put parameter into ssm: ${error.stack || ""}`);
        }
        throw error;
    }
};
export const getParameter = async (name, logger, withDecryption) => {
    logger.info("Get item from ssm");
    try {
        const input = {
            Name: name,
            WithDecryption: withDecryption ? withDecryption : true,
        };
        const command = new GetParameterCommand(input);
        return await ssm.send(command);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to get parameter from ssm: ${error.stack || ""}`);
        }
        throw error;
    }
};
export const deleteParameter = async (name, logger) => {
    logger.info("Delete item from ssm");
    try {
        const input = {
            Name: name,
        };
        const command = new DeleteParameterCommand(input);
        return await ssm.send(command);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to delete parameter from ssm: ${error.stack || ""}`);
        }
        throw error;
    }
};
export const getParametersByPath = async (name, logger, recursive, withDecryption) => {
    logger.info("Get parameters by path from ssm");
    try {
        const input = {
            Path: name,
            WithDecryption: withDecryption ? withDecryption : true,
            Recursive: recursive ? recursive : false,
        };
        const command = new GetParametersByPathCommand(input);
        return await ssm.send(command);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to get parameters by path from ssm: ${error.stack || ""}`);
        }
        throw error;
    }
};
