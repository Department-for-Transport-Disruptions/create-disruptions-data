import { execFile } from "node:child_process";
import path from "node:path";
import { Handler } from "aws-lambda";
import * as logger from "lambda-log";
import { Config } from "sst/node/config";

export const main: Handler = async (event) => {
    logger.info(event);
    try {
        process.env.DATABASE_URL = Config.DB_CONNECTION_STRING;

        const exitCode = await new Promise((resolve, _) => {
            execFile(
                path.resolve("./node_modules/prisma/build/index.js"),
                ["migrate", "deploy", "--schema", "./schema.prisma", "-f"],
                (error, stdout) => {
                    logger.info(stdout);
                    if (error != null) {
                        logger.error(`prisma migrate deploy exited with error ${error.message}`);
                        resolve(error.code ?? 1);
                    } else {
                        resolve(0);
                    }
                },
            );
        });

        if (exitCode !== 0) throw Error(`command deploy failed with exit code ${exitCode}`);
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);
        }

        throw e;
    }
};
