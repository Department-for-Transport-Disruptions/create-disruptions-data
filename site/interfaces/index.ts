/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Session as SessionData } from "express-session";
import { NextApiRequest, NextPageContext } from "next";
// eslint-disable-next-line @next/next/no-document-import-in-page
import { DocumentContext } from "next/document";
import React from "react";
import { Mock, vi } from "vitest";
import { ServerResponse } from "http";
import { GetMockContextInput, getMockRequestAndResponse } from "../pages/testData/mockData";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

// export interface DisruptionInfo {
//     typeOfDisruption?: "planned" | "unplanned";
//     summary: string;
//     description: string;
//     associatedLink?: string;
//     disruptionReason?: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason | "";
//     disruptionStartDate: Date;
//     disruptionEndDate: Date;
//     disruptionStartTime: string;
//     disruptionEndTime: string;
//     publishStartDate: Date;
//     publishEndDate: Date;
//     publishStartTime: string;
//     publishEndTime: string;
//     disruptionRepeats?: string;
//     disruptionIsNoEndDateTime?: string;
//     publishIsNoEndDateTime?: string;
// }

export interface Session {
    session: SessionData;
}

export type NextApiRequestWithSession = NextApiRequest & Session;

export type NextPageContextWithSession = NextPageContext & {
    req: Session;
};

export type DocumentContextWithSession = DocumentContext & {
    req: Session;
};

export interface ResponseWithLocals extends ServerResponse {
    locals: {
        nonce: string;
        csrfToken: string;
    };
}

export interface CookiePolicy {
    essential: boolean;
    usage: boolean;
}

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

export const getMockContext = ({
    cookies = {},
    body = null,
    uuid = {},
    mockWriteHeadFn = vi.fn(),
    mockEndFn = vi.fn(),
    isLoggedin = true,
    url = null,
    query = "",
}: GetMockContextInput = {}): NextPageContextWithSession => {
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

    const ctx: NextPageContextWithSession = {
        res,
        req,
        pathname: "",
        query,
        // eslint-disable-next-line react/display-name
        AppTree: () => React.createElement("div"),
    };

    return ctx;
};
