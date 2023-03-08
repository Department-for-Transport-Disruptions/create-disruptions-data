import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

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

export const ERROR_MESSAGES = [
    {
        message: "Enter a summary for this disruption",
        input: "summary",
    },
    {
        message: "Enter a description for this disruption (200 characters maximum)",
        input: "description",
    },
    {
        message: "Select a reason from the dropdown",
        input: "disruption-reason",
    },
];

export const COOKIES_POLICY_COOKIE = "cdd-cookies-policy";

export const COOKIE_PREFERENCES_COOKIE = "cdd-cookie-preferences-set";

export const oneYearInSeconds = 31556952;

export const ID_TOKEN_COOKIE = "cdd-id-token";
