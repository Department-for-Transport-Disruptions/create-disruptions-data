import { randomUUID } from "crypto";
import { DisruptionInfo, OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    disruptionInfoSchema,
    operatorConsequenceSchema,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import {
    MiscellaneousReason,
    Modes,
    PublishStatus,
    Severity,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { describe, expect, it } from "vitest";
import {
    filterDisruptionsForOperatorUser,
    generatePassword,
    getStopTypesByVehicleMode,
    removeDuplicatesBasedOnMode,
    splitCamelCaseToString,
    toTitleCase,
} from ".";
import { CD_DATE_FORMAT, MIN_PASSWORD_LENGTH } from "../constants";
import { Operator } from "../schemas/consequence.schema";
import { DEFAULT_ORG_ID, disruptionWithNoConsequences } from "../testData/mockData";
import { getPageState } from "./apiUtils";
import { getFutureDateAsString } from "./dates";

describe("utils tests", () => {
    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
        ["draft pending approval", "Draft pending approval"],
        ["", ""],
    ])("should convert text to sentence case", (text, formattedText) => {
        expect(splitCamelCaseToString(text)).toEqual(formattedText);
    });
});

describe("page state test", () => {
    it("should parse to expected type for DisruptionPageInputs", () => {
        const defaultDisruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const defaultDisruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const defaultPublishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

        const disruptionData: DisruptionInfo = {
            disruptionId: randomUUID(),
            disruptionType: "unplanned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            associatedLink: "",
            disruptionReason: MiscellaneousReason.roadworks,
            publishStartDate: defaultPublishStartDate,
            publishStartTime: "1100",
            publishEndDate: "",
            publishEndTime: "",
            disruptionStartDate: defaultDisruptionStartDate,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionStartTime: "1000",
            disruptionEndTime: "1100",
            disruptionNoEndDateTime: "",
            displayId: "8fg3ha",
            orgId: DEFAULT_ORG_ID,
        };

        const parsedInput = getPageState("", disruptionInfoSchema, disruptionData.disruptionId, disruptionData);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(disruptionData);
    });

    it("should parse to expected type for ConsequenceOperatorPageInputs", () => {
        const operatorData: OperatorConsequence = {
            disruptionId: randomUUID(),
            consequenceIndex: 0,
            consequenceOperators: [{ operatorNoc: "FSYO", operatorPublicName: "Operator Name" }],
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: Severity.slight,
            vehicleMode: VehicleMode.bus,
            consequenceType: "operatorWide",
        };

        const parsedInput = getPageState("", operatorConsequenceSchema, operatorData.disruptionId, operatorData);

        expect(parsedInput).not.toBeNull();
        expect(parsedInput.inputs).toEqual(operatorData);
    });
});

describe("filterDisruptionsForOperatorUser", () => {
    const baseOperatorInput = [
        {
            ...disruptionWithNoConsequences,
            publishStatus: PublishStatus.published,
            createdByOperatorOrgId: "test operator",
        },
        { ...disruptionWithNoConsequences, createdByOperatorOrgId: "test operator" },
    ];
    it("should remove disruptions that are from a different operator sub organisation", () => {
        const disruptionsArray = [
            ...baseOperatorInput,
            { ...disruptionWithNoConsequences, createdByOperatorOrgId: "a different operator" },
            {
                ...disruptionWithNoConsequences,
                publishStatus: PublishStatus.published,
                createdByOperatorOrgId: "a different operator",
            },
            {
                ...disruptionWithNoConsequences,
                publishStatus: PublishStatus.draft,
                createdByOperatorOrgId: "a different operator",
            },
        ];

        const result = filterDisruptionsForOperatorUser(disruptionsArray, "test operator");

        expect(result).toEqual([disruptionsArray[0], disruptionsArray[1]]);
    });

    it("should remove disruptions created by the LTA org that are not in a published state", () => {
        const disruptionsArray = [
            ...baseOperatorInput,
            { ...disruptionWithNoConsequences },
            { ...disruptionWithNoConsequences, publishStatus: PublishStatus.editPendingApproval },
            { ...disruptionWithNoConsequences, publishStatus: PublishStatus.pendingApproval },
            { ...disruptionWithNoConsequences, publishStatus: PublishStatus.editing },
            { ...disruptionWithNoConsequences, publishStatus: PublishStatus.rejected },
        ];

        const result = filterDisruptionsForOperatorUser(disruptionsArray, "test operator");

        expect(result).toEqual([disruptionsArray[0], disruptionsArray[1]]);
    });

    it("should retain disruptions created by the LTA org that are in a published state", () => {
        const disruptionsArray = [
            ...baseOperatorInput,
            { ...disruptionWithNoConsequences, publishStatus: PublishStatus.published },
        ];

        const result = filterDisruptionsForOperatorUser(disruptionsArray, "test operator");

        expect(result).toEqual(disruptionsArray);
    });
});

