import { decodeJwt } from "jose";
import { NextApiRequest } from "next";
import { parseCookies } from "nookies";
import { z } from "zod";
import { IncomingMessage } from "http";
import { COOKIES_ID_TOKEN } from "../../constants";
import { getOrganisationInfoById } from "../../data/dynamo";

const sessionSchema = z
    .object({
        sub: z.string().uuid(),
        email: z.string().email(),
        "custom:orgId": z.string().uuid(),
        "cognito:groups": z.array(
            z.union([
                z.literal("system-admins"),
                z.literal("org-admins"),
                z.literal("org-publishers"),
                z.literal("org-staff"),
            ]),
        ),
    })
    .transform((item) => {
        const isSystemAdmin = item["cognito:groups"].includes("system-admins");
        const isOrgAdmin = isSystemAdmin || item["cognito:groups"].includes("org-admins");
        const isOrgPublisher = isSystemAdmin || isOrgAdmin || item["cognito:groups"].includes("org-publishers");
        const isOrgStaff =
            isSystemAdmin || isOrgAdmin || isOrgPublisher || item["cognito:groups"].includes("org-staff");

        return {
            username: item.sub,
            email: item.email,
            orgId: item["custom:orgId"],
            isSystemAdmin,
            isOrgAdmin,
            isOrgPublisher,
            isOrgStaff,
        };
    });

const sessionSchemaWithOrgDetail = sessionSchema.transform(async (item) => {
    const orgDetail = await getOrganisationInfoById(item.orgId);

    return {
        ...item,
        orgName: orgDetail?.name ?? "",
        adminAreaCodes: orgDetail?.adminAreaCodes ?? [],
    };
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionWithOrgDetail = z.infer<typeof sessionSchemaWithOrgDetail>;

export const getSession = (req: NextApiRequest | IncomingMessage): Session | null => {
    const cookies = parseCookies({ req });
    const idToken = cookies[COOKIES_ID_TOKEN];

    if (idToken) {
        return sessionSchema.parse(decodeJwt(idToken));
    }

    return null;
};

export const getSessionWithOrgDetail = async (
    req: NextApiRequest | IncomingMessage,
): Promise<SessionWithOrgDetail | null> => {
    const cookies = parseCookies({ req });
    const idToken = cookies[COOKIES_ID_TOKEN];

    if (idToken) {
        return sessionSchemaWithOrgDetail.parseAsync(decodeJwt(idToken));
    }

    return null;
};
