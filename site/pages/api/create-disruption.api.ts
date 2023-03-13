import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_INFO,
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    ERROR_PATH,
} from "../../constants/index";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import { validateBodyAndRedirect } from "../../utils/apiUtils";
import { checkReferrer } from "../../utils/apiUtils/createDisruptionValidations";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    checkReferrer(req.headers.referer, CREATE_DISRUPTION_PAGE_PATH, ERROR_PATH, res);

    validateBodyAndRedirect(
        res,
        req.body,
        createDisruptionsSchemaRefined,
        COOKIES_DISRUPTION_INFO,
        COOKIES_DISRUPTION_ERRORS,
        CREATE_DISRUPTION_PAGE_PATH,
        "/",
    );
};

export default createDisruption;
