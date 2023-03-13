import { NextApiRequest } from "next";
import { z } from "zod";
import { ServerResponse } from "http";
import { ConsequenceType, TransportMode } from "../constants/enum";

export interface ErrorInfo {
    errorMessage: string;
    id: string | number;
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

export interface NextApiRequestWithConsequences extends NextApiRequest {
    body: AddConsequenceProps;
}

export interface AddConsequenceWithErrors {
    errors: ErrorInfo[];
    inputs: AddConsequenceProps;
}

export interface AddConsequenceProps {
    modeOfTransport?: TransportMode;
    consequenceType?: ConsequenceType;
}
