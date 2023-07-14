import { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import {
    COOKIES_ADD_ORG_ERRORS,
    SYSADMIN_ADD_ORG_PAGE_PATH,
    SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH,
} from "../../../constants";
import { upsertOrganisation } from "../../../data/dynamo";
import { organisationSchema } from "../../../schemas/organisation.schema";
import { flattenZodErrors } from "../../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export const formatBody = (body: object) => {
    const adminAreaCodes = Object.entries(body)
        .filter((item) => item.includes("adminAreaCodes"))
        .flat();
    const name = Object.entries(body)
        .filter((item) => item.includes("name"))
        .flat();
    const PK = Object.entries(body)
        .filter((item) => item.includes("PK"))
        .flat();
    const mode = Object.entries(body)
        .filter((item) => item.includes("mode"))
        .flat();

    return {
        PK: PK && PK.length > 1 ? (PK[1] as string) : undefined,
        name: name && name.length > 1 ? (name[1] as string) : undefined,
        mode: mode && mode.length > 1 ? (JSON.parse(mode[1] as string) as object) : undefined,
        adminAreaCodes:
            adminAreaCodes && adminAreaCodes.length > 1
                ? (adminAreaCodes[1] as string).split(",").filter((data) => data)
                : undefined,
    };
};

const manageOrg = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        const formattedBody = formatBody(req.body as object);
        if (!session) {
            throw new Error("No session found");
        } else if (!session.isSystemAdmin) {
            throw new Error("Invalid user accessing the page");
        }

        const validatedBody = organisationSchema.safeParse(formattedBody);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_ADD_ORG_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, SYSADMIN_ADD_ORG_PAGE_PATH);
            return;
        }

        const randomId = randomUUID();
        const PK = validatedBody.data.PK ? validatedBody.data.PK : randomId;

        await upsertOrganisation(PK, {
            ...validatedBody.data,
            PK: validatedBody.data.PK ? validatedBody.data.PK : PK,
        });

        destroyCookieOnResponseObject(COOKIES_ADD_ORG_ERRORS, res);
        redirectTo(res, SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH);
        return;
    } catch (error) {
        const message = "There was a problem updating an organisation.";
        redirectToError(res, message, "api.sysadmin-org", error as Error);
        return;
    }
};

export default manageOrg;
