import { NextApiRequest } from "next";
import { ServerResponse } from "http";
import { ConsequenceType, TransportMode } from "../constants/enum";

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
    inputId: Extract<keyof T, string>;
    display: string;
    displaySize?: "s" | "m" | "l" | "xl";
    inputName: string;
    errorMessage?: string;
    initialErrors?: ErrorInfo[];
    optional?: boolean;
    stateUpdater: (change: string, field: keyof T) => void;
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
