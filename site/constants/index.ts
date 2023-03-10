import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
    Severity,
} from "@create-disruptions-data/shared-ts/siriTypes";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SERVICE_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SUPPORT_PHONE_NUMBER = "0800 123 1234";

export const DISRUPTION_REASONS: {
    value: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason;
    display: string;
}[] = [
    {
        value: MiscellaneousReason.roadWorks,
        display: "Road Works",
    },
    {
        value: MiscellaneousReason.vandalism,
        display: "Vandalism",
    },
    {
        value: MiscellaneousReason.routeDiversion,
        display: "Route Diversion",
    },
    {
        value: MiscellaneousReason.specialEvent,
        display: "Special Event",
    },
];

export const DISRUPTION_SEVERITIES: {
    value: Severity;
    display: string;
}[] = [
    { value: Severity.unknown, display: "Unknown" },
    { value: Severity.verySlight, display: "Very slight" },
    {
        value: Severity.slight,
        display: "Slight",
    },
    {
        value: Severity.normal,
        display: "Normal",
    },
    {
        value: Severity.severe,
        display: "Severe",
    },
    { value: Severity.verySevere, display: "Very severe" },
];

export const OPERATORS = [
    {
        value: "FMAN",
        display: "First Greater Manchester",
    },
    {
        value: "SCMN",
        display: "Stagecoach Manchester",
    },
    {
        value: "FSYO",
        display: "First South Yorkshire",
    },
    { value: "SYRK", display: "Stagecoach Yorkshire" },
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

export const CREATE_DISRUPTION_PAGE_PATH = "/create-disruption";

export const ERROR_PATH = "/_error";
export const STAGE = process.env.STAGE || "dev";
