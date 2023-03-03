import { NextApiRequest, NextApiResponse } from "next";
import { redirectTo } from "../../utils/index";
import { ErrorInfo } from "../../interfaces";
import { setCookie, deleteCookie, getCookies, getCookie } from "cookies-next";
import { CookieValueTypes, OptionsType } from "cookies-next/lib/types";
import {
    CD_SUMMARY,
    CD_DESCRIPTION,
    CD_DISRUPTION_TYPE,
    CD_ASSOCIATED_LINK,
    CD_DISRUPTION_REASON,
    CD_DISRUPTION_REAPEATS,
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
type CDD = {
    summary: string;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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

    checkReferrer(req.headers.referer, "/_error", res);

    const summary = req.body["summary"];

    console.log(req.body);

    redirectTo(res, `/create-disruption`);
};

const checkReferrer = (referrerHeader: string | undefined, frontendPath: string, res: NextApiResponse) => {
    if (referrerHeader?.includes(frontendPath)) {
        redirectTo(res, "/_error");
    }
};
