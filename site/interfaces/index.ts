import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { NextApiRequest } from "next";
import { ServerResponse } from "http";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    typeOfDisruption?: "planned" | "unplanned";
    summary: string;
    description: string;
    associatedLink: string;
    reasonForDisruption?: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason;
    disruptionStartDate: Date;
    disruptionEndDate?: Date;
    disruptionStartTime: string;
    disruptionEndTime?: string;
    publishStartDate: Date;
    publishEndDate?: Date;
    publishStartTime: string;
    publishEndTime?: string;
}

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

export interface CookiesApiRequest extends NextApiRequest {
    body: {
        tracking: "on" | "off";
    };
}

export interface Feedback {
    question: string;
    answer: string;
}

export interface FeedbackApiRequest extends NextApiRequest {
    body: {
        hearAboutServiceQuestion: string;
        generalFeedbackQuestion: string;
        contactQuestion: string;
        problemQuestion: string;
    };
}

/* eslint-disable camelcase */
export interface CognitoIdToken {
    sub: string;
    aud: string;
    email_verified: boolean;
    event_id: string;
    "custom:noc": string;
    token_use: string;
    auth_time: number;
    iss: string;
    "cognito:username": string;
    exp: number;
    iat: number;
    email: string;
    "custom:contactable": string;
    "custom:schemeOperator": string;
    "custom:schemeRegionCode": string;
}
