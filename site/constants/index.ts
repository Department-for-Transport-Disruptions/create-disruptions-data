import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
    VehicleMode,
    Severity,
} from "@create-disruptions-data/shared-ts/enums";
import { DisplayValuePair } from "../interfaces";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SERVICE_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";

export const SUPPORT_PHONE_NUMBER = "0800 123 1234";

export const DISRUPTION_REASONS: DisplayValuePair<
    MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason
>[] = [
    {
        value: MiscellaneousReason.roadworks,
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

export const DISRUPTION_SEVERITIES: DisplayValuePair<Severity>[] = [
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

export const OPERATORS: DisplayValuePair[] = [
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

export const VEHICLE_MODES: DisplayValuePair<VehicleMode>[] = [
    {
        value: VehicleMode.bus,
        display: "Bus",
    },
    {
        value: VehicleMode.tram,
        display: "Tram",
    },
    {
        value: VehicleMode.ferryService,
        display: "Ferry",
    },
    {
        value: VehicleMode.rail,
        display: "Train",
    },
];

export const CONSEQUENCE_TYPES: DisplayValuePair<ConsequenceType["consequenceType"]>[] = [
    {
        value: "services",
        display: "Services",
    },
    {
        value: "networkWide",
        display: "Network wide",
    },
    {
        value: "operatorWide",
        display: "Operator wide",
    },
    {
        value: "stops",
        display: "Stops",
    },
];

export const CD_DATE_FORMAT = "DD/MM/YYYY";
export const CONTACT_FEEDBACK_QUESTION = "Did you contact us for assistance at any point?";
export const SOLVE_FEEDBACK_QUESTION = "Did we solve your problem?";
export const HEAR_ABOUT_US_FEEDBACK_QUESTION = "How did you hear about our service?";
export const GENERAL_FEEDBACK_QUESTION = "Please let us know any feedback or suggestions for improvements you may have";

export const oneYearInSeconds = 31556952;

export const STAGE = process.env.STAGE || "dev";

// PAGES
export const ERROR_PATH = "/500";
export const CREATE_DISRUPTION_PAGE_PATH = "/create-disruption";
export const ADD_CONSEQUENCE_PAGE_PATH = "/type-of-consequence";
export const CREATE_CONSEQUENCE_OPERATOR_PATH = "/create-consequence-operator";
export const CREATE_CONSEQUENCE_NETWORK_PATH = "/create-consequence-network";
export const REVIEW_DISRUPTION_PAGE_PATH = "/review-disruption";

// COOKIES
export const COOKIES_DISRUPTION_INFO = "cdd-disruption-info";
export const COOKIES_DISRUPTION_ERRORS = "cdd-disruption-errors";
export const COOKIES_CONSEQUENCE_TYPE_INFO = "cdd-consequence-type-info";
export const COOKIES_CONSEQUENCE_TYPE_ERRORS = "cdd-consequence-type-errors";
export const COOKIES_CONSEQUENCE_INFO = "cdd-consequence-info";
export const COOKIES_CONSEQUENCE_OPERATOR_ERRORS = "cdd-consequence-operator-errors";
export const COOKIES_CONSEQUENCE_NETWORK_ERRORS = "cdd-consequence-network-errors";
export const COOKIES_POLICY_COOKIE = "cdd-cookies-policy";
export const COOKIE_PREFERENCES_COOKIE = "cdd-cookie-preferences-set";
export const COOKIE_ID_TOKEN = "cdd-id-token";
export const COOKIE_CSRF = "_csrf";