describe("toTitleCase", () => {
    it.each([
        ["KING STREET", "King Street"],
        ["king street", "King Street"],
        ["HYPHENATED-STREET", "Hyphenated-Street"],
        ["hyphenated-street", "Hyphenated-Street"],
        ["RanDoM cAsE", "Random Case"],
        ["", ""],
    ])("should convert text to title case", (text, formattedText) => {
        expect(toTitleCase(text)).toEqual(formattedText);
    });
});

describe("removeDuplicatesBasedOnMode", () => {
    const data: Operator[] = [
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "bods",
            dateCeased: "",
            id: 2744,
            mode: "",
            nocCdQual: "",
            nocCode: "SLNE",
            opId: "138266",
            operatorPublicName: "Starline",
            pubNmId: "96090",
            vosaPsvLicenseName: "",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "tnds",
            dateCeased: "",
            id: 2744,
            mode: "bus",
            nocCdQual: "",
            nocCode: "SLNE",
            opId: "138266",
            operatorPublicName: "Starline",
            pubNmId: "96090",
            vosaPsvLicenseName: "",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "tnds",
            dateCeased: "",
            id: 2777,
            mode: "bus",
            nocCdQual: "",
            nocCode: "SNCH",
            opId: "137643",
            operatorPublicName: "Shane Nuttall",
            pubNmId: "95312",
            vosaPsvLicenseName: "Shane Raymond Nuttall",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "bods",
            dateCeased: "",
            id: 2877,
            mode: "bus",
            nocCdQual: "",
            nocCode: "NATX",
            opId: "137214",
            operatorPublicName: "National Express",
            pubNmId: "94868",
            vosaPsvLicenseName: "National Express Ltd",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "bods",
            dateCeased: "",
            id: 2877,
            mode: "coach",
            nocCdQual: "",
            nocCode: "NATX",
            opId: "137214",
            operatorPublicName: "National Express",
            pubNmId: "94868",
            vosaPsvLicenseName: "National Express Ltd",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "tnds",
            dateCeased: "",
            id: 2877,
            mode: "coach",
            nocCdQual: "",
            nocCode: "NATX",
            opId: "137214",
            operatorPublicName: "National Express",
            pubNmId: "94868",
            vosaPsvLicenseName: "National Express Ltd",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "tnds",
            dateCeased: "",
            id: 3009,
            mode: "bus",
            nocCdQual: "",
            nocCode: "NVTR",
            opId: "137292",
            operatorPublicName: "Nu-Venture",
            pubNmId: "94947",
            vosaPsvLicenseName: "Nu-Venture Coaches Ltd",
        },
        {
            changeAgent: "",
            changeComment: "",
            changeDate: "",
            dataOwner: "",
            dataSource: "bods",
            dateCeased: "",
            id: 3009,
            mode: "",
            nocCdQual: "",
            nocCode: "NVTR",
            opId: "137292",
            operatorPublicName: "Nu-Venture",
            pubNmId: "94947",
            vosaPsvLicenseName: "Nu-Venture Coaches Ltd",
        },
    ];

    it("should remove duplicates based on id and mode", () => {
        const result = removeDuplicatesBasedOnMode(data, "id");
        const expected = [
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "bods",
                dateCeased: "",
                id: 2744,
                mode: "",
                nocCdQual: "",
                nocCode: "SLNE",
                opId: "138266",
                operatorPublicName: "Starline",
                pubNmId: "96090",
                vosaPsvLicenseName: "",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "tnds",
                dateCeased: "",
                id: 2744,
                mode: "bus",
                nocCdQual: "",
                nocCode: "SLNE",
                opId: "138266",
                operatorPublicName: "Starline",
                pubNmId: "96090",
                vosaPsvLicenseName: "",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "tnds",
                dateCeased: "",
                id: 2777,
                mode: "bus",
                nocCdQual: "",
                nocCode: "SNCH",
                opId: "137643",
                operatorPublicName: "Shane Nuttall",
                pubNmId: "95312",
                vosaPsvLicenseName: "Shane Raymond Nuttall",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "bods",
                dateCeased: "",
                id: 2877,
                mode: "bus",
                nocCdQual: "",
                nocCode: "NATX",
                opId: "137214",
                operatorPublicName: "National Express",
                pubNmId: "94868",
                vosaPsvLicenseName: "National Express Ltd",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "bods",
                dateCeased: "",
                id: 2877,
                mode: "coach",
                nocCdQual: "",
                nocCode: "NATX",
                opId: "137214",
                operatorPublicName: "National Express",
                pubNmId: "94868",
                vosaPsvLicenseName: "National Express Ltd",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "tnds",
                dateCeased: "",
                id: 3009,
                mode: "bus",
                nocCdQual: "",
                nocCode: "NVTR",
                opId: "137292",
                operatorPublicName: "Nu-Venture",
                pubNmId: "94947",
                vosaPsvLicenseName: "Nu-Venture Coaches Ltd",
            },
            {
                changeAgent: "",
                changeComment: "",
                changeDate: "",
                dataOwner: "",
                dataSource: "bods",
                dateCeased: "",
                id: 3009,
                mode: "",
                nocCdQual: "",
                nocCode: "NVTR",
                opId: "137292",
                operatorPublicName: "Nu-Venture",
                pubNmId: "94947",
                vosaPsvLicenseName: "Nu-Venture Coaches Ltd",
            },
        ];

        expect(result).toEqual(expected);
    });

    it("should return an empty array if input is an empty array", () => {
        const result = removeDuplicatesBasedOnMode([], "id");

        expect(result).toEqual([]);
    });
});

