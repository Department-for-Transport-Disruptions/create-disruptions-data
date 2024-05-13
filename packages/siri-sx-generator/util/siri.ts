import { Disruption, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Progress, SourceType } from "@create-disruptions-data/shared-ts/enums";
import {
    isEnvironmentReason,
    isMiscellaneousReason,
    isPersonnelReason,
    PtSituationElement,
    Reason,
    Period,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { getDisruptionCreationTime } from "@create-disruptions-data/shared-ts/utils";
import { getDate, getDatetimeFromDateAndTime, getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";

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
) => {
    const { STAGE: stage } = process.env;
    const PUBLISHED_LINE_NAME_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    const VERSION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");
    const LINE_REF_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");

    const currentTime = getDate().toISOString();

    const reason = disruption.disruptionReason;

    const participantRef = disruption.organisation.name.replace(/[^-._:A-Za-z0-9]/g, "");

    const validityPeriod = getValidityPeriod({
        disruptionStartDate: disruption.disruptionStartDate,
        disruptionStartTime: disruption.disruptionStartTime,
        disruptionEndDate: disruption.disruptionEndDate,
        disruptionEndTime: disruption.disruptionEndTime,
        disruptionRepeats: disruption.disruptionRepeats,
        disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
    });

    const ptSituationElement: Omit<PtSituationElement, Reason | "ReasonType"> = {
        ...(VERSION_FEATURE_FLAG
            ? {
                  Version: disruption.history?.length || 1,
                  VersionedAtTime:
                      disruption.lastUpdated ??
                      getDisruptionCreationTime(disruption.history ?? null, disruption.creationTime ?? null),
              }
            : {}),
        CreationTime: getDisruptionCreationTime(disruption.history ?? null, disruption.creationTime ?? null),
        Planned: disruption.disruptionType === "planned",
        Summary: disruption.summary,
        Description: disruption.description,
        ParticipantRef: participantRef,
        SituationNumber: disruption.disruptionId,
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
                          Condition: "unknown",
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
                                                    ...(LINE_REF_FEATURE_FLAG
                                                        ? { LineRef: service.lineName.replace(/\s+/g, "_") }
                                                        : { LineRef: service.lineId }),
                                                    ...(PUBLISHED_LINE_NAME_FEATURE_FLAG
                                                        ? { PublishedLineName: service.lineName.replace(/\s+/g, "_") }
                                                        : {}),
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
