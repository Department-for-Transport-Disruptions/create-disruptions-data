import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE } from "../constants";
import { CookiePolicy } from "../interfaces";
import { getMockContext } from "../testData/mockData";
import Cookies, { CookiePreferencesProps, getServerSideProps } from "./cookies.page";

describe("pages", () => {
    describe("cookies", () => {
        afterEach(cleanup);

        it("should display a confirmation box when the user saves their preferences", () => {
            const { asFragment } = render(<Cookies settingsSaved trackingDefaultValue="off" csrfToken="" />);
            expect(asFragment()).toMatchSnapshot();
        });
    });

    describe("getServerSideProps", () => {
        afterEach(() => {
            vi.resetAllMocks();
            cleanup();
        });

        it("should return default props when a user first visits the page", () => {
            const ctx = getMockContext();
            const defaultProps: { props: CookiePreferencesProps } = {
                props: {
                    settingsSaved: false,
                    trackingDefaultValue: "off",
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(defaultProps);
        });

        it("should return the expected props when a user saves their preferences to allow tracking", () => {
            const mockCookiePolicy: CookiePolicy = { essential: true, usage: true };
            const ctx = getMockContext({
                cookies: {
                    [COOKIE_PREFERENCES_COOKIE]: "true",
                    [COOKIES_POLICY_COOKIE]: JSON.stringify(mockCookiePolicy),
                },
                query: { settingsSaved: "true" },
            });

            const expectedProps: { props: CookiePreferencesProps } = {
                props: {
                    settingsSaved: true,
                    trackingDefaultValue: "on",
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(expectedProps);
        });
    });
});
