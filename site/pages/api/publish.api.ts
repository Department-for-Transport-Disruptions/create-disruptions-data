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
import { COOKIES_CONSEQUENCE_INFO, COOKIES_DISRUPTION_INFO, CREATE_DISRUPTION_PAGE_PATH } from "../../constants";
import { insertPublishedDisruptionIntoDynamo } from "../../data/dynamo";
import { consequenceSchema } from "../../schemas/consequence.schema";
import { createDisruptionSchema } from "../../schemas/create-disruption.schema";
import { getDatetimeFromDateAndTime } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError } from "../../utils/apiUtils";

const publish = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { [COOKIES_DISRUPTION_INFO]: disruptionInfo, [COOKIES_CONSEQUENCE_INFO]: consequenceInfo } = parseCookies(
            { req },
        );

        const parsedDisruptionInfo = createDisruptionSchema.safeParse(JSON.parse(disruptionInfo));
        const parsedConsequenceInfo = consequenceSchema.safeParse(JSON.parse(consequenceInfo));

        if (!parsedDisruptionInfo.success || !parsedConsequenceInfo.success) {
            redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
            return;
        }

        const disruptionId = randomUUID();
        const currentTime = dayjs().toISOString();
        const reason = parsedDisruptionInfo.data.disruptionReason;

        const ptSituationElement: Omit<PtSituationElement, Reason | "ReasonType"> = {
            CreationTime: currentTime,
            Planned: parsedDisruptionInfo.data.disruptionType === "planned",
            Summary: parsedDisruptionInfo.data.summary,
            Description: parsedDisruptionInfo.data.description,
            ParticipantRef: "DepartmentForTransport",
            SituationNumber: disruptionId,
            PublicationWindow: {
                StartTime: getDatetimeFromDateAndTime(
                    parsedDisruptionInfo.data.publishStartDate,
                    parsedDisruptionInfo.data.publishStartTime,
                ).toISOString(),
                ...(parsedDisruptionInfo.data.publishEndDate && parsedDisruptionInfo.data.publishEndTime
                    ? {
                          EndTime: getDatetimeFromDateAndTime(
                              parsedDisruptionInfo.data.publishEndDate,
                              parsedDisruptionInfo.data.publishEndTime,
                          ).toISOString(),
                      }
                    : {}),
            },
            ValidityPeriod: parsedDisruptionInfo.data.validity.map((period) => ({
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
            })),
            Progress: Progress.open,
            Source: {
                SourceType: SourceType.feed,
                TimeOfCommunication: currentTime,
            },
            ...(parsedDisruptionInfo.data.associatedLink
                ? {
                      InfoLinks: {
                          InfoLink: [
                              {
                                  Uri: parsedDisruptionInfo.data.associatedLink,
                              },
                          ],
                      },
                  }
                : {}),
            Consequences: {
                Consequence: [
                    {
                        Condition: "unknown",
                        Severity: parsedConsequenceInfo.data.disruptionSeverity,
                        Affects: {
                            ...(parsedConsequenceInfo.data.consequenceType === "networkWide" ||
                            parsedConsequenceInfo.data.consequenceType === "operatorWide"
                                ? {
                                      Networks: {
                                          AffectedNetwork: {
                                              VehicleMode: parsedConsequenceInfo.data.vehicleMode,
                                              AllLines: "",
                                          },
                                      },
                                  }
                                : {}),
                            ...(parsedConsequenceInfo.data.consequenceType === "operatorWide"
                                ? {
                                      Operators: {
                                          AllOperators: "",
                                      },
                                  }
                                : {}),
                        },
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

        redirectTo(res, "/");
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
