import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_INFO,
    COOKIES_DISRUPTION_ERRORS,
    TEN_SECONDS_IN_MILLISECONDS,
    CREATE_DISRUPTION_PAGE_PATH,
    ERROR_PATH,
} from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
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
import { PageInputs } from "../create-disruption";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    checkReferrer(req.headers.referer, CREATE_DISRUPTION_PAGE_PATH, ERROR_PATH, res);

    const formFields: PageInputs = req.body as PageInputs;

    const disruptionType: "planned" | "unplanned" | undefined = formFields.typeOfDisruption;

    validateDisruptionType(disruptionType, errors, "some-error-id");

    const summary = formFields.summary;

    validateSummary(summary, errors, "some-error-id");

    const description = formFields.description;

    validateDescription(description, errors, "some-error-id");

    const associatedLink = formFields["associated-link"];

    if (associatedLink) {
        validateAssociatedLink(associatedLink, errors, "some-error-id");
    }

    const disruptionReason: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason | "" =
        formFields["disruption-reason"] || "";

    validateDisruptionReasons(disruptionReason, errors, "some-error-id");

    const disruptionStartDate: Date | null = formFields["disruption-start-date"];
    const disruptionStartTime: string = formFields["disruption-start-time"];
    const disruptionEndDate: Date | null = formFields["disruption-end-date"];
    const disruptionEndTime: string = formFields["disruption-end-time"];
    const disruptionIsNoEndDateTime: string | undefined = formFields.disruptionIsNoEndDateTime;

    validateDateTimeSection(
        disruptionStartDate,
        disruptionStartTime,
        disruptionEndDate,
        disruptionEndTime,
        disruptionIsNoEndDateTime,
        errors,
        "some-error-id",
    );
    const publishStartDate: Date | null = formFields["publish-start-date"];
    const publishStartTime: string = formFields["publish-start-time"];
    const publishEndDate: Date | null = formFields["publish-end-date"];
    const publishEndTime: string = formFields["publish-end-time"];
    const publishIsNoEndDateTime: string | undefined = formFields.publishIsNoEndDateTime;

    validateDateTimeSection(
        publishStartDate,
        publishStartTime,
        publishEndDate,
        publishEndTime,
        publishIsNoEndDateTime,
        errors,
        "some-error-id",
    );

    const disruptionData: PageInputs = {
        typeOfDisruption: disruptionType,
        summary: summary,
        description: description,
        "associated-link": associatedLink,
        "disruption-reason": disruptionReason,
        "disruption-start-date": disruptionStartDate ? getDateTime(disruptionStartDate).toDate() : disruptionStartDate,
        "disruption-end-date": disruptionEndDate ? getDateTime(disruptionEndDate).toDate() : disruptionEndDate,
        "disruption-start-time": disruptionStartTime,
        "disruption-end-time": disruptionEndTime,
        disruptionIsNoEndDateTime: disruptionIsNoEndDateTime,
        "publish-start-date": publishStartDate ? getDateTime(publishStartDate).toDate() : publishStartDate,
        "publish-end-date": publishEndDate ? getDateTime(publishEndDate).toDate() : publishEndDate,
        "publish-start-time": publishStartTime,
        "publish-end-time": publishEndTime,
        publishIsNoEndDateTime: publishIsNoEndDateTime,
        disruptionRepeats: formFields.disruptionRepeats,
    };

    setCookieOnResponseObject(
        COOKIES_DISRUPTION_INFO,
        JSON.stringify(disruptionData),
        res,
        TEN_SECONDS_IN_MILLISECONDS,
        false,
    );

    if (errors.length == 0) {
        redirectTo(res, "/");
    } else {
        setCookieOnResponseObject(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
    }
};

export default createDisruption;
