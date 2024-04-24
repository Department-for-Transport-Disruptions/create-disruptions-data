import {
    DayType,
    EnvironmentReason,
    EquipmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    Severity,
    SourceType,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import { z } from "zod";

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
    Uri: z
        .preprocess((val) => {
            if (val === "" || undefined) {
                return null;
            }
        }, z.string().url().optional().nullable())
        .nullable()
        .optional(),
});

export const situationElementRefSchema = z.object({
    VersionedAtTime: z.string().datetime().optional(),
    CreationTime: z.string().datetime().optional(),
    ParticipantRef: z.string(),
    SituationNumber: z.string(),
});

export const transformToArray = <T>(item: T | T[]): T[] => (Array.isArray(item) ? item : [item]);
export const referenceSchema = z.object({
    RelatedToRef: z.preprocess((val) => transformToArray(val), z.array(situationElementRefSchema)),
});

export const repetitionsSchema = z.object({
    DayType: z.preprocess((val) => transformToArray(val), z.array(dayTypeSchema)),
});

export const infoLinksSchema = z.object({
    InfoLink: z.preprocess((val) => transformToArray(val), z.array(infoLinkSchema)),
});

export const affectedOperatorSchema = z.object({
    OperatorRef: z.string(),
    OperatorName: z.string(),
});

export type Operators = z.infer<typeof operatorsSchema>;

export const operatorsSchema = z.object({
    AllOperators: z.literal("").optional(),
    AffectedOperator: z.preprocess((val) => transformToArray(val), z.array(affectedOperatorSchema)).optional(),
});

export const affectedLineSchema = z.object({
    AffectedOperator: z.preprocess((val) => transformToArray(val), z.array(affectedOperatorSchema)).optional(),
    LineRef: z.string(),
    Direction: z
        .object({
            DirectionRef: z.union([z.literal("inboundTowardsTown"), z.literal("outboundFromTown")]),
        })
        .optional(),
});

export const networksSchema = z.object({
    AffectedNetwork: z.object({
        VehicleMode: z.nativeEnum(VehicleMode),
        AllLines: z.literal("").optional(),
        AffectedLine: z.preprocess((val) => transformToArray(val), z.array(affectedLineSchema)).optional(),
    }),
});

export type AffectedLine = z.infer<typeof affectedLineSchema>;

export const affectedStopPointItem = z.object({
    StopPointRef: z.string(),
    StopPointName: z.string(),
    Location: z.object({
        Longitude: z.coerce.number(),
        Latitude: z.coerce.number(),
    }),
    AffectedModes: z.object({
        Mode: z.object({
            VehicleMode: z.nativeEnum(VehicleMode),
        }),
    }),
});

export type StopPoints = z.infer<typeof stopPointsSchema>;

export const stopPointsSchema = z.object({
    AffectedStopPoint: z.preprocess((val) => transformToArray(val), z.array(affectedStopPointItem)),
});

export const consequenceItem = z.object({
    Condition: z.literal("unknown"),
    Severity: z.preprocess((val) => (val === "undefined" ? Severity.unknown : val), z.nativeEnum(Severity)),
    Affects: z.object({
        Operators: operatorsSchema.optional(),
        Networks: networksSchema.optional(),
        StopPoints: stopPointsSchema.optional(),
    }),
    Advice: z.object({
        Details: z.string(),
    }),
    Blocking: z.object({
        JourneyPlanner: z.boolean(),
    }),
    Delays: z
        .object({
            // Requires Delay to be in ISO 8601 notation, e.g. PT10M represents 10 minutes
            Delay: z.string().regex(/^PT\d+M$/),
        })
        .optional(),
});

export type Affects = z.infer<typeof affectsSchema>;
export const affectsSchema = consequenceItem.shape.Affects;
export const consequenceSchema = z.object({
    Consequence: z.preprocess((val) => transformToArray(val), z.array(consequenceItem)),
});

export const basePtSituationElementSchema = z.object({
    CreationTime: situationElementRefSchema.shape.CreationTime,
    VersionedAtTime: situationElementRefSchema.shape.VersionedAtTime,
    ParticipantRef: situationElementRefSchema.shape.ParticipantRef,
    SituationNumber: situationElementRefSchema.shape.SituationNumber,
    Version: z.coerce.number().optional(),
    References: referenceSchema.optional(),
    Source: sourceSchema,
    Progress: progressSchema,
    ValidityPeriod: z.preprocess((val) => transformToArray(val), z.array(periodSchema)),
    Repetitions: repetitionsSchema.optional(),
    PublicationWindow: periodSchema,
});

export const ptSituationElementSchema = basePtSituationElementSchema.and(
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
                InfoLinks: infoLinksSchema.optional(),
                Consequences: consequenceSchema.optional(),
            }),
        ),
);

export type PtSituationElement = z.infer<typeof ptSituationElementSchema>;

export const situationsSchema = z.object({
    PtSituationElement: z.array(ptSituationElementSchema),
});

export const situationExchangeDeliverySchema = z.object({
    ResponseTimestamp: z.string(),
    Status: z.boolean().optional(),
    ShortestPossibleCycle: z.string().optional(),
    Situations: situationsSchema,
});

export const serviceDeliverySchema = z.object({
    ResponseTimestamp: z.string(),
    ProducerRef: z.string(),
    ResponseMessageIdentifier: z.string(),
    SituationExchangeDelivery: situationExchangeDeliverySchema,
});

export const siriSchema = z.object({
    ServiceDelivery: serviceDeliverySchema,
});

export const organisationSchema = z
    .object({
        PK: z.string(),
        name: z.string(),
        mode: z.coerce.string().optional(),
        adminAreaCodes: z.coerce.string(),
    })
    .array();

export type Organisation = z.infer<typeof organisationSchema>;

export type ValidityPeriodItem = {
    StartTime?: string | Date;
    EndTime?: string | Date;
};

export interface DisruptionAndValidityDates {
    disruptionDatesAndTimes: ValidityPeriodItem;
    validityDatesAndTimes: ValidityPeriodItem[] | [];
}
