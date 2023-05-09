/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import {
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    Severity,
    SourceType,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { mockRequest, mockResponse } from "mock-req-res";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import React from "react";
import { Mock, vi } from "vitest";
import { COOKIES_ID_TOKEN, COOKIES_POLICY_COOKIE } from "../constants";
import { Consequence, Operator, Service } from "../schemas/consequence.schema";
import { DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";

export const DEFAULT_USER_ID = "ee8a8395-fcb8-4e72-be1f-022c207292cd";

export interface GetMockContextInput {
    session?: { [key: string]: any };
    cookies?: any;
    body?: any;
    url?: any;
    uuid?: any;
    mockWriteHeadFn?: Mock<any, any>;
    mockEndFn?: Mock<any, any>;
    isLoggedin?: boolean;
    query?: any;
}

export const getMockRequestAndResponse = ({
    cookieValues = {},
    body = null,
    mockWriteHeadFn = vi.fn(),
    mockEndFn = vi.fn(),
    requestHeaders = {},
    isLoggedin = true,
    url = null,
    query = null,
}: GetMockRequestAndResponse = {}): { req: NextApiRequest; res: NextApiResponse } => {
    const res = mockResponse({ writeHead: mockWriteHeadFn, end: mockEndFn });

    const {
        idToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZThhODM5NS1mY2I4LTRlNzItYmUxZi0wMjJjMjA3MjkyY2QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJjdXN0b206b3JnSWQiOiIzNWJhZTMyNy00YWYwLTRiYmYtOGJmYS0yYzA4NWYyMTQ0ODMiLCJjb2duaXRvOmdyb3VwcyI6WyJzeXN0ZW0tYWRtaW5zIl19.POSmQ0BvCrpRECR4rdDrPNzK9anmZXo7QIdSYYzpJik",
        cookiePolicy = null,
    } = cookieValues;

    const defaultSession = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        destroy: (): void => {},
    };

    let cookieString = "";

    cookieString += isLoggedin ? `${COOKIES_ID_TOKEN}=${idToken};` : "";

    cookieString += cookiePolicy ? `${COOKIES_POLICY_COOKIE}=${encodeURI(JSON.stringify(cookiePolicy))}` : "";

    if (cookieValues) {
        Object.entries(cookieValues).forEach((value) => {
            cookieString += `${value[0]}=${encodeURI(value[1])};`;
        });
    }

    const req = mockRequest({
        connection: {
            encrypted: true,
        },
        url,
        headers: {
            host: "localhost:3000",
            cookie: cookieString,
            origin: "localhost:3000",
            ...requestHeaders,
        },
        cookies: cookieString.split(";").reduce((p, c) => {
            const splitCookie = c.split("=");

            return {
                ...p,
                [splitCookie[0]]: splitCookie[1],
            };
        }, {}),
        session: { ...defaultSession },
    });

    if (body) {
        req.body = body;
    }
    if (query) {
        req.query = query;
    }

    return { req: req as unknown as NextApiRequest, res: res as unknown as NextApiResponse };
};

export const getMockContext = ({
    cookies = {},
    body = null,
    uuid = {},
    mockWriteHeadFn = vi.fn(),
    mockEndFn = vi.fn(),
    isLoggedin = true,
    url = null,
    query = "",
}: GetMockContextInput = {}): NextPageContext => {
    const { req, res } = getMockRequestAndResponse({
        cookieValues: cookies,
        body,
        uuid,
        mockWriteHeadFn,
        mockEndFn,
        requestHeaders: {},
        isLoggedin,
        url,
    });

    const ctx: NextPageContext = {
        res,
        req,
        pathname: "",
        query,
        // eslint-disable-next-line react/display-name
        AppTree: () => React.createElement("div"),
    };

    return ctx;
};

export interface GetMockRequestAndResponse {
    cookieValues?: { [key: string]: string };
    body?: any;
    uuid?: any;
    mockWriteHeadFn?: Mock<any, any>;
    mockEndFn?: Mock<any, any>;
    requestHeaders?: any;
    isLoggedin?: boolean;
    url?: any;
    query?: any;
}

export const databaseData: PtSituationElement[] = [
    {
        CreationTime: "2023-01-01T01:10:00Z",
        ParticipantRef: "ref",
        SituationNumber: "aaaaa-bbbbb-ccccc",
        Version: 1,
        Source: {
            SourceType: SourceType.feed,
            TimeOfCommunication: "2023-01-01T01:10:00Z",
        },
        Progress: Progress.open,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
            },
        ],
        PublicationWindow: {
            StartTime: "2023-03-02T10:10:00Z",
            EndTime: "2023-03-09T10:10:00Z",
        },
        ReasonType: "PersonnelReason",
        PersonnelReason: PersonnelReason.staffSickness,
        Planned: true,
        Summary: "Disruption Summary",
        Description: "Disruption Description",
    },
    {
        PublicationWindow: {
            StartTime: "2023-03-05T10:10:00Z",
            EndTime: "2023-05-09T10:10:00Z",
        },
        Source: {
            SourceType: SourceType.directReport,
            TimeOfCommunication: "2023-02-02T10:10:00Z",
        },
        ReasonType: "MiscellaneousReason",
        MiscellaneousReason: MiscellaneousReason.vegetation,
        CreationTime: "2023-02-02T05:10:00Z",
        ParticipantRef: "ref2",
        SituationNumber: "11111-22222-33333",
        Version: 2,
        Progress: Progress.closing,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
                EndTime: "2023-05-01T01:10:00Z",
            },
            {
                StartTime: "2023-05-03T01:10:00Z",
            },
        ],
        Planned: false,
        Summary: "Disruption Summary 2",
        Description: "Disruption Description 2",
        InfoLinks: {
            InfoLink: [
                {
                    Uri: "https://example.com",
                },
                {
                    Uri: "https://example.com/2",
                },
            ],
        },
        References: {
            RelatedToRef: [
                {
                    ParticipantRef: "ref",
                    CreationTime: "2023-01-01T01:10:00Z",
                    SituationNumber: "aaaaa-bbbbb-ccccc",
                },
            ],
        },
    },
    {
        PublicationWindow: {
            StartTime: "2023-03-05T10:10:00Z",
        },
        Source: {
            SourceType: SourceType.directReport,
            TimeOfCommunication: "2023-02-02T10:10:00Z",
        },
        ReasonType: "EnvironmentReason",
        EnvironmentReason: EnvironmentReason.grassFire,
        CreationTime: "2023-03-05T05:10:00Z",
        ParticipantRef: "ref3",
        SituationNumber: "ddddd-eeeee-fffff",
        Version: 1,
        Progress: Progress.published,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
            },
        ],
        Planned: true,
        Summary: "Disruption Summary 3",
        Description: "Disruption Description 3",
        Repetitions: {
            DayType: [DayType.saturday, DayType.sunday],
        },
    },
];

