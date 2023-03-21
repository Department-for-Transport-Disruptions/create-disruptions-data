import { z } from "zod";
import { EnvironmentReason, EquipmentReason, MiscellaneousReason, PersonnelReason } from "./enums";
import {
    affectedOperatorSchema,
    basePtSituationElementSchema,
    consequenceSchema,
    infoLinkSchema,
    networksSchema,
    operatorsSchema,
    periodSchema,
    ptSituationElementSchema,
    referenceSchema,
    repetitionsSchema,
    serviceDeliverySchema,
    siriSchema,
    situationElementRefSchema,
    situationExchangeDeliverySchema,
    situationsSchema,
    sourceSchema,
    stopPointsSchema,
} from "./siriTypes.zod";

export type Reason = MiscellaneousReason | EnvironmentReason | PersonnelReason | EquipmentReason;

export type Source = z.infer<typeof sourceSchema>;

export type Period = z.infer<typeof periodSchema>;

export type InfoLink = z.infer<typeof infoLinkSchema>;

export type SituationElementRef = z.infer<typeof situationElementRefSchema>;

export type Reference = z.infer<typeof referenceSchema>;

export type Repetitions = z.infer<typeof repetitionsSchema>;

export type InfoLinks = z.infer<typeof infoLinkSchema>;

export type AffectedOperator = z.infer<typeof affectedOperatorSchema>;

export type Operators = z.infer<typeof operatorsSchema>;

export type Networks = z.infer<typeof networksSchema>;

export type StopPoints = z.infer<typeof stopPointsSchema>;

export type Consequence = z.infer<typeof consequenceSchema>;

export type BasePtSituationElement = z.infer<typeof basePtSituationElementSchema>;

export type PtSituationElement = z.infer<typeof ptSituationElementSchema>;

export type Situations = z.infer<typeof situationsSchema>;

export type SituationExchangeDelivery = z.infer<typeof situationExchangeDeliverySchema>;

export type ServiceDelivery = z.infer<typeof serviceDeliverySchema>;

export type Siri = z.infer<typeof siriSchema>;

export const isMiscellaneousReason = (reason: Reason): reason is MiscellaneousReason => reason in MiscellaneousReason;
export const isEquipmentReason = (reason: Reason): reason is EquipmentReason => reason in EquipmentReason;
export const isPersonnelReason = (reason: Reason): reason is PersonnelReason => reason in PersonnelReason;
export const isEnvironmentReason = (reason: Reason): reason is EnvironmentReason => reason in EnvironmentReason;
