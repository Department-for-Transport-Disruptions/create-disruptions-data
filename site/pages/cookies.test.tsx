import renderer from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE } from "../constants";
import { CookiePolicy } from "../interfaces";
import { getMockContext } from "../testData/mockData";
import Cookies, { CookiePreferencesProps, getServerSideProps } from "./cookies.page";

describe("pages", () => {
    describe("cookies", () => {
        it("should display a confirmation box when the user saves their preferences", () => {
            const tree = renderer.create(<Cookies settingsSaved trackingDefaultValue="off" csrfToken="" />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });

    describe("getServerSideProps", () => {
        afterEach(() => {
            vi.resetAllMocks();
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