export const randomlyGeneratedDisruptions: PtSituationElement[] = [
    {
        CreationTime: "2023-01-01T01:10:00Z",
        ParticipantRef: "ref",
        SituationNumber: "cd544ea5-f9a0-4bba-b535-3352f39c1597",
        Version: 1,
        Source: {
            SourceType: SourceType.feed,
            TimeOfCommunication: "2023-01-01T01:10:00Z",
        },
        Progress: Progress.open,
        ValidityPeriod: [{ StartTime: "2024-10-03T05:48:00.755Z" }],
        PublicationWindow: {
            StartTime: "2023-03-02T10:10:00Z",
            EndTime: "2023-03-09T10:10:00Z",
        },
        ReasonType: "PersonnelReason",
        PersonnelReason: PersonnelReason.staffSickness,
        Planned: true,
        Summary:
            "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be weak to bus information.",
        Description: "Disruption Description",
        Consequences: {
            Consequence: [
                {
                    Condition: "unknown",
                    Severity: Severity.verySevere,
                    Affects: {
                        Networks: {
                            AffectedNetwork: { VehicleMode: VehicleMode.tram, AllLines: "" },
                        },
                    },
                    Advice: { Details: "Some Advice" },
                    Blocking: { JourneyPlanner: false },
                    Delays: { Delay: "PT10M" },
                },
            ],
        },
    },
    {
        CreationTime: "2023-01-01T01:10:00Z",
        ParticipantRef: "ref",
        SituationNumber: "d4e5f0d0-7222-45b1-a12d-38113fbc4e93",
        Version: 1,
        Source: { SourceType: SourceType.feed, TimeOfCommunication: "2023-01-01T01:10:00Z" },
        Progress: Progress.draft,
        ValidityPeriod: [{ StartTime: "2022-10-23T17:37:27.197Z", EndTime: "2022-10-30T17:37:27.197Z" }],
        PublicationWindow: { StartTime: "2023-03-02T10:10:00Z", EndTime: "2023-03-09T10:10:00Z" },
        ReasonType: "PersonnelReason",
        PersonnelReason: PersonnelReason.staffSickness,
        Planned: true,
        Summary: "Mongeese loose from petting zoo",
        Description: "Disruption Description",
        Consequences: {
            Consequence: [
                {
                    Condition: "unknown",
                    Severity: Severity.verySlight,
                    Affects: { Networks: { AffectedNetwork: { VehicleMode: VehicleMode.bus, AllLines: "" } } },
                    Advice: { Details: "Some Advice" },
                    Blocking: { JourneyPlanner: false },
                    Delays: { Delay: "PT10M" },
                },
            ],
        },
    },
];

