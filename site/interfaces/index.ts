import { NextApiRequest } from "next";
import { z } from "zod";
import { ServerResponse } from "http";
import { Service, Stop } from "../schemas/consequence.schema";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

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
    stateUpdater: (change: string, field: keyof T) => void;
    schema?: z.ZodTypeAny;
}

export interface DisplayValuePair<T = string> {
    display: string;
    value: T;
    checked?: boolean;
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
}

export interface SocialMediaPost {
    messageToAppear: string;
    publishDate: string;
    publishTime: string;
    accountToPublish: string;
}

export interface CreateConsequenceProps<T> {
    initialPageState: PageState<Partial<T>>;
    previousConsequenceInformation: ConsequenceType;
    initialServices?: Service[];
    initialStops?: Stop[];
    allStops?: Stop[]
}
