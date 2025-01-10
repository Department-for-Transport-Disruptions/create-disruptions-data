export declare const getDbClient: () => import("@prisma/client/runtime/library").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {
        disruption: {
            disruptionId: () => {
                needs: {
                    id: true;
                };
                compute(disruption: {
                    id: string;
                }): string;
            };
            creationTime: () => {
                needs: {
                    creationTime: true;
                };
                compute(disruption: {
                    creationTime: Date;
                }): string;
            };
            lastUpdated: () => {
                needs: {
                    lastUpdated: true;
                };
                compute(disruption: {
                    lastUpdated: Date;
                }): string;
            };
        };
        disruptionEdited: {
            disruptionId: () => {
                needs: {
                    id: true;
                };
                compute(disruption: {
                    id: string;
                }): string;
            };
            creationTime: () => {
                needs: {
                    creationTime: true;
                };
                compute(disruption: {
                    creationTime: Date;
                }): string;
            };
            lastUpdated: () => {
                needs: {
                    lastUpdated: true;
                };
                compute(disruption: {
                    lastUpdated: Date;
                }): string;
            };
        };
    };
    model: {};
    query: {};
    client: {};
}, import("@prisma/client").Prisma.PrismaClientOptions>, import("@prisma/client").Prisma.TypeMapCb, {
    result: {
        disruption: {
            disruptionId: () => {
                needs: {
                    id: true;
                };
                compute(disruption: {
                    id: string;
                }): string;
            };
            creationTime: () => {
                needs: {
                    creationTime: true;
                };
                compute(disruption: {
                    creationTime: Date;
                }): string;
            };
            lastUpdated: () => {
                needs: {
                    lastUpdated: true;
                };
                compute(disruption: {
                    lastUpdated: Date;
                }): string;
            };
        };
        disruptionEdited: {
            disruptionId: () => {
                needs: {
                    id: true;
                };
                compute(disruption: {
                    id: string;
                }): string;
            };
            creationTime: () => {
                needs: {
                    creationTime: true;
                };
                compute(disruption: {
                    creationTime: Date;
                }): string;
            };
            lastUpdated: () => {
                needs: {
                    lastUpdated: true;
                };
                compute(disruption: {
                    lastUpdated: Date;
                }): string;
            };
        };
    };
    model: {};
    query: {};
    client: {};
}, {
    datasourceUrl: any;
}>;
