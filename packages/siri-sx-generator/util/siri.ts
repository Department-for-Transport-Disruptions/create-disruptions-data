import { Disruption, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Progress, SourceType } from "@create-disruptions-data/shared-ts/enums";
import {
    Period,
    PtSituationElement,
    Reason,
    isEnvironmentReason,
    isMiscellaneousReason,
    isPersonnelReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { getDisruptionCreationTime } from "@create-disruptions-data/shared-ts/utils";
import { getDate, getDatetimeFromDateAndTime, getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { AdminArea } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { combineDateAndTime } from ".";
export const getValidityPeriod = (period: Validity): Period[] => {
    const siriValidityPeriods: Period[] = [];

    siriValidityPeriods.push(getPeriod(period));
    if (
        period.disruptionRepeatsEndDate &&
        period.disruptionEndDate &&
        (period.disruptionRepeats === "daily" || period.disruptionRepeats === "weekly")
    ) {
        let startDate =
            period.disruptionRepeats === "daily"
                ? getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).add(1, "day")
                : getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).add(7, "day");
        let endDate =
            period.disruptionRepeats === "daily"
                ? getDatetimeFromDateAndTime(
                      period.disruptionEndDate,
                      period.disruptionEndTime ? period.disruptionEndTime : "",
                  ).add(1, "day")
                : getDatetimeFromDateAndTime(
                      period.disruptionEndDate,
                      period.disruptionEndTime ? period.disruptionEndTime : "",
                  ).add(7, "day");

        const endingOnDate = getFormattedDate(period.disruptionRepeatsEndDate).add(1, "day");

        while (endDate.isBefore(endingOnDate)) {
            siriValidityPeriods.push({
                StartTime: startDate.toISOString(),
                EndTime: endDate.toISOString(),
            });

            startDate = startDate.add(period.disruptionRepeats === "daily" ? 1 : 7, "day");
            endDate = endDate.add(period.disruptionRepeats === "daily" ? 1 : 7, "day");
        }
    }

    return siriValidityPeriods;
};

const getPeriod = (period: Validity): Period => ({
    StartTime: getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).toISOString(),
    ...(period.disruptionEndDate && period.disruptionEndTime
        ? {
              EndTime: getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).toISOString(),
          }
        : {}),
});

