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
    validityStartDate: string;
    validityEndDate: string;
    validityStartTimeHour: string;
    validityStartTimeMinute: string;
    validityEndTimeHour: string;
    validityEndTimeMinute: string;
    publishStartDate: string;
    publishEndDate: string;
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
