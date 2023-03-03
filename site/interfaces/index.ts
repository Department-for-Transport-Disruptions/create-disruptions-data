import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    summary: string;
    description: string;
    associatedLink: string;
    validityStartDateDay: string;
    validityEndDateDay: string;
    validityStartTimeHour: string;
    validityStartTimeMinute: string;
    validityEndTimeHour: string;
    validityEndTimeMinute: string;
    publishStartDateDay: string;
    publishEndDateDay: string;
    publishStartTimeHour: string;
    publishStartTimeMinute: string;
    publishEndTimeHour: string;
    publishEndTimeMinute: string;
    disruptionRepeats: string;
    validityIsNoEndDateTime: string;
    publishIsNoEndDateTime: string;
}
