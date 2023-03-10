import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_INFO,
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    ERROR_PATH,
} from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
import {
    checkReferrer,
    validateDisruptionType,
    validateSummary,
    validateDescription,
    validateAssociatedLink,
    validateDisruptionReasons,
    validateDateTimeSection,
    getDateTime,
} from "../../utils/apiUtils/createDisruptionValidations";
import { redirectTo } from "../../utils/index";
import { DisruptionPageInputs } from "../create-disruption";

export type DisruptionType = "planned" | "unplanned";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    destroyCookieOnResponseObject(COOKIES_DISRUPTION_INFO, res);
    destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);

    const errors: ErrorInfo[] = [];

    checkReferrer(req.headers.referer, CREATE_DISRUPTION_PAGE_PATH, ERROR_PATH, res);

    const formFields: DisruptionPageInputs = req.body as DisruptionPageInputs;

    const disruptionType: DisruptionType | "" = formFields["type-of-disruption"];

    validateDisruptionType(disruptionType, errors, "some-error-id");

    const summary = formFields.summary;

    validateSummary(summary, errors, "some-error-id");

    const description = formFields.description;

    validateDescription(description, errors, "some-error-id");

    const associatedLink = formFields["associated-link"];

    if (associatedLink) {
        validateAssociatedLink(associatedLink, errors, "some-error-id");
    }

    const disruptionReason: string = formFields["disruption-reason"] || "";

    validateDisruptionReasons(disruptionReason, errors, "some-error-id");

    const disruptionStartDate = formFields["disruption-start-date"];
    const disruptionStartTime = formFields["disruption-start-time"];
    const disruptionEndDate = formFields["disruption-end-date"];
    const disruptionEndTime = formFields["disruption-end-time"];
    const disruptionIsNoEndDateTime = formFields["disruption-no-end-date-time"];

    validateDateTimeSection(
        disruptionStartDate,
        disruptionStartTime,
        disruptionEndDate,
        disruptionEndTime,
        disruptionIsNoEndDateTime,
        errors,
        "some-error-id",
    );
    const publishStartDate = formFields["publish-start-date"];
    const publishStartTime = formFields["publish-start-time"];
    const publishEndDate = formFields["publish-end-date"];
    const publishEndTime = formFields["publish-end-time"];
    const publishIsNoEndDateTime = formFields["publish-no-end-date-time"];

    validateDateTimeSection(
        publishStartDate,
        publishStartTime,
        publishEndDate,
        publishEndTime,
        publishIsNoEndDateTime,
        errors,
        "some-error-id",
    );

    const disruptionData: DisruptionPageInputs = {
        "type-of-disruption": disruptionType,
        summary: summary,
        description: description,
        "associated-link": associatedLink,
        "disruption-reason": disruptionReason,
        "disruption-start-date": disruptionStartDate
            ? getDateTime(disruptionStartDate).toString()
            : disruptionStartDate,
        "disruption-end-date": disruptionEndDate ? getDateTime(disruptionEndDate).toString() : disruptionEndDate,
        "disruption-start-time": disruptionStartTime,
        "disruption-end-time": disruptionEndTime,
        "disruption-no-end-date-time": disruptionIsNoEndDateTime,
        "publish-start-date": publishStartDate ? getDateTime(publishStartDate).toString() : publishStartDate,
        "publish-end-date": publishEndDate ? getDateTime(publishEndDate).toString() : publishEndDate,
        "publish-start-time": publishStartTime,
        "publish-end-time": publishEndTime,
        "publish-no-end-date-time": publishIsNoEndDateTime,
        "disruption-repeats": formFields["disruption-repeats"],
    };

    setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, JSON.stringify(disruptionData), res);

    if (errors.length === 0) {
        redirectTo(res, "/");
        return;
    } else {
        setCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
        return;
    }
};

export default createDisruption;
