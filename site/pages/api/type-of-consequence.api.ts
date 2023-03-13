import { NextApiResponse } from "next";
import { ConsequenceType, TransportMode } from "../../constants/enum";
import {
    COOKIES_ADD_CONSEQUENCE_INFO,
    COOKIES_ADD_CONSEQUENCE_ERRORS,
    ADD_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { AddConsequenceProps, ErrorInfo, NextApiRequestWithConsequences } from "../../interfaces";
import { redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils";

const addConsequence = (req: NextApiRequestWithConsequences, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    const formFields: AddConsequenceProps = req.body;

    const tenSeconds = 10000;

    if (!formFields.consequenceType) {
        errors.push({
            id: "consequenceType",
            errorMessage: "Select a consequence type",
        });
    } else if (!Object.keys(ConsequenceType).includes(formFields.consequenceType)) {
        errors.push({
            id: "consequenceType",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    if (!formFields.modeOfTransport) {
        errors.push({
            id: "modeOfTransport",
            errorMessage: "Select a mode of transport",
        });
    } else if (!Object.keys(TransportMode).includes(formFields.modeOfTransport)) {
        errors.push({
            id: "modeOfTransport",
            errorMessage: "Incorrect mode of transport selected. Choose a valid value",
        });
    }

    setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_INFO, JSON.stringify(formFields), res, tenSeconds, false);
    if (errors.length === 0) {
        redirectTo(res, "/");
        return;
    } else {
        setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_ERRORS, JSON.stringify(errors), res, tenSeconds, false);
        redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
        return;
    }
};

export default addConsequence;
