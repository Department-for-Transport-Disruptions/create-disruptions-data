import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { getPublishedDisruptionsDataFromDynamo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { Command, Flags } from "@oclif/core";
import * as logger from "lambda-log";
import { getOrganisationInfoById, includeDisruption } from "../../utils";

const enrichDisruptionsWithOrgInfo = async (disruptions: Disruption[], orgTableName: string) => {
    const orgIds = disruptions
        .map((disruption) => disruption.orgId)
        .filter(notEmpty)
        .filter((value, index, array) => array.indexOf(value) === index);

    const orgInfo = (await Promise.all(orgIds.map(async (id) => getOrganisationInfoById(orgTableName, id)))).filter(
        notEmpty,
    );

    const date = getDate();

    return disruptions
        .map((disruption) => {
            if (!disruption.orgId) {
                return null;
            }

            const org = orgInfo.find((org) => org.id === disruption.orgId);

            if (!org || !includeDisruption(disruption, date)) {
                return null;
            }

            return {
                ...disruption,
                organisation: {
                    id: org.id,
                    name: org.name,
                },
            };
        })
        .filter(notEmpty);
};

export default class MigrateDynamoToRds extends Command {
    static description = "Migrate disruptions from DynamDB to RDS";

    static flags = {
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };
    async run(): Promise<void> {
        const { flags } = await this.parse(MigrateDynamoToRds);

        const { stage } = flags;

        if (!stage) {
            throw new Error("Stage must be provided");
        }

        const disruptions = await getPublishedDisruptionsDataFromDynamo(`cdd-disruptions-table-${stage}`, logger);

        const disruptionsWithOrgInfo = await enrichDisruptionsWithOrgInfo(
            disruptions,
            `cdd-organisations-v2-table-${stage}`,
        );

        console.log("disruptionsWithOrgInfo", disruptionsWithOrgInfo);
    }
}
