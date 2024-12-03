import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const createDynamoDbDocClient = () => {
    return DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));
};

export const createCognitoClient = () => {
    return new CognitoIdentityProviderClient({
        region: "eu-west-2",
    });
};
