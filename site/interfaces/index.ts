import { NextApiRequest, NextPageContext } from 'next';
import { DocumentContext } from 'next/document';
import { ServerResponse } from 'http';
import { Session as SessionData } from 'express-session';

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    validityStartDate: string;
    validityEndDate: string;
    validityStartTime: string;
    validityEndTime: string;
    publishStartDate: string;
    publishEndDate: string;
    publishStartTime: string;
    publishEndTime: string;
}

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
