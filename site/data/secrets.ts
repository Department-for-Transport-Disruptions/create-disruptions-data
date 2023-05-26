import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, PutParameterCommand, GetParameterCommand } from "@aws-sdk/client-ssm";
import { z } from "zod";

const secretsClient = new SecretsManagerClient({ region: "eu-west-2" });
const ssmClient = new SSMClient({ region: "eu-west-2" });

export const putParameter = async (name: string, value: string, type: "String" | "StringList" | "SecureString") => {
    await ssmClient.send(
        new PutParameterCommand({
            Name: name,
            Value: value,
            Type: type,
            Overwrite: true,
            Tier: "Standard",
        }),
    );
};

export const getParameter = async (name: string, decrypt: boolean) => {
    const parameter = await ssmClient.send(
        new GetParameterCommand({
            Name: name,
            WithDecryption: decrypt,
        }),
    );

    return parameter.Parameter?.Value ?? null;
};

export const getSmSecret = async (secretId: string): Promise<string | undefined> => {
    const secretValue = await secretsClient.send(
        new GetSecretValueCommand({
            SecretId: secretId,
        }),
    );

    return secretValue.SecretString;
};

export const getHootsuiteCreds = async () => {
    if (!process.env.HOOTSUITE_CREDS_ARN) {
        return null;
    }

    const hootsuiteValue = await getSmSecret(process.env.HOOTSUITE_CREDS_ARN);

    if (!hootsuiteValue) {
        return null;
    }

    try {
        const parsedHootsuiteCreds = z
            .object({
                clientId: z.string(),
                clientSecret: z.string(),
            })
            .safeParse(JSON.parse(hootsuiteValue));

        if (parsedHootsuiteCreds.success) {
            return parsedHootsuiteCreds.data;
        }
    } catch {}

    return null;
};
