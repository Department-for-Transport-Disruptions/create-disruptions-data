import { NextApiRequest, NextApiResponse } from "next";
import { redirectTo } from "../../utils/index";
import { ErrorInfo } from "../../interfaces";
import { setCookie, deleteCookie, getCookies, getCookie } from "cookies-next";
import { CookieValueTypes, OptionsType } from "cookies-next/lib/types";

type CDD = {
    summary: string;
};
export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const errors: ErrorInfo[] = [];
    errors.push({
        id: "Test01",
        errorMessage: "Check if summary value is retained",
    });

    console.log(req.headers.host);

    const value = {
        summary: "test",
    };

    const options: OptionsType = {
        req: req,
        res: res,
        path: "/create-disruption",
    };

    setCookie("disruption", value, options);

    const cookieValues: CookieValueTypes = getCookie("disruption", options);

    const cdd: CDD = cookieValues?.toString() as string as CDD;

    console.log("cookie in page---", cdd);
    redirectTo(res, `/create-disruption`);
};
