import { Insertable, JSONColumnType, Selectable, Updateable } from "kysely";
import { ConsequenceOperators, Journey, Service, Stop, Validity } from "../disruptionTypes";
import { History } from "../disruptionTypes.zod";
import { PublishStatus, Severity, VehicleMode } from "../enums";

export interface Database {
    disruptions: DisruptionsTable;
    consequences: ConsequencesTable;
    disruptionsEdited: DisruptionsTable;
    consequencesEdited: ConsequencesTable;
}

export interface DisruptionsTable {
    id: string;
    displayId: string;
    orgId: string;
    summary: string;
    description: string;
    disruptionReason: string;
    disruptionType: string;
    publishStatus: PublishStatus;
    publishStartDate: string;
    publishStartTime: string;
    publishEndDate: string | null;
    publishEndTime: string | null;
    disruptionStartDate: string;
    disruptionStartTime: string;
    disruptionEndDate: string | null;
    disruptionEndTime: string | null;
    disruptionNoEndDateTime: "true" | "" | null;
    disruptionRepeats: "doesntRepeat" | "daily" | "weekly" | null;
    disruptionRepeatsEndDate: string | null;
    validity: JSONColumnType<Validity[]> | null;
    validityStartTimestamp: Date;
    validityEndTimestamp: Date | null;
    publishStartTimestamp: Date;
    publishEndTimestamp: Date | null;
    createdByOperatorOrgId: string | null;
    socialMediaPosts: JSONColumnType<object[]> | null;
    history: JSONColumnType<History[]> | null;
    permitReferenceNumber: string | null;
    associatedLink: string | null;
    template: boolean | null;
    creationTime: string | null;
    lastUpdated: string | null;
    version: number | null;
}

export type DisruptionDB = Selectable<DisruptionsTable>;
export type NewDisruptionDB = Insertable<DisruptionsTable>;
export type DisruptionUpdateDB = Updateable<DisruptionsTable>;

export interface ConsequencesTable {
    disruptionId: string;
    consequenceIndex: number;
    consequenceType: string;
    description: string;
    disruptionDelay: string | null;
    disruptionDirection: string | null;
    disruptionSeverity: Severity;
    removeFromJourneyPlanners: string;
    vehicleMode: VehicleMode;
    services: JSONColumnType<Service[]>;
    stops: JSONColumnType<Stop[]>;
    consequenceOperators: JSONColumnType<ConsequenceOperators[]>;
    disruptionArea: JSONColumnType<string[]>;
    journeys: JSONColumnType<Journey[]>;
}

export type ConsequenceDB = Selectable<ConsequencesTable>;
export type NewConsequenceDB = Insertable<ConsequencesTable>;
export type ConsequenceUpdateDB = Updateable<ConsequencesTable>;
