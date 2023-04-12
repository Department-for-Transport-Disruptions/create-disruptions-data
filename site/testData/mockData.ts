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
import { COOKIE_ID_TOKEN, COOKIES_POLICY_COOKIE } from "../constants";
import { Consequence } from "../schemas/consequence.schema";
import { DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";

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
        idToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjdXN0b206bm9jIjoiVEVTVCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImp0aSI6Ijg1MmQ1MTVlLTU5YWUtNDllZi1iMTA5LTI4YTRhNzk3YWFkNSIsImlhdCI6MTU5Mjk4NzMwNywiZXhwIjoxNTkyOTkwOTA3fQ.DFdxnpdhykDONOMeZMNeMUFpCHZ-hQ3UXczq_Qh0IAI",
        cookiePolicy = null,
    } = cookieValues;

    const defaultSession = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        destroy: (): void => {},
    };

    let cookieString = "";

    cookieString += isLoggedin ? `${COOKIE_ID_TOKEN}=${idToken};` : "";

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

export const disruptionInfoTestCookie: DisruptionInfo = {
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

export const disruptionInfoMultipleValidityTestCookie: DisruptionInfo = {
    disruptionId: "test",
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
};

export const disruptionInfoMultipleValidityTest: Disruption[] = [
    {
        disruptionId: "test",
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
    },
];

export const consequenceInfoOperatorTestCookie: Consequence = {
    consequenceIndex: 0,
    disruptionId: "test",
    consequenceType: "operatorWide",
    consequenceOperator: "FSYO",
    description: "Some consequence description",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    removeFromJourneyPlanners: "yes",
    disruptionDelay: "40",
};

export const consequenceInfoNetworkTestCookie: Consequence = {
    consequenceIndex: 0,
    disruptionId: "test",
    consequenceType: "networkWide",
    description: "Some consequence description",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.tram,
    removeFromJourneyPlanners: "no",
};
