import { describe, it, expect, afterEach, vi } from "vitest";
import * as fs from "fs/promises";
import { HOOTSUITE_URL } from "../../constants";
import * as dynamo from "../../data/dynamo";
import * as ssm from "../../data/ssm";
import { DEFAULT_ORG_ID, socialMediaPostsInformation } from "../../testData/mockData";
import { delay, publishToHootsuite } from "./";

describe("publishToHootsuite", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("dayjs", async () => ({
        ...(await vi.importActual<object>("dayjs")),
    }));

    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
    }));

    vi.mock("../../data/ssm", () => ({
        getParametersByPath: vi.fn(),
        getParameter: vi.fn(),
        putParameter: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        upsertSocialMediaPost: vi.fn(),
    }));

    const readFileSpy = vi.spyOn(fs, "readFile");
    vi.mock("fs/promises", () => ({
        readFile: vi.fn(),
    }));

    const buffer = Buffer.from("test-image.png", "base64");

    const getParameterSpy = vi.spyOn(ssm, "getParameter");
    const getParametersByPathSpy = vi.spyOn(ssm, "getParametersByPath");
    const putParameterSpy = vi.spyOn(ssm, "putParameter");

    it("should return successfully after publishing pending social media post to hootsuite", async () => {
        getParametersByPathSpy.mockResolvedValue({
            Parameters: [
                {
                    ARN: `arn:aws:ssm:eu-west-2:12345:parameter/social/${DEFAULT_ORG_ID}/hootsuite/13958638-f65df29e-b77b-4067-8140-a3d763aa8f60`,
                    DataType: "text",
                    Name: `/social/${DEFAULT_ORG_ID}/hootsuite/13958638-f65df29e-b77b-4067-8140-a3d763aa8f60`,
                    Type: "SecureString",
                    Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                    Version: 4,
                },
                {
                    ARN: `arn:aws:ssm:eu-west-2:12345:parameter/social/${DEFAULT_ORG_ID}/hootsuite/137196026-f65df29e-b77b-4067-8140-a3d763aa8f60`,
                    DataType: "text",
                    Name: `/social/${DEFAULT_ORG_ID}/hootsuite/137196026-f65df29e-b77b-4067-8140-a3d763aa8f60`,
                    Type: "SecureString",
                    Value: "lzJhbGciOiUIUzI1MiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gSG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQrrw6d",
                    Version: 4,
                },
            ],
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

        putParameterSpy.mockResolvedValueOnce();
        putParameterSpy.mockResolvedValueOnce();
        readFileSpy.mockResolvedValue(buffer);

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
                    return Promise.resolve({ refresh_token: "1234567563", access_token: "abcde35462556" });
                },
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({
                        data: {
                            id: "1",
                            uploadUrl: "https://upload.url.com",
                            uploadUrlDurationSeconds: 3,
                        },
                    });
                },
            })
            .mockResolvedValueOnce({
                ok: true,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => {
                    return Promise.resolve({
                        data: {
                            id: "1",
                            state: "READY",
                            downloadUrl: "https://download.url.com",
                            downloadUrlDurationSeconds: 3,
                        },
                    });
                },
            })
            .mockResolvedValueOnce({
                ok: true,
            });

        await publishToHootsuite(socialMediaPostsInformation, DEFAULT_ORG_ID);
        await delay(500);
        expect(ssm.getParametersByPath).toBeCalledWith(`/social/${DEFAULT_ORG_ID}/hootsuite`);
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_id");
        expect(ssm.getParameter).toBeCalledWith("/social/hootsuite/client_secret");
        expect(ssm.putParameter).toHaveBeenNthCalledWith(
            1,
            `/social/${DEFAULT_ORG_ID}/hootsuite/13958638-f65df29e-b77b-4067-8140-a3d763aa8f60`,
            "1234567562",
            "SecureString",
            true,
        );
        expect(ssm.putParameter).toHaveBeenNthCalledWith(
            2,
            `/social/${DEFAULT_ORG_ID}/hootsuite/137196026-f65df29e-b77b-4067-8140-a3d763aa8f60`,
            "1234567563",
            "SecureString",
            true,
        );

        const authToken = `Basic ${Buffer.from(`1234567:abcdefghi`).toString("base64")}`;
        expect(fetch).toHaveBeenNthCalledWith(1, `${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        expect(fetch).toHaveBeenNthCalledWith(2, `${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token:
                    "lzJhbGciOiUIUzI1MiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gSG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQrrw6d",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        expect(fetch).toHaveBeenNthCalledWith(3, `${HOOTSUITE_URL}v1/media`, {
            method: "POST",
            body: JSON.stringify({
                sizeBytes: 70872,
                mimeType: "image/png",
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer abcde35462556`,
            },
        });

        expect(readFileSpy).toHaveBeenCalledWith("/somefile/path");
        expect(fetch).toHaveBeenNthCalledWith(4, "https://upload.url.com", {
            method: "PUT",
            headers: {
                "Content-Type": "image/png",
            },
            body: buffer,
        });

        expect(fetch).toHaveBeenNthCalledWith(5, `${HOOTSUITE_URL}v1/media/1`, {
            method: "GET",
            headers: {
                Authorization: `Bearer abcde35462556`,
            },
        });

        expect(fetch).toHaveBeenNthCalledWith(6, `${HOOTSUITE_URL}v1/messages`, {
            method: "POST",
            body: JSON.stringify({
                text: socialMediaPostsInformation[1].messageContent,
                scheduledSendTime: "2023-06-20T19:05:00.000Z",
                socialProfileIds: [socialMediaPostsInformation[1].hootsuiteProfile],
                media: [{ id: "1" }],
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer abcde35462556",
            },
        });
        expect(dynamo.upsertSocialMediaPost).toBeCalledTimes(1);
    });
});
