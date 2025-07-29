import { randomBytes } from "crypto";
import { Logger } from "@create-disruptions-data/shared-ts/utils";
import { recursiveQuery } from "@create-disruptions-data/shared-ts/utils/dynamo";
import inquirer, { QuestionMap } from "inquirer";
import { z } from "zod";

type Prompt = {
    type: keyof QuestionMap;
    choices?: string[];
    default?: string | boolean;
    message?: string;
};

export const withUserPrompt = async (name: string, prompt: Prompt) => {
    const response = await inquirer.prompt<{ [name: string]: string }>([
        {
            name,
            type: prompt.type,
            choices: prompt.choices,
            default: prompt.default,
        },
    ]);

    return response[name];
};

export const withUserPrompts = async <T extends { [key: string]: string }>(
    options: T,
    prompts: Record<keyof T, Prompt>,
) => {
    const answers: Record<keyof T, string> = { ...options };

    for await (const [option, prompt] of Object.entries(prompts) as Array<[key: keyof T, prompt: Prompt]>) {
        if (!answers[option]) {
            answers[option] = await withUserPrompt(option as string, prompt);
        }
    }

    return answers;
};

export const orgsSchema = z.object({ PK: z.string().uuid(), name: z.string(), adminAreaCodes: z.array(z.string()) });

const subOrganisationSchema = z.object({
    name: z.string(),
    PK: z.string(),
    nocCodes: z.array(z.string()),
    SK: z.string(),
});

const operatorOrgSchema = subOrganisationSchema.transform((data) => ({
    orgId: data.PK,
    operatorOrgId: data.SK.replace("OPERATOR#", ""),
    name: data.name,
    nocCodes: data.nocCodes,
}));

const operatorOrgListSchema = z.array(operatorOrgSchema);

type SubOrganisation = z.infer<typeof subOrganisationSchema>;

export const listOperatorsForOrg = async (orgId: string, stage: string, logger: Logger) => {
    let dbData: Record<string, unknown>[] = [];

    dbData = await recursiveQuery(
        {
            TableName: `cdd-organisations-v2-table-${stage}`,
            KeyConditionExpression: "PK = :1 AND begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": orgId,
                ":2": "OPERATOR",
            },
        },
        logger,
    );

    const operators = dbData.map((item) => ({
        PK: (item as SubOrganisation).PK,
        name: (item as SubOrganisation).name,
        nocCodes: (item as SubOrganisation).nocCodes,
        SK: (item as SubOrganisation).SK?.slice(9),
    }));

    const parsedOperators = operatorOrgListSchema.safeParse(operators);

    if (!parsedOperators.success) {
        return [];
    }

    return parsedOperators.data;
};

const getRandomInt = (max: number): number => {
    let randomNumber: number;
    do {
        randomNumber = randomBytes(1)[0];
    } while (randomNumber >= 256 - (256 % max));
    return randomNumber % max;
};

/**
 * Generates a password that conforms to the site's password policy. Ensures that
 * password contains at least one type of each character, filling the length and
 * finally shuffling the characters.
 *
 * @param length The length of the password
 * @returns A password string that conforms to password policy
 */
export const generatePassword = (length: number): string => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "$-_";

    let password = [
        uppercaseChars[getRandomInt(uppercaseChars.length)],
        lowercaseChars[getRandomInt(lowercaseChars.length)],
        numbers[getRandomInt(numbers.length)],
        symbols[getRandomInt(symbols.length)],
    ];

    const allChars = uppercaseChars + lowercaseChars + numbers + symbols;

    for (let i = password.length; i < length; i++) {
        password.push(allChars[getRandomInt(allChars.length)]);
    }

    password = password.sort(() => getRandomInt(2) - 0.5);

    return password.join("");
};
