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

export const contactFeedbackQuestion = "Did you contact us for assistance at any point?";
export const solveFeedbackQuestion = "Did we solve your problem?";
export const hearAboutUsFeedbackQuestion = "How did you hear about our service?";
export const generalFeedbackQuestion = "Please let us know any feedback or suggestions for improvements you may have";
