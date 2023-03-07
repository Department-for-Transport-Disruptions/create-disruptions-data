import { NextApiRequest, NextApiResponse } from "next";
import { redirectTo } from "../../utils/index";
import { DisruptionInfo, ErrorInfo } from "../../interfaces";
import { setCookie } from "cookies-next";
import { OptionsType } from "cookies-next/lib/types";
import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import {
    checkReferrer,
    validateDisruptionType,
    validateSummary,
    validateDescription,
    validateAssociatedLink,
    validateDisruptionReasons,
    validateDateTimeSection,
} from "../../utils/createDisruptionValidations";

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const errors: ErrorInfo[] = [];

    const options: OptionsType = {
        req: req,
        res: res,
        path: "/create-disruption",
    };

    checkReferrer(req.headers.referer, "/_error", res);

    const formFields: DisruptionInfo = req.body as DisruptionInfo;

    const disruptionType: "planned" | "unplanned" | undefined = formFields.typeOfDisruption;

    validateDisruptionType(disruptionType, errors, "some-error-id");

    const summary = formFields.summary;

    validateSummary(summary, errors, "some-error-id");

    const description = formFields.description;

    validateDescription(description, errors, "some-error-id");

    const associatedLink = formFields.associatedLink;

    if (associatedLink) {
        validateAssociatedLink(associatedLink, errors, "some-error-id");
    }

    const disruptionReason: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason | "" =
        formFields.disruptionReason || "";

    validateDisruptionReasons(disruptionReason, errors, "some-error-id");
    //const disruptionReasons = req.body[CD_];

    const disruptionStartDate: string = formFields.disruptionStartDate;
    const disruptionStartTime: string = formFields.disruptionStartTime;

    const disruptionEndDate: string = formFields.disruptionEndDate;
    const disruptionEndTime: string = formFields.disruptionEndTime;
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
    const publishStartDate: string = formFields.publishStartDate;
    const publishStartTime: string = formFields.publishStartTime;
    const publishEndDate: string = formFields.publishEndDate;
    const publishEndTime: string = formFields.publishEndTime;
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

    const disruptionData: DisruptionInfo = {
        typeOfDisruption: disruptionType,
        summary: summary,
        description: description,
        associatedLink: associatedLink,
        disruptionReason: disruptionReason,
        disruptionStartDate: disruptionStartDate,
        disruptionEndDate: disruptionEndDate,
        disruptionStartTime: disruptionStartTime,
        disruptionEndTime: disruptionEndTime,
        disruptionIsNoEndDateTime: disruptionIsNoEndDateTime,
        publishStartDate: publishStartDate,
        publishEndDate: publishEndDate,
        publishStartTime: publishStartTime,
        publishEndTime: publishEndTime,
        publishIsNoEndDateTime: publishIsNoEndDateTime,
        disruptionRepeats: formFields.disruptionRepeats,
    };
    setCookie("disruptionInfo", disruptionData, options);

    if (errors.length == 0) {
        redirectTo(res, "/");
    } else {
        setCookie("disruptionErrors", errors, options);
        redirectTo(res, `/create-disruption`);
    }
};

export default handler;
