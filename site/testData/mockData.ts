import { UserStatusType } from "@aws-sdk/client-cognito-identity-provider";
import { Consequence, Disruption, DisruptionInfo, Service } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    Datasource,
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    PublishStatus,
    Severity,
    SocialMediaPostStatus,
    SourceType,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { mockRequest, mockResponse } from "mock-req-res";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import React from "react";
import { Mock, vi } from "vitest";
import { ParsedUrlQuery } from "querystring";
import { COOKIES_ID_TOKEN, COOKIES_POLICY_COOKIE } from "../constants";
import { Operator, ServiceApiResponse } from "../schemas/consequence.schema";
import { ExportDisruptions, FullDisruption } from "../schemas/disruption.schema";
import { defaultModes } from "../schemas/organisation.schema";
import { Session, SessionWithOrgDetail } from "../schemas/session.schema";
import { HootsuitePost } from "../schemas/social-media.schema";
import { getFutureDateAsString } from "../utils/dates";

export const DEFAULT_ORG_ID = "35bae327-4af0-4bbf-8bfa-2c085f214483";
export const DEFAULT_OPERATOR_ORG_ID = "e18499ff-779c-4e74-b5cb-623be0adf24f";
export const DEFAULT_DISRUPTION_ID = "8befe1e9-e317-45af-825a-e0254fabf49d";

export const DEFAULT_IMAGE_BUCKET_NAME = "cdd-image-bucket";

type RecordType = {
    [name: string]: string | string[] | undefined;
};

export interface GetMockContextInput {
    session?: Record<string, string> | null;
    cookies?: Record<string, string>;
    body?: Record<string, string | string[]> | null;
    url?: string | null;
    uuid?: string | null;
    mockWriteHeadFn?: Mock | null;
    mockEndFn?: Mock | null;
    isLoggedin?: boolean;
    query?: qs.ParsedQs | null;
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
        cookies: cookieValues,
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
    uuid = null,
    mockWriteHeadFn = vi.fn(),
    mockEndFn = vi.fn(),
    isLoggedin = true,
    url = null,
    query = null,
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
        query,
    });

    const ctx: NextPageContext = {
        res,
        req,
        pathname: "",
        query: query ? (query as ParsedUrlQuery) : {},
        AppTree: () => React.createElement("div"),
    };

    return ctx;
};

export interface GetMockRequestAndResponse {
    cookieValues?: Record<string, string>;
    body?: Record<string, string | string[] | RecordType | RecordType[]> | null;
    uuid?: string | null;
    mockWriteHeadFn?: Mock | null;
    mockEndFn?: Mock | null;
    requestHeaders?: Record<string, string> | null;
    isLoggedin?: boolean;
    url?: string | null;
    query?: qs.ParsedQs | null;
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
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
};

export const disruptionWithNoConsequences: FullDisruption = {
    publishStatus: PublishStatus.draft,
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
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
    template: false,
};