export const disruptionInfoTest: DisruptionInfo = {
    disruptionId: "test",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    associatedLink: "https://example.com",
    disruptionReason: EnvironmentReason.grassFire,
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "10/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
};

export const disruptionWithNoConsequences: Disruption = {
    publishStatus: "DRAFT",
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: PersonnelReason.staffInWrongPlace,
    validity: [
        {
            disruptionStartDate: "10/03/2023",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/03/2023",
            disruptionEndTime: "1700",
        },
    ],
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
    consequences: [],
};

export const consequenceInfoOperatorTest: Consequence = {
    consequenceIndex: 0,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    consequenceType: "operatorWide",
    consequenceOperators: ["FSYO"],
    description: "Some consequence description",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    removeFromJourneyPlanners: "yes",
    disruptionDelay: "40",
};

export const consequenceInfoNetworkTest: Consequence = {
    consequenceIndex: 1,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    consequenceType: "networkWide",
    description: "Some consequence description",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.tram,
    removeFromJourneyPlanners: "no",
};

export const disruptionWithConsequences: Disruption = {
    ...disruptionWithNoConsequences,
    consequences: [consequenceInfoNetworkTest, consequenceInfoOperatorTest],
};

export const disruptionArray: Disruption[] = [
    disruptionWithConsequences,
    {
        ...disruptionWithConsequences,
        validity: [],
        disruptionStartDate: "10/03/2022",
        disruptionStartTime: "1100",
        disruptionNoEndDateTime: "true",
    },
    disruptionWithNoConsequences,
];

export const ptSituationElementWithMultipleConsequences = {
    CreationTime: "2023-03-03T00:00:00.000Z",
    Planned: true,
    Summary: "Some summary",
    Description: "Test description",
    ParticipantRef: "DepartmentForTransport",
    SituationNumber: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    PublicationWindow: { StartTime: "2023-03-10T12:00:00.000Z" },
    ValidityPeriod: [
        { StartTime: "2023-03-10T12:00:00.000Z", EndTime: "2023-03-17T17:00:00.000Z" },
        { StartTime: "2023-03-18T12:00:00.000Z" },
    ],
    Progress: "open",
    Source: { SourceType: "feed", TimeOfCommunication: "2023-03-03T00:00:00.000Z" },
    Consequences: {
        Consequence: [
            {
                Condition: "unknown",
                Severity: "slight",
                Affects: { Networks: { AffectedNetwork: { VehicleMode: "tram", AllLines: "" } } },
                Advice: { Details: "Some consequence description" },
                Blocking: { JourneyPlanner: false },
            },
            {
                Condition: "unknown",
                Severity: "severe",
                Affects: {
                    Networks: { AffectedNetwork: { VehicleMode: "bus", AllLines: "" } },
                    Operators: { AffectedOperator: [{ OperatorRef: "FSYO" }] },
                },
                Advice: { Details: "Some consequence description" },
                Blocking: { JourneyPlanner: true },
                Delays: { Delay: "PT40M" },
            },
        ],
    },
    ReasonType: "PersonnelReason",
    PersonnelReason: "staffInWrongPlace",
};

