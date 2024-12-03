import { Logger } from "@create-disruptions-data/shared-ts/utils";
import { recursiveQuery } from "@create-disruptions-data/shared-ts/utils/dynamo";
import inquirer, { QuestionMap } from "inquirer";
import { z } from "zod";

type Prompt = {
    type: keyof QuestionMap;
    choices?: string[];
    default?: string;
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

export const generatePassword = (length: number): string => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "$-_";

    let password = [
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const allChars = uppercaseChars + lowercaseChars + numbers + symbols;

    for (let i = password.length; i < length; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    password = password.sort(() => Math.random() - 0.5);

    return password.join("");
};
