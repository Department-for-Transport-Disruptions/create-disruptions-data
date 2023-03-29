import { Progress, SourceType } from "@create-disruptions-data/shared-ts/enums";
import {
    isEnvironmentReason,
    isMiscellaneousReason,
    isPersonnelReason,
    PtSituationElement,
    Reason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { randomUUID } from "crypto";
import { COOKIES_CONSEQUENCE_INFO, COOKIES_DISRUPTION_INFO } from "../../constants";
import { insertPublishedDisruptionIntoDynamo } from "../../data/dynamo";
import { consequenceSchema } from "../../schemas/consequence.schema";
import { createDisruptionSchema } from "../../schemas/create-disruption.schema";
import { cleardownCookies, redirectTo, redirectToError } from "../../utils/apiUtils";
import { getDatetimeFromDateAndTime } from "../../utils/dates";

const publish = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { [COOKIES_DISRUPTION_INFO]: disruptionInfo, [COOKIES_CONSEQUENCE_INFO]: consequenceInfo } = parseCookies(
            { req },
        );

        const parsedDisruptionInfo = createDisruptionSchema.safeParse(JSON.parse(disruptionInfo));
        const parsedConsequenceInfo = consequenceSchema.safeParse(JSON.parse(consequenceInfo));

        if (!parsedDisruptionInfo.success || !parsedConsequenceInfo.success) {
            throw new Error("Invalid cookie data");
        }

        const disruptionId = randomUUID();
        const currentTime = dayjs().toISOString();

        const disruptionData = parsedDisruptionInfo.data;
        const consequenceData = parsedConsequenceInfo.data;

        const reason = disruptionData.disruptionReason;

        const ptSituationElement: Omit<PtSituationElement, Reason | "ReasonType"> = {
            CreationTime: currentTime,
            Planned: disruptionData.disruptionType === "planned",
            Summary: disruptionData.summary,
            Description: disruptionData.description,
            ParticipantRef: "DepartmentForTransport",
            SituationNumber: disruptionId,
            PublicationWindow: {
                StartTime: getDatetimeFromDateAndTime(
                    disruptionData.publishStartDate,
                    disruptionData.publishStartTime,
                ).toISOString(),
                ...(disruptionData.publishEndDate && disruptionData.publishEndTime
                    ? {
                          EndTime: getDatetimeFromDateAndTime(
                              disruptionData.publishEndDate,
                              disruptionData.publishEndTime,
                          ).toISOString(),
                      }
                    : {}),
            },
            ValidityPeriod: disruptionData.validity
                ? disruptionData.validity.map((period) => ({
                      StartTime: getDatetimeFromDateAndTime(
                          period.disruptionStartDate,
                          period.disruptionStartTime,
                      ).toISOString(),
                      ...(period.disruptionEndDate && period.disruptionEndTime
                          ? {
                                EndTime: getDatetimeFromDateAndTime(
                                    period.disruptionEndDate,
                                    period.disruptionEndTime,
                                ).toISOString(),
                            }
                          : {}),
                  }))
                : [],
            Progress: Progress.open,
            Source: {
                SourceType: SourceType.feed,
                TimeOfCommunication: currentTime,
            },
            ...(disruptionData.associatedLink
                ? {
                      InfoLinks: {
                          InfoLink: [
                              {
                                  Uri: disruptionData.associatedLink,
                              },
                          ],
                      },
                  }
                : {}),
            Consequences: {
                Consequence: [
                    {
                        Condition: "unknown",
                        Severity: consequenceData.disruptionSeverity,
                        Affects: {
                            ...(consequenceData.consequenceType === "networkWide" ||
                            consequenceData.consequenceType === "operatorWide"
                                ? {
                                      Networks: {
                                          AffectedNetwork: {
                                              VehicleMode: consequenceData.vehicleMode,
                                              AllLines: "",
                                          },
                                      },
                                  }
                                : {}),
                            ...(consequenceData.consequenceType === "operatorWide"
                                ? {
                                      Operators: {
                                          AffectedOperator: {
                                              OperatorRef: consequenceData.consequenceOperator,
                                          },
                                      },
                                  }
                                : {}),
                        },
                        Advice: {
                            Details: consequenceData.description,
                        },
                        Blocking: {
                            JourneyPlanner: consequenceData.removeFromJourneyPlanners === "yes",
                        },
                        ...(consequenceData.disruptionDelay
                            ? { Delays: { Delay: `PT${consequenceData.disruptionDelay}M` } }
                            : {}),
                    },
                ],
            },
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

        await insertPublishedDisruptionIntoDynamo(completePtSituationElement);

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
