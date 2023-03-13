/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
