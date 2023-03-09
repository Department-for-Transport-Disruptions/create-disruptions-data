import { NextApiResponse } from "next";
import { COOKIES_ADD_CONSEQUENCE_INFO, COOKIES_ADD_CONSEQUENCE_ERRORS } from "../../constants/index";
import { ErrorInfo, NextApiRequestWithConsequences } from "../../interfaces";
import { redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils";
import { AddConsequenceProps, ConsequenceType, TransportMode } from "../add-consequence";

const addConsequence = (req: NextApiRequestWithConsequences, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    const formFields: AddConsequenceProps = req.body;

    const tenSeconds = 10000;

    if (!formFields.consequenceType) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Select a consequence type",
        });
    } else if (!Object.values(ConsequenceType).includes(formFields.consequenceType)) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    if (!formFields.modeOfTransport) {
        errors.push({
            id: "transport-mode-bus",
            errorMessage: "Select a mode of transport",
        });
    } else if (!Object.values(TransportMode).includes(formFields.modeOfTransport)) {
        errors.push({
            id: "transport-mode-bus",
            errorMessage: "Incorrect mode of transport selected. Choose a valid value",
        });
    }

    if (errors.length === 0) {
        setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_INFO, JSON.stringify(formFields), res, tenSeconds, false);
        redirectTo(res, "/");
        return;
    } else {
        setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_ERRORS, JSON.stringify(errors), res, tenSeconds, false);
        redirectTo(res, "/add-consequence");
        return;
    }
};

export default addConsequence;
