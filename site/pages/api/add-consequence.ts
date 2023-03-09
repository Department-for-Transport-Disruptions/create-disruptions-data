import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_ADD_CONSEQUENCE_INFO,
    COOKIES_ADD_CONSEQUENCE_ERRORS,
    TEN_SECONDS_IN_MILLISECONDS,
} from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { isValueInArray, redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils";
import { AddConsequenceProps, ConsequenceType, TransportMode } from "../add-consequence";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    const formFields: AddConsequenceProps = req.body as AddConsequenceProps;

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

    if (!isValueInArray(formFields.consequenceType, Object.values(ConsequenceType))) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    if (!isValueInArray(formFields.modeOfTransport, Object.values(TransportMode))) {
        errors.push({
            id: "consequence-type-services",
            errorMessage: "Incorrect consequence type selected. Choose a valid value",
        });
    }

    setCookieOnResponseObject(
        COOKIES_ADD_CONSEQUENCE_INFO,
        JSON.stringify(formFields),
        res,
        TEN_SECONDS_IN_MILLISECONDS,
        false,
    );

    if (errors.length == 0) {
        redirectTo(res, "/");
        return;
    } else {
        setCookieOnResponseObject(
            COOKIES_ADD_CONSEQUENCE_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        redirectTo(res, "/add-consequence");
        return;
    }
};

export default addConsequence;
