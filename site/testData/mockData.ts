/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    SourceType,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { mockRequest, mockResponse } from "mock-req-res";
import { NextPageContext } from "next";
import React from "react";
import { Mock, vi } from "vitest";
import { COOKIE_ID_TOKEN, COOKIES_POLICY_COOKIE } from "../constants";

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
}: GetMockRequestAndResponse = {}): { req: any; res: any } => {
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

    cookieString += isLoggedin ? `${COOKIE_ID_TOKEN}=${idToken as string};` : "";

    cookieString += cookiePolicy ? `${COOKIES_POLICY_COOKIE}=${encodeURI(JSON.stringify(cookiePolicy))}` : "";

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

    return { req, res };
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
    cookieValues?: any;
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
