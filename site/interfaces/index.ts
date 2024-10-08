import { ServerResponse } from "http";
import { NextApiRequest } from "next";
import { z } from "zod";
import { Session, SessionWithOrgDetail } from "../schemas/session.schema";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
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

export interface FormBase<T> {
    value?: string;
    display: string;
    displaySize?: "s" | "m" | "l" | "xl";
    inputName: Extract<keyof T, string>;
    initialErrors?: ErrorInfo[];
    stateUpdater: (change: string, field: keyof T, checked?: boolean) => void;
    schema?: z.ZodTypeAny;
    disabled?: boolean;
}

export interface DisplayValuePair<T = string> {
    display: string;
    value: T;
    checked?: boolean;
    default?: boolean;
}

export interface Feedback {
    question: string;
    answer: string;
}

export interface TestInputs {
    field1: string;
    field2: boolean;
    field3: string;
    field4: string;
}

export interface PageState<T> {
    errors: ErrorInfo[];
    inputs: T;
    csrfToken?: string;
    disruptionId?: string;
    consequenceIndex?: number;
    session?: Session | null;
    sessionWithOrg?: SessionWithOrgDetail | null;
}

export interface CreateConsequenceProps {
    disruptionDescription?: string;
    template?: string;
    consequenceCount?: number;
    isEdit?: boolean;
    showUnderground?: boolean;
    showCoach?: boolean;
    disruptionAreas?: {
        name: string;
        administrativeAreaCode: string;
        shortName: string;
    }[];
    stage?: string;
}

export interface DisruptionDetailCookie {
    referer: string;
    state?: string;
}
