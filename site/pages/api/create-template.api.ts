import { DisruptionInfo as TemplateInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruptionInfoSchemaRefined as templateInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_TEMPLATE_ERRORS,
    CREATE_TEMPLATE_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH,
} from "../../constants/index";
import { upsertTemplateInfo } from "../../data/dynamo";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    formatCreateDisruptionBody as formatCreateTemplateBody,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const createTemplate = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { draft } = req.query;
        const body = req.body as TemplateInfo & { consequenceIndex: number | undefined };

        const consequenceIndex = body.consequenceIndex || 0;

        if (!body.disruptionId) {
            throw new Error("No disruptionId found");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const formattedBody = formatCreateTemplateBody(req.body as object);

        const validatedBody = templateInfoSchemaRefined.safeParse({
            ...formattedBody,
            orgId: session.orgId,
        });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_TEMPLATE_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_TEMPLATE_PAGE_PATH}/${body.disruptionId}`);

            return;
        }

        if (!validatedBody.data.disruptionNoEndDateTime) {
            validatedBody.data.disruptionNoEndDateTime = "";
        }

        const currentTemplate = await upsertTemplateInfo(validatedBody.data, session.orgId, session.isOrgStaff);

        destroyCookieOnResponseObject(COOKIES_TEMPLATE_ERRORS, res);

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }

        if (currentTemplate?.consequences) {
            redirectTo(res, `${TEMPLATE_OVERVIEW_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        } else {
            redirectTo(
                res,
                `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${validatedBody.data.disruptionId}/${consequenceIndex}`,
            );
            return;
        }

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a template.";
            redirectToError(res, message, "api.create-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createTemplate;
