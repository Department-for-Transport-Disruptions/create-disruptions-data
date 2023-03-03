import { NextApiRequest, NextApiResponse } from "next";
import { redirectTo } from "../../utils/index";
import { DisruptionInfo, ErrorInfo } from "../../interfaces";
import { setCookie, deleteCookie, getCookies, getCookie } from "cookies-next";
import { CookieValueTypes, OptionsType } from "cookies-next/lib/types";
import {
    CD_SUMMARY,
    CD_DESCRIPTION,
    CD_DISRUPTION_TYPE,
    CD_ASSOCIATED_LINK,
    CD_DISRUPTION_REASON,
    CD_DISRUPTION_REPEATS,
    CD_NO_VALIDITY_END_DATE_TIME,
    CD_NO_PUBLISH_END_DATE_TIME,
    CD_VALIDITY_START_DATE_DAY,
    CD_VALIDITY_START_DATE_MONTH,
    CD_VALIDITY_START_DATE_YEAR,
    CD_VALIDITY_START_HOUR,
    CD_VALIDITY_START_MINUTES,
    CD_VALIDITY_END_DATE_DAY,
    CD_VALIDITY_END_DATE_MONTH,
    CD_VALIDITY_END_DATE_YEAR,
    CD_VALIDITY_END_HOUR,
    CD_VALIDITY_END_MINUTES,
    CD_PUBLISH_START_DATE_DAY,
    CD_PUBLISH_START_DATE_MONTH,
    CD_PUBLISH_START_DATE_YEAR,
    CD_PUBLISH_START_HOUR,
    CD_PUBLISH_START_MINUTES,
    CD_PUBLISH_END_DATE_DAY,
    CD_PUBLISH_END_DATE_MONTH,
    CD_PUBLISH_END_DATE_YEAR,
    CD_PUBLISH_END_HOUR,
    CD_PUBLISH_END_MINUTES,
} from "../../constants/attributes";

import { DISRUPTION_TYPES } from "../../constants/index";

type CreateDisruptionAttrs = {
    summary: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const errors: ErrorInfo[] = [];
    // errors.push({
    //     id: "Test01",
    //     errorMessage: "Check if summary value is retained",
    // });

    // console.log(req.headers.host);

    // const value = {
    //     summary: "test",
    // };

    const options: OptionsType = {
        req: req,
        res: res,
        path: "/create-disruption",
    };

    // setCookie("disruption", value, options);

    // console.log("referrer", req.headers.referer);

    // const cookieValues: CookieValueTypes = getCookie("disruption", options);

    // const cdd: CDD = JSON.parse(cookieValues?.toString() as string);
    console.log(req.body);

    checkReferrer(req.headers.referer, "/_error", res);

    const formFields: DisruptionInfo = req.body as DisruptionInfo;
    const disruptionType: string = req.body[CD_DISRUPTION_TYPE];

    await validateDisruptioType(disruptionType, errors, "some-error-id");

    const summary = req.body[CD_SUMMARY];

    validateSummary(summary, errors, "some-error-id");

    const description = req.body[CD_DESCRIPTION];

    validateDescription(description, errors, "some-error-id");

    const associatedLink = req.body[CD_ASSOCIATED_LINK];

    validateAssociatedLink(associatedLink, errors, "some-error-id");

    //const disruptionReasons = req.body[CD_];

    redirectTo(res, `/create-disruption`);
};

const checkReferrer = (referrerHeader: string | undefined, requestFromPath: string, res: NextApiResponse) => {
    if (referrerHeader?.includes(requestFromPath)) {
        redirectTo(res, "/_error");
    }
};

const validateSummary = async (summary: string, errors: ErrorInfo[], errorId: string): Promise<void> => {
    let error: ErrorInfo = {
        id: errorId,
        errorMessage: "Please enter a Summary",
    };
    requireFieldCheck(summary, errors, error);

    error = {
        id: errorId,
        errorMessage: "Please enter a Summary of less than 100 characters ",
    };
    validateLength(summary, 100, errors, error);
};

const validateDisruptioType = async (disruptionType: string, errors: ErrorInfo[], errorId: string): Promise<void> => {
    let error: ErrorInfo = {
        id: errorId,
        errorMessage: "Please choose a Type of Disruption",
    };

    requireFieldCheck(disruptionType, errors, error);

    error = {
        id: errorId,
        errorMessage: "Invalid Disruption Type Selected. Please choose a valid Type of Disruption",
    };
    isValidDisruptionType(disruptionType, DISRUPTION_TYPES, errors, error);
};

const requireFieldCheck = async (summary: string, errors: ErrorInfo[], error: ErrorInfo): Promise<void> => {
    if (!summary) {
        errors.push(error);
    }
};

const isValidDisruptionType = async (
    value: string,
    validArray: string[],
    errors: ErrorInfo[],
    error: ErrorInfo,
): Promise<void> => {
    if (!validArray.includes(value)) {
        errors.push(error);
    }
};

const validateLength = async (field: string, length: number, errors: ErrorInfo[], error: ErrorInfo): Promise<void> => {
    if (field?.length > length) {
        errors.push(error);
    }
};

const validateDescription = async (description: string, errors: ErrorInfo[], errorId: string): Promise<void> => {
    let error: ErrorInfo = {
        id: errorId,
        errorMessage: "Please enter a Description",
    };
    requireFieldCheck(description, errors, error);

    error = {
        id: errorId,
        errorMessage: "Please enter a Description of less than 200 characters ",
    };
    validateLength(description, 200, errors, error);
};

const validateAssociatedLink = async (associatedLink: string, errors: ErrorInfo[], errorId: string): Promise<void> => {
    try {
        const url = new URL(associatedLink);
    } catch (_) {
        errors.push({
            id: errorId,
            errorMessage: "The URL is malformed. Please enter a valid URL ",
        });
    }
};

export default handler;
