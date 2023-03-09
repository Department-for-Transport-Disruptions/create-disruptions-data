import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
    Severity,
} from "@create-disruptions-data/shared-ts/siriTypes";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

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

export const DISRUPTION_SEVERITIES: {
    value: Severity;
    severity: string;
}[] = [
    { value: Severity.unknown, severity: "Unknown" },
    { value: Severity.verySlight, severity: "Very Slight" },
    {
        value: Severity.slight,
        severity: "Slight",
    },
    {
        value: Severity.normal,
        severity: "Normal",
    },
    {
        value: Severity.severe,
        severity: "Severe",
    },
    { value: Severity.verySevere, severity: "Very Severe" },
];

export const OPERATORS = [
    {
        value: "firstGreaterManchester",
        operator: "First Greater Manchester",
    },
    {
        value: "stagecoachManchester",
        operator: "Stagecoach Manchester",
    },
    {
        value: "firstSouthYorkshire",
        operator: "First South Yorkshire",
    },
    { value: "stagecoachYorkshire", operator: "Stagecoach Yorkshire" },
];

export const COOKIES_POLICY_COOKIE = "cdd-cookies-policy";

export const COOKIE_PREFERENCES_COOKIE = "cdd-cookie-preferences-set";

export const oneYearInSeconds = 31556952;

export const ID_TOKEN_COOKIE = "cdd-id-token";
