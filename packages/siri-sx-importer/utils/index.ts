import * as console from "console";
import { Service, Stop, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { serviceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { fetchServicesByOperators } from "../refDataApi";
import {
    AffectedLine,
    Affects,
    DisruptionAndValidityDates,
    PtSituationElement,
    StopPoints,
    ValidityPeriodItem,
} from "./importerSiriTypes.zod";

dayjs.extend(utc);
dayjs.extend(timezone);

export const convertDateTimeToFormat = (dateOrTime: string | Date | undefined, format: "DD/MM/YYYY" | "HHmm") => {
    return dayjs(dateOrTime).tz("Europe/London").format(format);
};

export const compareStartDate = (a: ValidityPeriodItem, b: ValidityPeriodItem) => {
    const dateBIsBeforeA = dayjs(b.StartTime).isBefore(dayjs(a.StartTime));
    return dateBIsBeforeA ? 1 : -1;
};

export const getDisruptionReason = (disruption: PtSituationElement) => {
    switch (disruption.ReasonType) {
        case "EnvironmentReason":
            return disruption.EnvironmentReason;
        case "EquipmentReason":
            return disruption.EquipmentReason;
        case "PersonnelReason":
            return disruption.PersonnelReason;
        case "MiscellaneousReason":
            return disruption.MiscellaneousReason;
    }
};

export const getDisruptionAndValidityDates = (disruption: PtSituationElement): DisruptionAndValidityDates => {
    let disruptionDatesAndTimes = {};
    const validityDatesAndTimes = [];

    const sortedDisruptionValidityPeriods = disruption.ValidityPeriod.sort(compareStartDate).reverse();
    disruptionDatesAndTimes = sortedDisruptionValidityPeriods[0];

    if (sortedDisruptionValidityPeriods.length > 1) {
        validityDatesAndTimes.push(...sortedDisruptionValidityPeriods.slice(1));
    }

    return {
        disruptionDatesAndTimes,
        validityDatesAndTimes,
    };
};

export const formatValidityArray = (validityDatesAndTimes: ValidityPeriodItem[]): Validity[] | [] => {
    if (validityDatesAndTimes.length === 0) {
        return [];
    }
    return validityDatesAndTimes.map((item): Validity => {
        return {
            disruptionEndDate: item.EndTime ? convertDateTimeToFormat(item.EndTime, "DD/MM/YYYY") : "",
            disruptionEndTime: item.EndTime ? convertDateTimeToFormat(item.EndTime, "HHmm") : "",
            disruptionNoEndDateTime: !item.EndTime ? "true" : "",
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: convertDateTimeToFormat(item.StartTime, "DD/MM/YYYY"),
            disruptionStartTime: convertDateTimeToFormat(item.StartTime, "HHmm"),
        };
    });
};

export const getConsequenceType = (affectsItem: Affects) => {
    if (affectsItem.Operators?.AllOperators === "" && !!affectsItem.StopPoints) {
        return "stops";
    }
    if (affectsItem.Operators?.AllOperators === "" && !affectsItem.StopPoints) {
        return "networkWide";
    }
    if (affectsItem.Networks?.AffectedNetwork.AffectedLine) {
        return "services";
    }
    return "operatorWide";
};

export const getStops = (stopPoints: StopPoints) => {
    return stopPoints.AffectedStopPoint.map((stop): Stop => {
        return {
            commonName: stop.StopPointName,
            atcoCode: stop.StopPointRef,
            latitude: stop.Location.Latitude,
            longitude: stop.Location.Longitude,
        };
    });
};

export const getVehicleMode = (affectsItem: Affects) => {
    if (affectsItem.StopPoints) {
        return affectsItem.StopPoints.AffectedStopPoint.map((stop) => stop.AffectedModes.Mode.VehicleMode)[0];
    }
    return affectsItem.Networks?.AffectedNetwork.VehicleMode ?? VehicleMode.bus;
};

export const getDisruptionDirection = (affectedLine: AffectedLine[] | undefined) => {
    return affectedLine
        ? affectedLine.map((service) =>
              service.Direction?.DirectionRef === "inboundTowardsTown" ? "inbound" : "outbound",
          )[0]
        : "allDirections";
};

let numErrors = 0;
let numSuccess = 0;
const bodsOperators = ["BEVC", "FHAL", "FMAN", "FSYO", "SCGR", "GONW", "YSYC", "SYRK", "SCLIgit adfd"];

export const getServices = async (affectedLine: AffectedLine[] | undefined, disruptionId: string) => {
    if (affectedLine) {
        const unfilteredServices = await Promise.all(
            affectedLine.flatMap((service) => {
                if (service.AffectedOperator) {
                    return service.AffectedOperator.map(async (operator): Promise<Service | null> => {
                        console.log("Retrieving service...");
                        const inputs = {
                            dataSource: bodsOperators.includes(operator.OperatorRef)
                                ? Datasource.bods
                                : Datasource.tnds,
                            lineNames: service.LineRef,
                            nocCode: operator.OperatorRef,
                        };

                        const services = await fetchServicesByOperators(inputs);

                        try {
                            const parsedService = serviceSchema.parse(services);
                            numSuccess = numSuccess + 1;
                            return parsedService;
                        } catch (_e) {
                            numErrors = numErrors + 1;
                            console.log(
                                `could not retrieve service (operator code ${operator.OperatorRef}, line ref: ${service.LineRef} for situation number: ${disruptionId}, total errors: ${numErrors})`,
                            );
                            return null;
                        }
                    }).filter(notEmpty);
                }
                return null;
            }),
        );
        return unfilteredServices.filter(notEmpty);
    }
    return [];
};

type AffectedOperator = {
    OperatorRef: string;
    OperatorName: string;
};
export const getConsequenceOperators = (affectedOperators: AffectedOperator[]) => {
    return affectedOperators.map((operator) => {
        return {
            operatorNoc: operator.OperatorRef,
            operatorPublicName: operator.OperatorName,
        };
    });
};
