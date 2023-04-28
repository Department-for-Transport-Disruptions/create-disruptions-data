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
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_REVIEW_DISRUPTION_ERRORS, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { getDisruptionById, insertPublishedDisruptionIntoDynamoAndUpdateDraft } from "../../data/dynamo";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { getDatetimeFromDateAndTime } from "../../utils/dates";
import logger from "../../utils/logger";

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

const publish = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);

        if (!validatedBody.success) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const draftDisruption = await getDisruptionById(validatedBody.data.disruptionId);

        if (!draftDisruption || (draftDisruption && Object.keys(draftDisruption).length === 0)) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftDisruption);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_REVIEW_DISRUPTION_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
            getPtSituationElementFromDraft(draftDisruption),
            draftDisruption.disruptionId,
        );

        cleardownCookies(req, res);

        redirectTo(res, "/dashboard");
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.publish", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publish;
