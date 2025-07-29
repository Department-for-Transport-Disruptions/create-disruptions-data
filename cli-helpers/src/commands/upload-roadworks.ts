import * as fs from "node:fs";
import path from "node:path";
import { Database, NewRoadworkDB } from "@create-disruptions-data/shared-ts/db/types";
import { roadworkSchema } from "@create-disruptions-data/shared-ts/roadwork.zod";
import { Promise as BluebirdPromise } from "bluebird";
import { program } from "commander";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { z } from "zod";
import { withUserPrompt } from "../utils";

const { Pool } = pg;

export const chunkArray = (array: NewRoadworkDB[], chunkSize: number) => {
    const chunks: NewRoadworkDB[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
};

program
    .option("--disruptionsDbUsername <disruptionsDbUsername>", "Username for disruptions database")
    .option("--disruptionsDbPassword <disruptionsDbPassword>", "Password for disruptions database")
    .option("--disruptionsDbHostName <disruptionsDbHostName>", "Hostname for disruptions database")
    .option("--disruptionsLocalPort <disruptionsLocalPort>", "Local port for disruptions database")
    .option("--disruptionsDatabaseName <disruptionsDatabaseName>", "Name of the disruptions database")
    .action(async () => {
        let {
            disruptionsDbUsername,
            disruptionsDbPassword,
            disruptionsDbHostName,
            disruptionsLocalPort,
            disruptionsDatabaseName,
        } = program.opts();

        if (!disruptionsDbUsername) {
            disruptionsDbUsername = await withUserPrompt("disruptionsDbUsername", { type: "input" });
        }

        if (!disruptionsDbPassword) {
            disruptionsDbPassword = await withUserPrompt("disruptionsDbPassword", { type: "password" });
        }

        if (!disruptionsDbHostName) {
            disruptionsDbHostName = await withUserPrompt("disruptionsDbHostName", { type: "input" });
        }

        if (!disruptionsLocalPort) {
            disruptionsLocalPort = await withUserPrompt("disruptionsLocalPort", { type: "input" });
        }

        if (!disruptionsDatabaseName) {
            disruptionsDatabaseName = await withUserPrompt("disruptionsDatabaseName", { type: "input" });
        }

        const disruptionsDbClient = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    connectionString: `postgresql://${encodeURIComponent(disruptionsDbUsername)}:${encodeURIComponent(disruptionsDbPassword)}@${disruptionsDbHostName}:${disruptionsLocalPort}/${disruptionsDatabaseName}`,
                }),
            }),
            plugins: [new CamelCasePlugin()],
        });

        const filePath = path.join(__dirname, "roadworks.json");
        const roadworksData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // biome-ignore lint/suspicious/noExplicitAny: Change needed to map roadworksData to the expected schema. Data is parsed via Zod in the next step anyway.
        const processedRoadworks = roadworksData.map((roadwork: any) => ({
            ...roadwork,
            lastUpdatedDateTime: roadwork.lastUpdatedDatetime,
        }));

        const parsedRoadworks = z
            .array(roadworkSchema.extend({ createdDateTime: z.string().datetime() }))
            .safeParse(processedRoadworks);

        if (!parsedRoadworks.success) {
            console.error(`Error parsing roadworks data: ${processedRoadworks.error}`);
            process.exit(0);
        }

        const writeToRoadworksTable = async (batch: NewRoadworkDB[]) => {
            console.log("Inserting roadworks into disruptions database...");
            await disruptionsDbClient
                .insertInto("roadworks")
                .values(batch)
                .onConflict((oc) => oc.doNothing())
                .execute()
                .then(() => 0);
        };

        const roadworksChunks = chunkArray(parsedRoadworks.data, 50);

        try {
            await BluebirdPromise.map(roadworksChunks, (batch) => writeToRoadworksTable(batch), {
                concurrency: 10,
            });
        } catch (e) {
            console.error(e);
        }

        console.log("Successfully uploaded roadworks to the disruptions database.");
    });

program.parseAsync(process.argv);
