import { decodeJwt } from "jose";
import { NextApiRequest } from "next";
import { parseCookies } from "nookies";
import { IncomingMessage } from "http";
import { COOKIES_ID_TOKEN } from "../../constants";
import { Session, SessionWithOrgDetail, sessionSchema, sessionSchemaWithOrgDetail } from "../../schemas/session.schema";

export const getSession = (req: NextApiRequest | IncomingMessage): Session | null => {
    const cookies = parseCookies({ req });
    const idToken = cookies?.[COOKIES_ID_TOKEN];

    if (idToken) {
        return sessionSchema.parse(decodeJwt(idToken));
    }

    return null;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getSessionWithOrgDetail = async (
    req: NextApiRequest | IncomingMessage,
): Promise<SessionWithOrgDetail | null> => {
    const cookies = parseCookies({ req });
    const idToken = cookies?.[COOKIES_ID_TOKEN];

    if (idToken) {
        return sessionSchemaWithOrgDetail.parseAsync(decodeJwt(idToken));
    }

    return null;
};

export const canPublish = (session: Session | SessionWithOrgDetail) =>
    session.isSystemAdmin || session.isOrgAdmin || session.isOrgPublisher;
