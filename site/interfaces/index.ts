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
