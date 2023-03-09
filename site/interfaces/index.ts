import { NextApiRequest } from "next";
import { ServerResponse } from "http";
import { AddConsequenceProps } from "../pages/add-consequence";

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

export interface NextApiRequestWithConsequences extends NextApiRequest {
    body: AddConsequenceProps;
}

export interface RadioOption {
    value: string;
    label: string;
}

export interface RadioButtonsProps {
    options: RadioOption[];
    inputName: string;
}

export interface InputInfo {
    id: string;
    name: string;
    display: string;
    value?: string;
}

export interface Feedback {
    question: string;
    answer: string;
}