export const getPtSituationElementFromSiteDisruption = (
    disruption: Disruption & { organisation: { id: string; name: string } },
    adminAreas: AdminArea[],
): PtSituationElement => {
    const { STAGE: stage } = process.env;
    const ENABLE_LINE_REF_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    const ENABLE_CANCELLATION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    const ENABLE_PARTICIPANT_REF_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");

    const currentTime = getDate().toISOString();

    const reason = disruption.disruptionReason;

    // Adjust when ENABLE_PARTICIPANT_REF_FEATURE_FLAG is removed
    const participantRef = ENABLE_PARTICIPANT_REF_FEATURE_FLAG
        ? "DepartmentForTransport"
        : disruption.organisation.name.replace(/[^-._:A-Za-z0-9]/g, "");

    const validityPeriod = getValidityPeriod({
        disruptionStartDate: disruption.disruptionStartDate,
        disruptionStartTime: disruption.disruptionStartTime,
        disruptionEndDate: disruption.disruptionEndDate,
        disruptionEndTime: disruption.disruptionEndTime,
        disruptionRepeats: disruption.disruptionRepeats,
        disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
    });

    const ptSituationElement: Omit<PtSituationElement, Reason | "ReasonType"> = {
        Version: disruption.version || 1,
        VersionedAtTime:
            disruption.lastUpdated ??
            getDisruptionCreationTime(disruption.history ?? null, disruption.creationTime ?? null),
        CreationTime: getDisruptionCreationTime(disruption.history ?? null, disruption.creationTime ?? null),
        Planned: disruption.disruptionType === "planned",
        Summary: disruption.summary,
        Description: disruption.description,
        ParticipantRef: participantRef,
        SituationNumber: disruption.id,
        PublicationWindow: {
            StartTime: getDatetimeFromDateAndTime(
                disruption.publishStartDate,
                disruption.publishStartTime,
            ).toISOString(),
            ...(disruption.publishEndDate && disruption.publishEndTime
                ? {
                      EndTime: getDatetimeFromDateAndTime(
                          disruption.publishEndDate,
                          disruption.publishEndTime,
                      ).toISOString(),
                  }
                : {}),
        },
        ValidityPeriod: disruption.validity
            ? [...disruption.validity.flatMap((period) => getValidityPeriod(period)), ...validityPeriod]
            : validityPeriod,
        Progress: Progress.open,
        Source: {
            SourceType: SourceType.feed,
            TimeOfCommunication: currentTime,
        },
        ...(disruption.associatedLink
            ? {
                  InfoLinks: {
                      InfoLink: [
                          {
                              Uri: disruption.associatedLink,
                          },
                      ],
                  },
              }
            : {}),
        ...(disruption.consequences && disruption.consequences.length > 0
            ? {
                  Consequences: {
                      Consequence: disruption.consequences.map((consequence) => ({
                          Condition:
                              consequence.consequenceType === "journeys" && ENABLE_CANCELLATION_FEATURE_FLAG
                                  ? "cancelled"
                                  : "unknown",
                          Severity: consequence.disruptionSeverity,
                          Affects: {
                              ...(consequence.consequenceType === "networkWide" ||
                              consequence.consequenceType === "stops"
                                  ? {
                                        Operators: {
                                            AllOperators: "",
                                        },
                                    }
                                  : {}),
                              ...(consequence.consequenceType === "networkWide" ||
                              consequence.consequenceType === "operatorWide" ||
                              consequence.consequenceType === "stops"
                                  ? {
                                        Networks: {
                                            AffectedNetwork: {
                                                VehicleMode: consequence.vehicleMode,
                                                AllLines: "",
                                            },
                                        },
                                    }
                                  : {}),
                              ...(consequence.consequenceType === "operatorWide"
                                  ? {
                                        Operators: {
                                            AffectedOperator: consequence.consequenceOperators.map((operator) => ({
                                                OperatorRef: operator.operatorNoc,
                                                OperatorName: operator.operatorPublicName,
                                            })),
                                        },
                                    }
                                  : {}),
                              ...(consequence.consequenceType === "journeys" && ENABLE_CANCELLATION_FEATURE_FLAG
                                  ? {
                                        Operators: {
                                            AffectedOperator: consequence.services.map((service) => ({
                                                OperatorRef: service.nocCode,
                                                OperatorName: service.operatorShortName,
                                            })),
                                        },
                                    }
                                  : {}),
                              ...(consequence.consequenceType === "journeys" && ENABLE_CANCELLATION_FEATURE_FLAG
                                  ? {
                                        Networks: {
                                            AffectedNetwork: {
                                                VehicleMode: consequence.vehicleMode,
                                                AffectedLine: consequence.services.map((service) => ({
                                                    LineRef: service.lineId.replace(/\s+/g, "_"),
                                                    PublishedLineName: service.lineName.replace(/\s+/g, "_"),
                                                })),
                                            },
                                        },
                                    }
                                  : {}),
                              ...((consequence.consequenceType === "stops" ||
                                  consequence.consequenceType === "services") &&
                              consequence.stops &&
                              consequence.stops.length > 0
                                  ? {
                                        StopPoints: {
                                            AffectedStopPoint: consequence.stops.map((stop) => ({
                                                AffectedModes: {
                                                    Mode: {
                                                        VehicleMode: consequence.vehicleMode,
                                                    },
                                                },
                                                Location: {
                                                    Longitude: stop.longitude,
                                                    Latitude: stop.latitude,
                                                },
                                                StopPointName: stop.commonName,
                                                StopPointRef: stop.atcoCode,
                                            })),
                                        },
                                    }
                                  : {}),
                              ...(consequence.consequenceType === "services"
                                  ? {
                                        Networks: {
                                            AffectedNetwork: {
                                                VehicleMode: consequence.vehicleMode,
                                                AffectedLine: consequence.services.map((service) => ({
                                                    AffectedOperator: {
                                                        OperatorRef: service.nocCode,
                                                        OperatorName: service.operatorShortName,
                                                    },
                                                    ...(ENABLE_LINE_REF_FEATURE_FLAG
                                                        ? { LineRef: service.lineId.replace(/\s+/g, "_") }
                                                        : { LineRef: service.lineName.replace(/\s+/g, "_") }),
                                                    PublishedLineName: service.lineName.replace(/\s+/g, "_"),
                                                    ...(consequence.disruptionDirection === "inbound" ||
                                                    consequence.disruptionDirection === "outbound"
                                                        ? {
                                                              Direction: {
                                                                  DirectionRef:
                                                                      consequence.disruptionDirection === "inbound"
                                                                          ? "inboundTowardsTown"
                                                                          : "outboundFromTown",
                                                              },
                                                          }
                                                        : {}),
                                                })),
                                            },
                                        },
                                    }
                                  : {}),

                              ...(consequence.consequenceType === "networkWide" &&
                              consequence.disruptionArea &&
                              consequence.disruptionArea.length > 0
                                  ? {
                                        Places: {
                                            AffectedPlace: consequence.disruptionArea?.map((area) => ({
                                                PlaceRef: area,
                                                PlaceName:
                                                    adminAreas.find((code) => code.administrativeAreaCode === area)
                                                        ?.name || "",
                                                PlaceCategory: "AdministrativeArea",
                                            })),
                                        },
                                    }
                                  : {}),

                              ...(consequence.consequenceType === "journeys" &&
                              consequence.journeys &&
                              consequence.journeys.length > 0 &&
                              ENABLE_CANCELLATION_FEATURE_FLAG
                                  ? {
                                        VehicleJourneys: {
                                            AffectedVehicleJourney: consequence.journeys.map((journey) => ({
                                                VehicleJourneyRef: journey.vehicleJourneyCode,
                                                Route: "",
                                                OriginAimedDepartureTime: combineDateAndTime(
                                                    getDisruptionCreationTime(
                                                        disruption.history || [],
                                                        disruption.creationTime || null,
                                                    ),
                                                    journey.departureTime,
                                                ),
                                            })),
                                        },
                                    }
                                  : {}),
                          },
                          Advice: {
                              Details: consequence.description,
                          },
                          Blocking: {
                              JourneyPlanner: consequence.removeFromJourneyPlanners === "yes",
                          },
                          ...(consequence.disruptionDelay
                              ? { Delays: { Delay: `PT${consequence.disruptionDelay}M` } }
                              : {}),
                      })),
                  },
              }
            : {}),
    };

    let completePtSituationElement: PtSituationElement;

    if (isMiscellaneousReason(reason)) {
        completePtSituationElement = {
            ...ptSituationElement,
            ReasonType: "MiscellaneousReason",
            MiscellaneousReason: reason,
        };
    } else if (isEnvironmentReason(reason)) {
        completePtSituationElement = {
            ...ptSituationElement,
            ReasonType: "EnvironmentReason",
            EnvironmentReason: reason,
        };
    } else if (isPersonnelReason(reason)) {
        completePtSituationElement = {
            ...ptSituationElement,
            ReasonType: "PersonnelReason",
            PersonnelReason: reason,
        };
    } else {
        completePtSituationElement = {
            ...ptSituationElement,
            ReasonType: "EquipmentReason",
            EquipmentReason: reason,
        };
    }

    return completePtSituationElement;
};
