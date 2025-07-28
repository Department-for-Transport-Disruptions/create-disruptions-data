import * as fs from "node:fs";
import path from "node:path";
import { RDSData } from "@aws-sdk/client-rds-data";
import { Database } from "@create-disruptions-data/shared-ts/db/types";
import { program } from "commander";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { withUserPrompt } from "../utils";

program
    .option("--refDataDatabaseName <refDataDatabaseName>", "Name of reference data database")
    .option("--refDataDbSecretArn <refDataDbSecretArn>", "ARN of reference data DB secret")
    .option("--refDataDbResourceArn <refDataDbResourceArn>", "ARN of reference data database")
    .action(async () => {
        let { refDataDatabaseName, refDataDbSecretArn, refDataDbResourceArn } = program.opts();

        if (!refDataDatabaseName) {
            refDataDatabaseName = await withUserPrompt("refDataDatabaseName", { type: "input" });
        }

        if (!refDataDbSecretArn) {
            refDataDbSecretArn = await withUserPrompt("refDataDbSecretArn", { type: "input" });
        }

        if (!refDataDbResourceArn) {
            refDataDbResourceArn = await withUserPrompt("refDataDbResourceArn", { type: "input" });
        }

        if (refDataDbResourceArn.includes("prod") && !refDataDbResourceArn.includes("preprod")) {
            const prodRunConfirmed = await withUserPrompt("confirmProdRun", {
                type: "confirm",
                message:
                    "You are going to run this command against the preprod database. Are you sure you want to continue?",
                default: false,
            });

            if (!prodRunConfirmed) {
                console.log("Script aborted. Exiting without making changes.");
                process.exit(0);
            }
        }

        const refDataDbClient = new Kysely<Database>({
            dialect: new DataApiDialect({
                mode: "mysql",
                driver: {
                    database: refDataDatabaseName,
                    secretArn: refDataDbSecretArn,
                    resourceArn: refDataDbResourceArn,
                    client: new RDSData({
                        region: "eu-west-2",
                    }),
                },
            }),
        });

        const filePath = path.join(__dirname, "roadworks.json");
        fs.writeFileSync(filePath, "[", "utf-8");

        let hasMoreData = true;
        let offset = 0;
        const limit = 800;

        while (hasMoreData) {
            // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
            console.log(`Fetching roadworks data...`);
            const roadworks = await refDataDbClient
                .selectFrom("roadworks")
                .selectAll()
                .limit(limit)
                .offset(offset)
                .execute();

            if (roadworks.length > 0) {
                const jsonData = JSON.stringify(roadworks, null, 2);
                fs.appendFileSync(filePath, (offset > 0 ? "," : "") + jsonData.slice(1, -1), "utf-8");
                offset += limit;
            } else {
                hasMoreData = false;
            }
        }

        fs.appendFileSync(filePath, "]", "utf-8");

        console.log(`Roadworks data saved to ${filePath}`);
    });

program.parseAsync(process.argv);