export const consequenceInfoOperatorTest: Consequence = {
    consequenceIndex: 0,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    consequenceType: "operatorWide",
    consequenceOperators: [{ operatorNoc: "FSYO", operatorPublicName: "Operator Name" }],
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

export const hootsuiteSocialMediaPosts: HootsuitePost[] = [
    {
        disruptionId: "f8d602b9-6e09-4fd7-b14b-deb1ca5b4f24",
        hootsuiteProfile: "127196025",
        image: {
            filepath: "/somefile/path",
            key: "e9f6962b-1e77-4d0b-9cr2-f123315fd14c/r8e603b8-6e08-4fd7-b12b-deb1ca5b4g23/1.png",
            mimetype: "image/png",
            originalFilename: "test-image.png",
            size: 70872,
        },
        messageContent: "Test post 12345",
        publishDate: "19/06/2023",
        publishTime: "1805",
        socialAccount: "13958638",
        socialMediaPostIndex: 0,
        status: SocialMediaPostStatus.successful,
        accountType: "Hootsuite",
    },
    {
        disruptionId: "f8d602b9-6e09-4fd7-b14b-deb1ca5b4f24",
        hootsuiteProfile: "127196025",
        image: {
            filepath: "/somefile/path",
            key: "e9f6962b-1e77-4d0b-9cr2-f123315fd14c/r8e603b8-6e08-4fd7-b12b-deb1ca5b4g23/1.png",
            mimetype: "image/png",
            originalFilename: "test-image.png",
            size: 70872,
        },
        messageContent: "Test post 1234567",
        publishDate: "20/06/2023",
        publishTime: "2005",
        socialAccount: "137196026",
        socialMediaPostIndex: 1,
        status: SocialMediaPostStatus.pending,
        accountType: "Hootsuite",
    },
];

export const disruptionWithConsequences: FullDisruption = {
    ...disruptionWithNoConsequences,
    consequences: [consequenceInfoNetworkTest, consequenceInfoOperatorTest],
};

export const disruptionWithConsequencesAndSocialMediaPosts: FullDisruption = {
    ...disruptionWithConsequences,
    socialMediaPosts: hootsuiteSocialMediaPosts,
};

export const disruptionArray: FullDisruption[] = [
    disruptionWithConsequencesAndSocialMediaPosts,
    {
        ...disruptionWithConsequencesAndSocialMediaPosts,
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
                Affects: {
                    Networks: { AffectedNetwork: { VehicleMode: "tram", AllLines: "" } },
                    Operators: { AllOperators: "" },
                },
                Advice: { Details: "Some consequence description" },
                Blocking: { JourneyPlanner: false },
            },
            {
                Condition: "unknown",
                Severity: "severe",
                Affects: {
                    Networks: { AffectedNetwork: { VehicleMode: "bus", AllLines: "" } },
                    Operators: { AffectedOperator: [{ OperatorRef: "FSYO", OperatorName: "Operator Name" }] },
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
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 323,
        lineName: "3V",
        operatorShortName: "Bobs Buses",
        destination: "Pub",
        origin: "Station",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 6758,
        lineName: "2",
        operatorShortName: "Bobs Buses",
        destination: "Stadium",
        origin: "Station",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 42545,
        lineName: "90A",
        operatorShortName: "Bobs Buses",
        destination: "Parliament Grove",
        origin: "King Street",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 63634,
        lineName: "553",
        operatorShortName: "Bobs Buses",
        destination: "Tree Lane",
        origin: "Swinnow",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 23523,
        lineName: "1AA",
        operatorShortName: "Bobs Buses",
        destination: "Blacksmiths",
        origin: "Nursery",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 141245,
        lineName: "88",
        operatorShortName: "Bobs Buses",
        destination: "High school lane",
        origin: "Bingo",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 235235,
        lineName: "4",
        operatorShortName: "Bobs Buses",
        destination: "Holiday Inn",
        origin: "Park",
        nocCode: "BB",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 23523,
        lineName: "72A",
        operatorShortName: "Daves Buses",
        destination: "School",
        origin: "Shops",
        nocCode: "DBS",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 235235,
        lineName: "22",
        operatorShortName: "Daves Buses",
        destination: "Hill",
        origin: "Tree",
        nocCode: "DBS",
        startDate: "2023-07-23",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        lineId: "SL1",
        endDate: "2023-08-10",
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

export const exportDisruption: ExportDisruptions = [
    {
        id: "8fg3ha",
        title: "Test summary",
        serviceModes: "Bus",
        operatorWide: "yes",
        networkWide: "no",
        servicesAffectedCount: 0,
        stopsAffectedCount: 5,
        startDate: "Tue 24 May 2023",
        endDate: "Tue 24 May 2023",
        severity: "Unknown",
        isLive: "yes",
        status: "Pending Approval",
    },
];

export const sortedDisruption: Disruption = {
    publishStatus: PublishStatus.draft,
    disruptionId: "test",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    associatedLink: "https://example.com",
    disruptionReason: MiscellaneousReason.accident,
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
    disruptionStartDate: "25/03/2021",
    disruptionStartTime: "1123",
    consequences: [
        {
            consequenceIndex: 0,
            consequenceOperators: [
                {
                    operatorNoc: "TEST",
                    operatorPublicName: "Test Op",
                },
            ],
            consequenceType: "operatorWide",
            description: "Test",
            disruptionId: DEFAULT_DISRUPTION_ID,
            disruptionSeverity: Severity.normal,
            removeFromJourneyPlanners: "yes",
            vehicleMode: VehicleMode.bus,
        },
        {
            consequenceIndex: 1,
            consequenceType: "networkWide",
            description: "Network test",
            disruptionId: DEFAULT_DISRUPTION_ID,
            disruptionSeverity: Severity.severe,
            removeFromJourneyPlanners: "yes",
            vehicleMode: VehicleMode.tram,
        },
        {
            consequenceIndex: 2,
            consequenceType: "services",
            disruptionDirection: "allDirections",
            services: [
                {
                    destination: "Dest",
                    origin: "Origin",
                    id: 123,
                    lineName: "Line",
                    nocCode: "NOC",
                    operatorShortName: "Test",
                    dataSource: Datasource.tnds,
                    lineId: "SL1",
                    startDate: "2023-08-10",
                    endDate: null,
                    serviceCode: "1234",
                },
            ],
            description: "Service test",
            disruptionId: DEFAULT_DISRUPTION_ID,
            disruptionSeverity: Severity.severe,
            removeFromJourneyPlanners: "yes",
            vehicleMode: VehicleMode.rail,
        },
    ],
    template: false,
    validity: [
        {
            disruptionStartDate: "25/03/2021",
            disruptionStartTime: "1123",
            disruptionEndDate: "30/03/2021",
            disruptionEndTime: "1123",
        },
        {
            disruptionStartDate: "25/12/2025",
            disruptionStartTime: "1123",
            disruptionEndDate: "30/12/2025",
            disruptionEndTime: "1123",
        },
        {
            disruptionStartDate: "25/03/2030",
            disruptionStartTime: "1123",
            disruptionEndDate: "30/03/2030",
            disruptionEndTime: "1123",
        },
    ],
};

export const mockTndsServicesNoDuplicates: ServiceApiResponse[] = [
    {
        id: 4513,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-07-23",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 4524,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-09-01",
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.tnds,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "SL1",
        endDate: "2023-09-23",
    },
    {
        id: 4547,
        nocCode: "SCMN",
        lineName: "253",
        startDate: "2023-08-15",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_253_1",
        dataSource: Datasource.tnds,
        origin: "Partington",
        destination: "Manchester",
        lineId: "SL1",
        endDate: null,
    },
];

export const mockTndsServicesWithDuplicates: ServiceApiResponse[] = [
    {
        id: 4513,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-07-23",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 4514,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-08-11",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.tnds,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "SL1",
        endDate: null,
    },
    {
        id: 4524,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-07-23",
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.tnds,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "SL1",
        endDate: "2023-08-10",
    },
    {
        id: 4525,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-08-11",
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.tnds,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "SL1",
        endDate: null,
    },
    {
        id: 4547,
        nocCode: "SCMN",
        lineName: "253",
        startDate: "2023-08-15",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_253_1",
        dataSource: Datasource.tnds,
        origin: "Partington",
        destination: "Manchester",
        lineId: "SL1",
        endDate: null,
    },
];

export const mockBodsServicesNoDuplicates: ServiceApiResponse[] = [
    {
        id: 4513,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-07-23",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.bods,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "LineId1",
        endDate: "2023-08-10",
    },
    {
        id: 4524,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-09-01",
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.bods,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "LineId2",
        endDate: "2023-09-23",
    },
    {
        id: 4547,
        nocCode: "SCMN",
        lineName: "253",
        startDate: "2023-08-15",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_253_1",
        dataSource: Datasource.bods,
        origin: "Partington",
        destination: "Manchester",
        lineId: "LineId3",
        endDate: null,
    },
];

export const mockBodsServicesWithDuplicates: ServiceApiResponse[] = [
    {
        id: 4514,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-08-09",
        endDate: null,
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.bods,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "LineId1",
    },
    {
        id: 4513,
        nocCode: "SCMN",
        lineName: "149",
        startDate: "2023-07-23",
        endDate: "2023-08-08",
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_149_1",
        dataSource: Datasource.bods,
        origin: "NMGH",
        destination: "Oldham circular",
        lineId: "LineId1",
    },
    {
        id: 4524,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-07-23",
        endDate: "2023-08-10",
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.bods,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "LineId2",
    },
    {
        id: 4525,
        nocCode: "GONW",
        lineName: "100",
        startDate: "2023-08-11",
        endDate: null,
        operatorShortName: "Go North West",
        serviceCode: "NW_04_GONW_100_1",
        dataSource: Datasource.bods,
        origin: "Manchester",
        destination: "Warrington",
        lineId: "LineId2",
    },
    {
        id: 4547,
        nocCode: "SCMN",
        lineName: "253",
        startDate: "2023-08-15",
        endDate: null,
        operatorShortName: "Stagecoach",
        serviceCode: "NW_04_SCMN_253_1",
        dataSource: Datasource.bods,
        origin: "Partington",
        destination: "Manchester",
        lineId: "LineId3",
    },
];

export const mockSession: Session = {
    email: "test@example.com",
    isOrgAdmin: false,
    isOrgPublisher: false,
    isOrgStaff: false,
    isSystemAdmin: true,
    isOperatorUser: false,
    orgId: DEFAULT_ORG_ID,
    username: "test@example.com",
    name: "Test User",
    operatorOrgId: null,
};

export const mockSessionWithOrgDetail: SessionWithOrgDetail = {
    email: "test@example.com",
    username: "test@example.com",
    orgId: DEFAULT_ORG_ID,
    adminAreaCodes: [],
    orgName: "Test Org",
    isOrgAdmin: true,
    isOrgPublisher: false,
    isOrgStaff: false,
    isSystemAdmin: false,
    name: "Test User",
    mode: defaultModes,
    isOperatorUser: false,
    operatorOrgId: null,
};

export const mockGetUserDetails = Promise.resolve({
    body: {},
    $metadata: { httpStatusCode: 302 },
    Username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
    UserStatus: UserStatusType.FORCE_CHANGE_PASSWORD,
    UserAttributes: [
        {
            Name: "custom:orgId",
            Value: DEFAULT_ORG_ID,
        },
        {
            Name: "given_name",
            Value: "dummy",
        },
        {
            Name: "family_name",
            Value: "user",
        },
        {
            Name: "email",
            Value: "dummy.user@gmail.com",
        },
    ],
});

export const mockDeleteAdminUser = Promise.resolve({
    body: {},
    $metadata: { httpStatusCode: 302 },
});
export const mockViewAllData = [
    {
        id: "c58ba826-ac18-41c5-8476-8172dfa6ea24",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-05T04:42:17.239Z", endTime: null }],
        modes: ["Tram"],
        status: Progress.open,
        severity: Severity.verySevere,
        serviceIds: ["1212", "323"],
        operators: ["BB"],
        displayId: "8fg3ha",
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
        consequenceLength: 1,
    },
    {
        id: "e234615d-8301-49c2-8143-1fca9dc187db",
        summary: "Alien attack - counter attack needed immediately to conserve human life. Aliens are known to be...",
        validityPeriods: [{ startTime: "2022-01-18T09:36:12.327Z", endTime: null }],
        modes: ["Tram"],
        status: Progress.open,
        severity: Severity.verySevere,
        serviceIds: ["42545"],
        operators: ["DB"],
        displayId: "8fg3ha",
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
        consequenceLength: 1,
    },
    {
        id: "dfd19560-99c1-4da6-8a73-de1220f37056",
        summary: "Busted reunion traffic",
        validityPeriods: [
            { startTime: "2022-01-19T11:41:12.445Z", endTime: "2022-01-26T11:41:12.445Z" },
            { startTime: "2023-04-14T04:21:29.085Z", endTime: null },
            { startTime: "2024-05-04T08:18:40.131Z", endTime: "2024-05-11T08:18:40.131Z" },
        ],
        modes: ["Tram", "Ferry", "Train"],
        status: Progress.draft,
        severity: Severity.severe,
        serviceIds: ["6758"],
        operators: ["BB", "SB"],
        displayId: "8fg3ha",
        isOperatorWideCq: true,
        isNetworkWideCq: true,
        isLive: true,
        stopsAffectedCount: 0,
    },
];

export const createDisruptionWithConsquences = (consequences: Consequence[]): FullDisruption => {
    const defaultDisruptionStartDate = getFutureDateAsString(2);
    const defaultPublishStartDate = getFutureDateAsString(1);
    const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
    return {
        disruptionId: defaultDisruptionId,
        disruptionType: "planned",
        summary: "A test disruption",
        description: "oh no",
        associatedLink: "",
        disruptionReason: MiscellaneousReason.accident,
        publishStartDate: defaultPublishStartDate,
        publishStartTime: "1900",
        disruptionStartDate: defaultDisruptionStartDate,
        disruptionStartTime: "1800",
        disruptionNoEndDateTime: "true",
        disruptionRepeats: "doesntRepeat",
        disruptionRepeatsEndDate: "",
        validity: [],
        publishStatus: PublishStatus.editing,
        consequences: consequences,
        displayId: "8fg3ha",
        orgId: DEFAULT_ORG_ID,
        template: false,
    };
};

export const mockOrgAdmins = [
    {
        Attributes: [
            { Name: "sub", Value: "test-sub" },
            { Name: "email_verified", Value: "true" },
            { Name: "custom:orgId", Value: DEFAULT_ORG_ID },
            { Name: "custom:disruptionEmailPref", Value: "true" },
            { Name: "given_name", Value: "Test1" },
            { Name: "family_name", Value: "Test1" },
            { Name: "email", Value: "emailtoshow@test.com" },
        ],
        Enabled: true,
        UserCreateDate: new Date(),
        UserLastModifiedDate: new Date(),
        UserStatus: UserStatusType.CONFIRMED,
        Username: "username",
    },
    {
        Attributes: [
            { Name: "sub", Value: "test-sub" },
            { Name: "email_verified", Value: "true" },
            { Name: "custom:orgId", Value: "orgId To Be Omitted" },
            { Name: "custom:disruptionEmailPref", Value: "false" },
            { Name: "given_name", Value: "Test2" },
            { Name: "family_name", Value: "Test2" },
            { Name: "email", Value: "emailthatshouldnotshow@test.com" },
        ],
        Enabled: true,
        UserCreateDate: new Date(),
        UserLastModifiedDate: new Date(),
        UserStatus: UserStatusType.CONFIRMED,
        Username: "username",
    },
];
