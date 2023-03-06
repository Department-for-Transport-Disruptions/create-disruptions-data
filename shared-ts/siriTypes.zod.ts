import dayjs from "dayjs";
import { z } from "zod";
import {
    DayType,
    EnvironmentReason,
    EquipmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    SourceType,
} from "./enums";

export const sourceTypeSchema = z.nativeEnum(SourceType);

export const progressSchema = z.nativeEnum(Progress);

export const miscellaneousReasonSchema = z.nativeEnum(MiscellaneousReason);

export const personnelReasonSchema = z.nativeEnum(PersonnelReason);

export const equipmentReasonSchema = z.nativeEnum(EquipmentReason);

export const environmentReasonSchema = z.nativeEnum(EnvironmentReason);

export const dayTypeSchema = z.nativeEnum(DayType);

export const sourceSchema = z.object({
    SourceType: sourceTypeSchema,
    TimeOfCommunication: z.string().datetime(),
});

export const periodSchema = z
    .object({
        StartTime: z.string().datetime(),
        EndTime: z.string().datetime().optional(),
    })
    .refine(
        (obj) => (obj.EndTime ? dayjs(obj.EndTime).isAfter(dayjs(obj.StartTime)) : true),
        "End Time must be after Start Time",
    );

export const infoLinkSchema = z.object({
    Uri: z.string().url(),
});

export const situationElementRefSchema = z.object({
    CreationTime: z.string().datetime(),
    ParticipantRef: z.string(),
    SituationNumber: z.string(),
});

export const referenceSchema = z.object({
    RelatedToRef: situationElementRefSchema,
});

export const repetitionsSchema = z.object({
    DayType: dayTypeSchema,
});

export const infoLinksSchema = z.object({
    InfoLink: infoLinkSchema,
});

export const basePtSituationElementSchema = z.object({
    CreationTime: situationElementRefSchema.shape.CreationTime,
    ParticipantRef: situationElementRefSchema.shape.ParticipantRef,
    SituationNumber: situationElementRefSchema.shape.SituationNumber,
    Version: z.number().optional(),
    References: z.array(referenceSchema).optional(),
    Source: sourceSchema,
    Progress: progressSchema,
    ValidityPeriod: periodSchema,
    Repetitions: z.array(repetitionsSchema).optional(),
    PublicationWindow: periodSchema,
});

export const ptSituationElementSchema = basePtSituationElementSchema
    .and(
        z
            .discriminatedUnion("ReasonType", [
                z.object({
                    ReasonType: z.literal("MiscellaneousReason"),
                    MiscellaneousReason: miscellaneousReasonSchema,
                }),
                z.object({ ReasonType: z.literal("PersonnelReason"), PersonnelReason: personnelReasonSchema }),
                z.object({ ReasonType: z.literal("EquipmentReason"), EquipmentReason: equipmentReasonSchema }),
                z.object({ ReasonType: z.literal("EnvironmentReason"), EnvironmentReason: environmentReasonSchema }),
            ])
            .and(
                z.object({
                    Planned: z.boolean(),
                    Summary: z.string(),
                    Description: z.string(),
                    InfoLinks: z.array(infoLinksSchema).optional(),
                }),
            ),
    )
    .transform((val) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete val.ReasonType;

        return val;
    });

export const situationSchema = z.object({
    PtSituationElement: ptSituationElementSchema,
});

export const situationExchangeDeliverySchema = z.object({
    ResponseTimestamp: z.string().datetime(),
    Status: z.boolean().optional(),
    ShortestPossibleCycle: z.string().optional(),
    Situations: z.array(situationSchema),
});

export const serviceDeliverySchema = z.object({
    ResponseTimestamp: z.string().datetime(),
    ProducerRef: z.string(),
    ResponseMessageIdentifier: z.string(),
    SituationExchangeDelivery: situationExchangeDeliverySchema,
});

export const siriSchema = z.object({
    ServiceDelivery: serviceDeliverySchema,
});
