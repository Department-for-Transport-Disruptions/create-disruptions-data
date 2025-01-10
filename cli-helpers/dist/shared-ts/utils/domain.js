export const getDomain = (stage, internalOnly = false) => {
    const { ROOT_DOMAIN: rootDomain, PROD_DOMAIN: prodDomain } = process.env;
    if (prodDomain && !internalOnly) {
        return prodDomain;
    }
    if (!rootDomain) {
        throw new Error("ROOT_DOMAIN must be set");
    }
    const stageToUse = ["test", "preprod", "prod"].includes(stage) ? stage : "sandbox";
    return `${stageToUse}.cdd.${rootDomain}`;
};
export const isSandbox = (stage) => !["test", "preprod", "prod"].includes(stage);
