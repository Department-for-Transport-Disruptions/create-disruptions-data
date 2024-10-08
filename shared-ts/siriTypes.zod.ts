import dayjs from "dayjs";
import { z } from "zod";
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

// Adjust ParticipantRef to literal when ENABLE_PARTICIPANT_REF_FEATURE_FLAG is removed
export const situationElementRefSchema = z.object({
    CreationTime: z.string().datetime().optional(),
    VersionedAtTime: z.string().datetime().optional(),
    ParticipantRef: z.string(),
    SituationNumber: z.string(),
});

export const referenceSchema = z.object({
    RelatedToRef: z.array(situationElementRefSchema),
});

export const repetitionsSchema = z.object({
    DayType: z.array(dayTypeSchema),
});

export const infoLinksSchema = z.object({
    InfoLink: z.array(infoLinkSchema),
});

export const affectedOperatorSchema = z.object({
    OperatorRef: z.string(),
    OperatorName: z.string().optional(),
});

export const operatorsSchema = z.object({
    AllOperators: z.literal("").optional(),
    AffectedOperator: z.array(affectedOperatorSchema).optional(),
});

export const networksSchema = z.object({
    AffectedNetwork: z.object({
        VehicleMode: z.nativeEnum(VehicleMode),
        AllLines: z.literal("").optional(),
        AffectedLine: z
            .array(
                z.object({
                    AffectedOperator: affectedOperatorSchema.optional(),
                    LineRef: z.string(),
                    PublishedLineName: z.string(),
                    Direction: z
                        .object({
                            DirectionRef: z.union([z.literal("inboundTowardsTown"), z.literal("outboundFromTown")]),
                        })
                        .optional(),
                }),
            )
            .optional(),
    }),
});

export const placesSchema = z.object({
    AffectedPlace: z.array(
        z.object({
            PlaceRef: z.string(),
            PlaceName: z.string(),
            PlaceCategory: z.string(),
        }),
    ),
});

export const stopPointsSchema = z.object({
    AffectedStopPoint: z.array(
        z.object({
            StopPointRef: z.string(),
            StopPointName: z.string(),
            Location: z.object({
                Longitude: z.number(),
                Latitude: z.number(),
            }),
            AffectedModes: z.object({
                Mode: z.object({
                    VehicleMode: z.nativeEnum(VehicleMode),
                }),
            }),
        }),
    ),
});

export const journeysSchema = z.object({
    AffectedVehicleJourney: z.array(
        z.object({
            VehicleJourneyRef: z.string(),
            Route: z.string(),
            OriginAimedDepartureTime: z.string(),
        }),
    ),
});

export const consequenceSchema = z.object({
    Consequence: z.array(
        z.object({
            Condition: z.enum(["unknown", "cancelled"]),
            Severity: z.nativeEnum(Severity),
            Affects: z.object({
                Operators: operatorsSchema.optional(),
                Networks: networksSchema.optional(),
                Places: placesSchema.optional(),
                StopPoints: stopPointsSchema.optional(),
                VehicleJourneys: journeysSchema.optional(),
            }),
            Advice: z.object({
                Details: z.string(),
            }),
            Blocking: z.object({
                JourneyPlanner: z.boolean(),
            }),
            Delays: z
                .object({
                    // Requires Delay to be in ISO 8601 notation, eg. PT10M represents 10 minutes
                    Delay: z.string().regex(/^PT\d+M$/),
                })
                .optional(),
        }),
    ),
});

export const basePtSituationElementSchema = z.object({
    CreationTime: situationElementRefSchema.shape.CreationTime,
    ParticipantRef: situationElementRefSchema.shape.ParticipantRef,
    SituationNumber: situationElementRefSchema.shape.SituationNumber,
    Version: z.number().optional(),
    References: referenceSchema.optional(),
    Source: sourceSchema,
    VersionedAtTime: situationElementRefSchema.shape.VersionedAtTime,
    Progress: progressSchema,
    ValidityPeriod: z.array(periodSchema),
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

export const ptSituationElementSchemaWithTransform = ptSituationElementSchema.transform((val) => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete val.ReasonType;

    return val;
});

export const situationsSchema = z.object({
    PtSituationElement: z.array(ptSituationElementSchemaWithTransform),
});

export const situationExchangeDeliverySchema = z.object({
    ResponseTimestamp: z.string().datetime(),
    Status: z.boolean().optional(),
    ShortestPossibleCycle: z.string().optional(),
    Situations: situationsSchema,
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
