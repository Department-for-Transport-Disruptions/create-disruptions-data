import { NextApiRequest } from "next";
import { z } from "zod";
import { ServerResponse } from "http";

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
    inputName: string;
    initialErrors?: ErrorInfo[];
    stateUpdater: (change: string, field: string) => void;
    schema?: z.ZodTypeAny;
}

export interface DisplayValuePair {
    display: string;
    value: string;
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
