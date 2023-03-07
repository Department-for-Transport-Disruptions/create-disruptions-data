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
