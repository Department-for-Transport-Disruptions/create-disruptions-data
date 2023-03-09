import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SERVICE_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SUPPORT_PHONE_NUMBER = "0800 123 1234";

export const DISRUPTION_REASONS: {
    value: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason;
    reason: string;
}[] = [
    {
        value: MiscellaneousReason.roadWorks,
        reason: "Road Works",
    },
    {
        value: MiscellaneousReason.vandalism,
        reason: "Vandalism",
    },
    {
        value: MiscellaneousReason.routeDiversion,
        reason: "Route Diversion",
    },
    {
        value: MiscellaneousReason.specialEvent,
        reason: "Special Event",
    },
];

export const DISRUPTION_TYPES = ["planned", "unplanned"];

export const CD_DATE_FORMAT = "DD/MM/YYYY";
export const CONTACT_FEEDBACK_QUESTION = "Did you contact us for assistance at any point?";
export const SOLVE_FEEDBACK_QUESTION = "Did we solve your problem?";
export const HEAR_ABOUT_US_FEEDBACK_QUESTION = "How did you hear about our service?";
export const GENERAL_FEEDBACK_QUESTION = "Please let us know any feedback or suggestions for improvements you may have";

export const COOKIES_POLICY_COOKIE = "cdd-cookies-policy";

export const COOKIE_PREFERENCES_COOKIE = "cdd-cookie-preferences-set";

export const oneYearInSeconds = 31556952;

export const ID_TOKEN_COOKIE = "cdd-id-token";

export const COOKIES_DISRUPTION_INFO = "disruption-info";

export const COOKIES_DISRUPTION_ERRORS = "disruption-errors";

export const COOKIES_ADD_CONSEQUENCE_INFO = "cdd-consequence-info";

export const COOKIES_ADD_CONSEQUENCE_ERRORS = "cdd-consequence-errors";

export const CREATE_DISRUPTION_PAGE_PATH = "/create-disruption";

export const ERROR_PATH = "/_error";

export const ADD_CONEQUENCE_PAGE_PATH = "/add-consequence";

export const STAGE = process.env.STAGE || "dev";
