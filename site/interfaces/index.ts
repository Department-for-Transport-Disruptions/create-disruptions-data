import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/enums";

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    typeOfDisruption?: "planned" | "unplanned";
    summary: string;
    description: string;
    associatedLink: string;
    reasonForDisruption?: MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason;
    disruptionStartDate: Date;
    disruptionEndDate?: Date;
    disruptionStartTime: string;
    disruptionEndTime?: string;
    publishStartDate: Date;
    publishEndDate?: Date;
    publishStartTime: string;
    publishEndTime?: string;
}
