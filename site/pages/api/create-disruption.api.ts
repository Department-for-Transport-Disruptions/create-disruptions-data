import { DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { upsertDisruptionInfo } from "../../data/dynamo";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    formatCreateDisruptionBody,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const createDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { draft, isFromTemplate } = req.query;
        const body = req.body as DisruptionInfo & { consequenceIndex: number | undefined };

        const consequenceIndex = body.consequenceIndex || 0;

        if (!body.disruptionId) {
            throw new Error("No disruptionId found");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const formattedBody = formatCreateDisruptionBody(req.body as object);

        const validatedBody = disruptionInfoSchemaRefined.safeParse({
            ...formattedBody,
            orgId: session.orgId,
        });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(req, res, [], `${CREATE_DISRUPTION_PAGE_PATH}/${body.disruptionId}`);

            return;
        }

        if (!validatedBody.data.disruptionNoEndDateTime) {
            validatedBody.data.disruptionNoEndDateTime = "";
        }

        const currentDisruption = await upsertDisruptionInfo(validatedBody.data, session.orgId, session.isOrgStaff);

        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);

        const redirectPath =
            !isFromTemplate && currentDisruption?.publishStatus !== PublishStatus.draft
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }

        if (redirectPath && currentDisruption?.consequences && !isFromTemplate) {
            redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);
            return;
        } else {
            redirectToWithQueryParams(
                req,
                res,
                [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${consequenceIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
            );
            return;
        }

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.create-disruption", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createDisruption;
