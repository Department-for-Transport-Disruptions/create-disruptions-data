import { EnvironmentReason, EquipmentReason, MiscellaneousReason, PersonnelReason } from "./enums";
export const isMiscellaneousReason = (reason) => reason in MiscellaneousReason;
export const isEquipmentReason = (reason) => reason in EquipmentReason;
export const isPersonnelReason = (reason) => reason in PersonnelReason;
export const isEnvironmentReason = (reason) => reason in EnvironmentReason;