export const mockServices: Service[] = [
    {
        id: 1212,
        lineName: "72A",
        operatorShortName: "Bobs Buses",
        destination: "Town",
        origin: "Station",
        nocCode: "BB",
    },
    {
        id: 323,
        lineName: "3V",
        operatorShortName: "Bobs Buses",
        destination: "Pub",
        origin: "Station",
        nocCode: "BB",
    },
    {
        id: 6758,
        lineName: "2",
        operatorShortName: "Bobs Buses",
        destination: "Stadium",
        origin: "Station",
        nocCode: "BB",
    },
    {
        id: 42545,
        lineName: "90A",
        operatorShortName: "Bobs Buses",
        destination: "Parliament Grove",
        origin: "King Street",
        nocCode: "BB",
    },
    {
        id: 63634,
        lineName: "553",
        operatorShortName: "Bobs Buses",
        destination: "Tree Lane",
        origin: "Swinnow",
        nocCode: "BB",
    },
    {
        id: 23523,
        lineName: "1AA",
        operatorShortName: "Bobs Buses",
        destination: "Blacksmiths",
        origin: "Nursery",
        nocCode: "BB",
    },
    {
        id: 141245,
        lineName: "88",
        operatorShortName: "Bobs Buses",
        destination: "High school lane",
        origin: "Bingo",
        nocCode: "BB",
    },
    {
        id: 235235,
        lineName: "4",
        operatorShortName: "Bobs Buses",
        destination: "Holiday Inn",
        origin: "Park",
        nocCode: "BB",
    },
    {
        id: 23523,
        lineName: "72A",
        operatorShortName: "Daves Buses",
        destination: "School",
        origin: "Shops",
        nocCode: "DBS",
    },
    {
        id: 235235,
        lineName: "22",
        operatorShortName: "Daves Buses",
        destination: "Hill",
        origin: "Tree",
        nocCode: "DBS",
    },
];
export const mockOperators: Operator[] = [
    {
        id: 1,
        nocCode: "1CTL",
        operatorPublicName: "1st Choice Transport Ltd",
        vosaPsvLicenseName: "1St Choice Transport Ltd",
        opId: "135427",
        pubNmId: "93089",
        nocCdQual: "",
        changeDate: "",
        changeAgent: "",
        changeComment: "",
        dateCeased: "",
        dataOwner: "",
    },
    {
        id: 3,
        nocCode: "2WTR",
        operatorPublicName: "2 Way Transport",
        vosaPsvLicenseName: "2 Way Transport",
        opId: "135428",
        pubNmId: "93090",
        nocCdQual: "",
        changeDate: "",
        changeAgent: "",
        changeComment: "",
        dateCeased: "",
        dataOwner: "",
    },
    {
        id: 4,
        nocCode: "3DCO",
        operatorPublicName: "3D Coaches",
        vosaPsvLicenseName: "Peter Kermeen & Elaine Fletcher",
        opId: "137388",
        pubNmId: "93092",
        nocCdQual: "",
        changeDate: "",
        changeAgent: "",
        changeComment: "",
        dateCeased: "",
        dataOwner: "",
    },
    {
        id: 5,
        nocCode: "5STR",
        operatorPublicName: "Five Star International Travel",
        vosaPsvLicenseName: "Philip Riley",
        opId: "137408",
        pubNmId: "94084",
        nocCdQual: "",
        changeDate: "",
        changeAgent: "",
        changeComment: "",
        dateCeased: "",
        dataOwner: "",
    },
    {
        id: 6,
        nocCode: "8H",
        operatorPublicName: "Highland Airways",
        vosaPsvLicenseName: "Highland Airways",
        opId: "136620",
        pubNmId: "94334",
        nocCdQual: "",
        changeDate: "",
        changeAgent: "",
        changeComment: "",
        dateCeased: "",
        dataOwner: "",
    },
];
