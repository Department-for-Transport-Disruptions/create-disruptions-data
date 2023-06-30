import * as jose from "jose";
import { describe, it, expect, afterEach, vi } from "vitest";
import hootsuiteCallback from "./hootsuite-callback.api";
import {
    COOKIES_ID_TOKEN,
    COOKIES_REFRESH_TOKEN,
    DOMAIN_NAME,
    ERROR_PATH,
    HOOTSUITE_URL,
    SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
} from "../../constants";
import * as ssm from "../../data/ssm";
import * as middleware from "../../middleware.api";
import { DEFAULT_ORG_ID, getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

describe("hootsuite-callback", () => {
    const writeHeadMock = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
        publishToHootsuite: vi.fn(),
    }));

    vi.mock("../../data/ssm", () => ({
        getParameter: vi.fn(),
        deleteParameter: vi.fn(),
        putParameter: vi.fn(),
        getParametersByPath: vi.fn(),
    }));

    vi.mock("jose", () => ({
        decodeJwt: vi.fn(),
    }));

    vi.mock("../../middleware.api", () => ({
        initiateRefreshAuth: vi.fn(),
    }));

    const deleteParameterSpy = vi.spyOn(ssm, "deleteParameter");
    const getParameterSpy = vi.spyOn(ssm, "getParameter");
    const putParameterSpy = vi.spyOn(ssm, "putParameter");
    const decodeJwtSpy = vi.spyOn(jose, "decodeJwt");
    const initiateRefreshAuthSpy = vi.spyOn(middleware, "initiateRefreshAuth");
    const getParametersByPathSpy = vi.spyOn(ssm, "getParametersByPath");

    it("should redirect to the social media accounts page upon successful hootsuite connection", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                Type: "SecureString",
                Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                Type: "SecureString",
                Value: "223456789.22345789.12385680",
                Version: 4,
            },
        });
        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_id",
                DataType: "text",
                Name: "/social/hootsuite/client_id",
                Type: "SecureString",
                Value: "1234567",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_secret",
                DataType: "text",
                Name: "/social/hootsuite/client_secret",
                Type: "SecureString",
                Value: "abcdefghi",
                Version: 4,
            },
        });

        decodeJwtSpy.mockImplementation(() => ({
            sub: "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "cognito:groups": ["org-admins"],
            iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_ABCDE",
            "cognito:username": "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            given_name: "Test",
            origin_jti: "df094dba-fca1-420f-ba34-27711e4987e2",
            aud: "7r6b9uonfa28s6fnvrduvkan4p",
            event_id: "3c47a597-f060-4ebc-ad11-b3e8f30406b9",
            token_use: "id",
            auth_time: 1687271121,
            "custom:orgId": "0404b47d-0238-4f98-b417-4d671ef05022",
            exp: 1687272321,
            iat: 1687271121,
            family_name: "User",
            jti: "009ce348-a063-460a-a06b-af5790e6c2b8",
            email: "test@gmail.com",
        }));

        initiateRefreshAuthSpy.mockResolvedValueOnce({
            $metadata: { httpStatusCode: 200 },
            AuthenticationResult: { IdToken: "123456789" },
        });

        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({ refresh_token: "1234567562", access_token: "abcde35462555" });
                },
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({ data: { id: "123", email: "test@gmail.com", fullName: "Test User" } });
                },
            });

        getParametersByPathSpy.mockResolvedValueOnce({
            Parameters: [
                {
                    ARN: `arn:aws:ssm:eu-west-2:12345:parameter/social/${DEFAULT_ORG_ID}/hootsuite/Test_User-123`,
                    DataType: "text",
                    Name: `/social/${DEFAULT_ORG_ID}/hootsuite/Test_User-123`,
                    Type: "SecureString",
                    Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                    Version: 4,
                },
            ],
        });

        deleteParameterSpy.mockResolvedValueOnce({});

        putParameterSpy.mockResolvedValueOnce();

        await hootsuiteCallback(req, res);

        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token");
        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_id");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_secret");

        expect(decodeJwtSpy).toBeCalledWith(
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        );

        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_REFRESH_TOKEN,
            "223456789.22345789.12385680",
            res,
        );
        expect(middleware.initiateRefreshAuth).toHaveBeenCalledWith(
            "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "223456789.22345789.12385680",
        );
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(2, COOKIES_ID_TOKEN, "123456789", res);

        const authToken = `Basic ${Buffer.from(`1234567:abcdefghi`).toString("base64")}`;
        expect(fetch).toHaveBeenNthCalledWith(1, `${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: "123456",
                redirect_uri: `${DOMAIN_NAME}/api/hootsuite-callback`,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        expect(fetch).toHaveBeenNthCalledWith(2, `${HOOTSUITE_URL}v1/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer abcde35462555`,
            },
        });

        expect(ssm.putParameter).toBeCalledWith(
            "/social/0404b47d-0238-4f98-b417-4d671ef05022/hootsuite/123-Test_User",
            "1234567562",
            "SecureString",
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should redirect to the error page upon unsuccessful hootsuite connection", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                Type: "SecureString",
                Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                Type: "SecureString",
                Value: "223456789.22345789.12385680",
                Version: 4,
            },
        });
        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_id",
                DataType: "text",
                Name: "/social/hootsuite/client_id",
                Type: "SecureString",
                Value: "1234567",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_secret",
                DataType: "text",
                Name: "/social/hootsuite/client_secret",
                Type: "SecureString",
                Value: "abcdefghi",
                Version: 4,
            },
        });

        decodeJwtSpy.mockImplementation(() => ({
            sub: "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "cognito:groups": ["org-admins"],
            iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_ABCDE",
            "cognito:username": "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            given_name: "Test",
            origin_jti: "df094dba-fca1-420f-ba34-27711e4987e2",
            aud: "7r6b9uonfa28s6fnvrduvkan4p",
            event_id: "3c47a597-f060-4ebc-ad11-b3e8f30406b9",
            token_use: "id",
            auth_time: 1687271121,
            "custom:orgId": "0404b47d-0238-4f98-b417-4d671ef05022",
            exp: 1687272321,
            iat: 1687271121,
            family_name: "User",
            jti: "009ce348-a063-460a-a06b-af5790e6c2b8",
            email: "test@gmail.com",
        }));

        initiateRefreshAuthSpy.mockResolvedValueOnce({
            $metadata: { httpStatusCode: 200 },
            AuthenticationResult: { IdToken: "123456789" },
        });

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: () => {
                return Promise.resolve({});
            },
        });

        putParameterSpy.mockResolvedValueOnce();

        await hootsuiteCallback(req, res);

        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token");
        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_id");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_secret");

        expect(decodeJwtSpy).toBeCalledWith(
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        );

        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_REFRESH_TOKEN,
            "223456789.22345789.12385680",
            res,
        );
        expect(middleware.initiateRefreshAuth).toHaveBeenCalledWith(
            "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "223456789.22345789.12385680",
        );
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(2, COOKIES_ID_TOKEN, "123456789", res);

        const authToken = `Basic ${Buffer.from(`1234567:abcdefghi`).toString("base64")}`;
        expect(fetch).toHaveBeenNthCalledWith(1, `${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: "123456",
                redirect_uri: `${DOMAIN_NAME}/api/hootsuite-callback`,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to the social media accounts page upon successful hootsuite connection and overwrite the previous value in ssm", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token",
                Type: "SecureString",
                Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                DataType: "text",
                Name: "/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token",
                Type: "SecureString",
                Value: "223456789.22345789.12385680",
                Version: 4,
            },
        });
        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_id",
                DataType: "text",
                Name: "/social/hootsuite/client_id",
                Type: "SecureString",
                Value: "1234567",
                Version: 4,
            },
        });

        getParameterSpy.mockResolvedValueOnce({
            Parameter: {
                ARN: "arn:aws:ssm:eu-west-2:12345:parameter/social/hootsuite/client_secret",
                DataType: "text",
                Name: "/social/hootsuite/client_secret",
                Type: "SecureString",
                Value: "abcdefghi",
                Version: 4,
            },
        });

        decodeJwtSpy.mockImplementation(() => ({
            sub: "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "cognito:groups": ["org-admins"],
            iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_ABCDE",
            "cognito:username": "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            given_name: "Test",
            origin_jti: "df094dba-fca1-420f-ba34-27711e4987e2",
            aud: "7r6b9uonfa28s6fnvrduvkan4p",
            event_id: "3c47a597-f060-4ebc-ad11-b3e8f30406b9",
            token_use: "id",
            auth_time: 1687271121,
            "custom:orgId": "0404b47d-0238-4f98-b417-4d671ef05022",
            exp: 1687272321,
            iat: 1687271121,
            family_name: "User",
            jti: "009ce348-a063-460a-a06b-af5790e6c2b8",
            email: "test@gmail.com",
        }));

        initiateRefreshAuthSpy.mockResolvedValueOnce({
            $metadata: { httpStatusCode: 200 },
            AuthenticationResult: { IdToken: "123456789" },
        });

        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({ refresh_token: "1234567562", access_token: "abcde35462555" });
                },
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({ data: { id: "123", email: "test@gmail.com", fullName: "Test User" } });
                },
            });

        getParametersByPathSpy.mockResolvedValueOnce({
            Parameters: [],
        });

        deleteParameterSpy.mockResolvedValueOnce({});

        putParameterSpy.mockResolvedValueOnce();

        await hootsuiteCallback(req, res);

        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/token");
        expect(ssm.getParameter).toBeCalledWith("/6ab8fd00-4b2d-42a7-beef-8558da21c82d/refresh-token");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_id");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_secret");

        expect(decodeJwtSpy).toBeCalledWith(
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        );

        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_REFRESH_TOKEN,
            "223456789.22345789.12385680",
            res,
        );
        expect(middleware.initiateRefreshAuth).toHaveBeenCalledWith(
            "eb222847-2a98-4ca5-ba56-6fae6b6badcc",
            "223456789.22345789.12385680",
        );
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(2, COOKIES_ID_TOKEN, "123456789", res);

        const authToken = `Basic ${Buffer.from(`1234567:abcdefghi`).toString("base64")}`;
        expect(fetch).toHaveBeenNthCalledWith(1, `${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: "123456",
                redirect_uri: `${DOMAIN_NAME}/api/hootsuite-callback`,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        expect(fetch).toHaveBeenNthCalledWith(2, `${HOOTSUITE_URL}v1/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer abcde35462555`,
            },
        });

        expect(ssm.putParameter).toBeCalledWith(
            "/social/0404b47d-0238-4f98-b417-4d671ef05022/hootsuite/123-Test_User",
            "1234567562",
            "SecureString",
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});
