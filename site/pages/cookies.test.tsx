import renderer from "react-test-renderer";
import { vi, describe, it, expect, afterEach } from "vitest";
import Cookies, { CookiePreferencesProps, getServerSideProps } from "./cookies";
import { CookiePolicy } from "../interfaces";
import { getMockContext } from "../pages/testData/mockData";

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
                    csrfToken: "",
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(defaultProps);
        });

        it("should return the expected props when a user saves their preferences to allow tracking", () => {
            const mockCookiePolicy: CookiePolicy = { essential: true, usage: true };
            const ctx = getMockContext({
                cookies: { cookieSettingsSaved: "true", cookiePolicy: mockCookiePolicy },
                query: { settingsSaved: "true" },
            });
            const expectedProps: { props: CookiePreferencesProps } = {
                props: {
                    settingsSaved: true,
                    trackingDefaultValue: "on",
                    csrfToken: "",
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(expectedProps);
        });
    });
});
