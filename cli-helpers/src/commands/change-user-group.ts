import {
    AdminAddUserToGroupCommand,
    AdminListGroupsForUserCommand,
    AdminRemoveUserFromGroupCommand,
    ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { program } from "commander";
import * as logger from "lambda-log";
import { withUserPrompt, withUserPrompts } from "../utils";
import { createCognitoClient } from "../utils/awsClients";

program
    .option("--stage <stage>", "SST stage to use")
    .option("--poolId <poolId>", "ID of user pool to add user to")
    .option("--email <email>", "Email for user")
    .option("--group <group>", "Cognito group to add user to")
    .action(async (options) => {
        let { poolId, group } = program.opts();

        const cognitoClient = createCognitoClient();

        const { stage, email } = await withUserPrompts(options, {
            stage: { type: "input" },
            email: { type: "input" },
        });

        if (!poolId) {
            const userPoolsResult = await cognitoClient.send(
                new ListUserPoolsCommand({
                    MaxResults: 10,
                }),
            );

            const userPools = userPoolsResult.UserPools?.filter((pool) => pool.Name?.includes(stage)) ?? [];

            const chosenUserPool = await withUserPrompt("poolId", {
                type: "list",
                choices: userPools.map((pool) => pool.Name ?? ""),
            });

            poolId = userPools.find((pool) => pool.Name === chosenUserPool)?.Id;
        }

        if (!group) {
            group = await withUserPrompt("group", { type: "list", choices: Object.values(UserGroups) });
        }

        const existingGroups = await cognitoClient.send(
            new AdminListGroupsForUserCommand({
                UserPoolId: poolId,
                Username: email,
            }),
        );

        if (existingGroups.Groups?.length) {
            for (const existingGroup of existingGroups.Groups) {
                await cognitoClient.send(
                    new AdminRemoveUserFromGroupCommand({
                        GroupName: existingGroup.GroupName,
                        UserPoolId: poolId,
                        Username: email,
                    }),
                );
            }
        }

        await cognitoClient.send(
            new AdminAddUserToGroupCommand({
                GroupName: group,
                UserPoolId: poolId,
                Username: email,
            }),
        );

        logger.info(`User (${email}) added to (${group}) group`);
    });

program.parseAsync(process.argv);
