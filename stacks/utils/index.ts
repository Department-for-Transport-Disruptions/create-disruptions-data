export const getDomain = (stage: string) => {
    const { ROOT_DOMAIN: rootDomain } = process.env;

    if (!rootDomain) {
        throw new Error("ROOT_DOMAIN must be set");
    }

    const stageToUse = ["test", "preprod", "prod"].includes(stage) ? stage : "sandbox";

    return `${stageToUse}.cdd.${rootDomain}`;
};

export const isSandbox = (stage: string) => !["test", "preprod", "prod"].includes(stage);
