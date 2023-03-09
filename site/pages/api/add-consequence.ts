import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_ADD_CONSEQUENCE_INFO, COOKIES_ADD_CONSEQUENCE_ERRORS } from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { isValueInArray, redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils";
import { AddConsequenceProps, ConsequenceType, TransportMode } from "../add-consequence";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    const formFields: AddConsequenceProps = req.body as AddConsequenceProps;

    const tenSeconds = 10000;

    if (!formFields.consequenceType) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Select a consequence type",
        });
    }

    if (!formFields.modeOfTransport) {
        errors.push({
            id: "transport-mode-bus",
            errorMessage: "Select a mode of transport",
        });
    }

    formFields.modeOfTransport = "test";
    if (!isValueInArray(formFields.consequenceType, Object.values(ConsequenceType))) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    if (!isValueInArray(formFields.modeOfTransport, Object.values(TransportMode))) {
        errors.push({
            id: "transport-mode-bus",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    console.log(errors);
    setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_INFO, JSON.stringify(formFields), res, tenSeconds, false);

    if (errors.length == 0) {
        redirectTo(res, "/");
        return;
    } else {
        setCookieOnResponseObject(COOKIES_ADD_CONSEQUENCE_ERRORS, JSON.stringify(errors), res, tenSeconds, false);
        redirectTo(res, "/add-consequence");
        return;
    }
};

export default addConsequence;
