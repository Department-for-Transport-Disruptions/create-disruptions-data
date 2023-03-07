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
    typeOfDisruption?: "planned" | "unplanned";
    summary: string;
    description: string;
    associatedLink?: string;
    disruptionReason?: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason | "";
    disruptionStartDate: string;
    disruptionEndDate: string;
    disruptionStartTime: string;
    disruptionEndTime: string;
    publishStartDate: string;
    publishEndDate: string;
    publishStartTime: string;
    publishEndTime: string;
    disruptionRepeats?: string;
    disruptionIsNoEndDateTime?: string;
    publishIsNoEndDateTime?: string;
}
