import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
    VehicleMode,
    Severity,
    Progress,
} from "@create-disruptions-data/shared-ts/enums";
import { DisplayValuePair } from "../interfaces";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

export const SUPPORT_EMAIL_ADDRESS = "bodshelpdesk@kpmg.co.uk";
export const FEEDBACK_EMAIL_ADDRESS = process.env.FEEDBACK_EMAIL_ADDRESS;
export const AWS_SES_IDENTITY_ARN = process.env.AWS_SES_IDENTITY_ARN;

export const SUPPORT_PHONE_NUMBER = "0800 028 0930";

export const DISRUPTION_REASONS: DisplayValuePair<
    MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason
>[] = [
    {
        value: MiscellaneousReason.accident,
        display: "Accident",
    },
    {
        value: EquipmentReason.breakDown,
        display: "Break Down",
    },
    {
        value: MiscellaneousReason.congestion,
        display: "Congestion",
    },
    {
        value: EquipmentReason.constructionWork,
        display: "Construction Work",
    },
    {
        value: EquipmentReason.emergencyEngineeringWork,
        display: "Emergency Engineering Work",
    },
    {
        value: EnvironmentReason.fog,
        display: "Fog",
    },
    {
        value: EnvironmentReason.flooding,
        display: "Flooding",
    },
    {
        value: EnvironmentReason.heavySnowFall,
        display: "Heavy Snow Fall",
    },
    {
        value: EnvironmentReason.highTemperatures,
        display: "High Temperatures",
    },
    {
        value: EnvironmentReason.heavyRain,
        display: "Heavy Rain",
    },
    {
        value: EnvironmentReason.ice,
        display: "Ice",
    },
    {
        value: MiscellaneousReason.incident,
        display: "Incident",
    },
    {
        value: MiscellaneousReason.securityAlert,
        display: "Security Alert",
    },
    {
        value: EquipmentReason.maintenanceWork,
        display: "Maintenance Work",
    },
    {
        value: MiscellaneousReason.operatorCeasedTrading,
        display: "Operator Ceased Trading",
    },
    {
        value: MiscellaneousReason.overcrowded,
        display: "Overcrowded",
    },
    {
        value: EquipmentReason.signalProblem,
        display: "Signal Problem",
    },
    {
        value: MiscellaneousReason.roadClosed,
        display: "Road Closed",
    },
    {
        value: MiscellaneousReason.roadworks,
        display: "Roadworks",
    },
    {
        value: MiscellaneousReason.routeDiversion,
        display: "Route Diversion",
    },
    {
        value: MiscellaneousReason.specialEvent,
        display: "Special Event",
    },
    {
        value: PersonnelReason.industrialAction,
        display: "Industrial Action",
    },
    {
        value: EquipmentReason.signalFailure,
        display: "Signal Failure",
    },
    {
        value: EquipmentReason.repairWork,
        display: "Repair Work",
    },
    {
        value: MiscellaneousReason.vandalism,
        display: "Vandalism",
    },
    {
        value: MiscellaneousReason.unknown,
        display: "Unknown",
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

export const DISRUPTION_STATUSES: DisplayValuePair<Progress>[] = [
    { value: Progress.closed, display: "Closed" },
    {
        value: Progress.closing,
        display: "Closing",
    },
    {
        value: Progress.draft,
        display: "Draft",
    },
    {
        value: Progress.open,
        display: "Open",
    },
    {
        value: Progress.pendingApproval,
        display: "Pending approval",
    },
    {
        value: Progress.editPendingApproval,
        display: "Edit pending approval",
    },
    {
        value: Progress.draftPendingApproval,
        display: "Draft pending approval",
    },
    { value: Progress.published, display: "Published" },
    { value: Progress.rejected, display: "Rejected" },
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
export const TYPE_OF_CONSEQUENCE_PAGE_PATH = "/type-of-consequence";
export const CREATE_CONSEQUENCE_OPERATOR_PATH = "/create-consequence-operator";
export const CREATE_CONSEQUENCE_NETWORK_PATH = "/create-consequence-network";
export const CREATE_CONSEQUENCE_STOPS_PATH = "/create-consequence-stops";
export const CREATE_CONSEQUENCE_SERVICES_PATH = "/create-consequence-services";
export const REVIEW_DISRUPTION_PAGE_PATH = "/review-disruption";
export const DISRUPTION_DETAIL_PAGE_PATH = "/disruption-detail";
export const DISRUPTION_HISTORY_PAGE_PATH = "/disruption-history";
export const DASHBOARD_PAGE_PATH = "/dashboard";
export const VIEW_ALL_DISRUPTIONS_PAGE_PATH = "/view-all-disruptions";
export const ACCOUNT_SETTINGS_PAGE_PATH = "/account-settings";
export const LOGIN_PAGE_PATH = "/login";
export const CHANGE_PASSWORD_PAGE_PATH = "/change-password";
export const USER_MANAGEMENT_PAGE_PATH = "/admin/user-management";
export const ADD_USER_PAGE_PATH = "/admin/add-user";
export const REGISTER_PAGE_PATH = "/register";
export const EXPIRED_LINK_PAGE_PATH = "/expired-link";
export const HOME_PAGE_PATH = "/";
export const SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH = "/admin/social-media-accounts";
export const CREATE_SOCIAL_MEDIA_POST_PAGE_PATH = "/create-social-media-post";

// COOKIES
export const COOKIES_DISRUPTION_ERRORS = "cdd-disruption-errors";
export const COOKIES_CONSEQUENCE_TYPE_ERRORS = "cdd-consequence-type-errors";
export const COOKIES_CONSEQUENCE_OPERATOR_ERRORS = "cdd-consequence-operator-errors";
export const COOKIES_CONSEQUENCE_NETWORK_ERRORS = "cdd-consequence-network-errors";
export const COOKIES_CONSEQUENCE_STOPS_ERRORS = "cdd-consequence-stops-errors";
export const COOKIES_CONSEQUENCE_SERVICES_ERRORS = "cdd-consequence-services-errors";
export const COOKIES_LOGIN_ERRORS = "cdd-login-errors";
export const COOKIES_CHANGE_PASSWORD_ERRORS = "cdd-change-password-errors";
export const COOKIES_ADD_USER_ERRORS = "cdd-add-user-errors";
export const COOKIES_REGISTER_ERRORS = "cdd-register-errors";
export const COOKIES_POLICY_COOKIE = "cdd-cookies-policy";
export const COOKIE_PREFERENCES_COOKIE = "cdd-cookie-preferences-set";
export const COOKIES_ID_TOKEN = "cdd-id-token";
export const COOKIES_REFRESH_TOKEN = "cdd-refresh-token";
export const COOKIES_DISRUPTION_DETAIL_REFERER = "cdd-disruption-detail-referer";
export const COOKIE_CSRF = "_csrf";
export const COOKIES_REVIEW_DISRUPTION_ERRORS = "cdd-consequence-services-errors";
export const COOKIES_DISRUPTION_DETAIL_ERRORS = "cdd-disruption-detail-errors";
export const COOKIES_SOCIAL_MEDIA_ERRORS = "cdd-consequence-network-errors";

export const API_BASE_URL = process.env.API_BASE_URL || "";
export const MIN_PASSWORD_LENGTH = 8;

export const MAX_FILE_SIZE = 5242880;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const HOOTSUITE_URL = "https://platform.hootsuite.com/";