describe("generatePassword", () => {
    const validatePassword = (password: string) => {
        if (password.length < MIN_PASSWORD_LENGTH) {
            return false;
        }

        if (!/[A-Z]/.test(password)) {
            return false;
        }

        if (!/[a-z]/.test(password)) {
            return false;
        }

        if (!/[0-9]/.test(password)) {
            return false;
        }

        return /[$^*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+-]/.test(password);
    };

    it("should generate a password that conforms to the password policy", () => {
        const password = generatePassword(20);

        const isPasswordValid = validatePassword(password);

        expect(isPasswordValid).toEqual(true);
    });
});
describe("getStopTypesByVehicleMode", () => {
    it.each([
        [VehicleMode.bus, ["BCT", "BCS", "BCQ"]],
        [VehicleMode.coach, ["BCT", "BCS", "BCQ"]],
        [VehicleMode.tram, ["MET", "PLT"]],
        [Modes.metro, ["MET", "PLT"]],
        [VehicleMode.underground, ["MET", "PLT"]],
        [Modes.ferry, ["FER", "FBT"]],
        [VehicleMode.ferryService, ["FER", "FBT"]],
    ])("should return the correct stop types for a given mode", (mode, stopType) => {
        expect(getStopTypesByVehicleMode(mode)).toEqual(stopType);
    });
});
