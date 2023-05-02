import { Progress, SourceType } from "@create-disruptions-data/shared-ts/enums";
import {
    isEnvironmentReason,
    isMiscellaneousReason,
    isPersonnelReason,
    PtSituationElement,
    Reason,
    Period,
} from "@create-disruptions-data/shared-ts/siriTypes";
import dayjs from "dayjs";
import { getDatetimeFromDateAndTime } from "./dates";
import { Validity } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";

const getValidityPeriod = (period: Validity): Period => ({
    StartTime: getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).toISOString(),
    ...(period.disruptionEndDate && period.disruptionEndTime
        ? {
              EndTime: getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).toISOString(),
          }
        : {}),
});

export const getPtSituationElementFromDraft = (disruption: Disruption) => {
    const currentTime = dayjs().toISOString();

    const reason = disruption.disruptionReason;

    const validityPeriod = getValidityPeriod({
        disruptionStartDate: disruption.disruptionStartDate,
        disruptionStartTime: disruption.disruptionStartTime,
        disruptionEndDate: disruption.disruptionEndDate,
        disruptionEndTime: disruption.disruptionEndTime,
    });

    const ptSituationElement: Omit<PtSituationElement, Reason | "ReasonType"> = {
        CreationTime: currentTime,
        Planned: disruption.disruptionType === "planned",
        Summary: disruption.summary,
        Description: disruption.description,
        ParticipantRef: "DepartmentForTransport",
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
            ? [...disruption.validity.map((period) => getValidityPeriod(period)), validityPeriod]
            : [validityPeriod],
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
                              consequence.consequenceType === "operatorWide"
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
                                            AffectedOperator: consequence.consequenceOperators.map((operatorNoc) => ({
                                                OperatorRef: operatorNoc,
                                            })),
                                        },
                                    }
                                  : {}),
                              ...((consequence.consequenceType === "stops" ||
                                  consequence.consequenceType === "services") &&
                              consequence.stops
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
                                                    LineRef: service.lineName,
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
