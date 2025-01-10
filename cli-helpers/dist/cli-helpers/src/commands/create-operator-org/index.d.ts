import { Command } from "@oclif/core";
export declare const createOperatorSubOrganisation: (orgId: string, operatorName: string, nocCodes: string[], stage: string) => Promise<`${string}-${string}-${string}-${string}-${string}`>;
export default class CreateOperatorOrg extends Command {
    static description: string;
    static flags: {
        orgId: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        name: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        nocCodes: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        stage: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
    };
    run(): Promise<void>;
}
