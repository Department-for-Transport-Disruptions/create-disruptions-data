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
    validityStartDateDay: string;
    validityStartDateMonth: string;
    validityStartDateYear: string;
    validityEndDateDay: string;
    validityEndDateMonth: string;
    validityEndDateYear: string;
    validityStartTimeHour: string;
    validityStartTimeMinute: string;
    validityEndTimeHour: string;
    validityEndTimeMinute: string;
    publishStartDateDay: string;
    publishStartDateMonth: string;
    publishStartDateYear: string;
    publishEndDateDay: string;
    publishEndDateMonth: string;
    publishEndDateYear: string;
    publishStartTimeHour: string;
    publishStartTimeMinute: string;
    publishEndTimeHour: string;
    publishEndTimeMinute: string;
}

export interface CreateDisruptionProps {
    inputs: DisruptionInfo;
    summary?: string;
    description?: string;
    disruptionType?: string;
    associatedLink?: string;
    disruptionReason?: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason;
    errors?: ErrorInfo[];
}
