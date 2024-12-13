import { jsPDF, jsPDFOptions } from "jspdf";
import { ExportDisruptions } from "../schemas/disruption.schema";

export const disruptionPdfHeaders = [
    "id",
    "title",
    "mode",
    "operator_wide",
    "network_wide",
    "services_affected",
    "stops_affected",
    "start_date",
    "end_date",
    "publish_start_date",
    "publish_end_date",
    "severity",
    "live",
    "status",
    "description_of_disruption",
    "disruption_type",
    "creation_time",
    "disruption_reason",
    "list_of_services_affected",
];

export const formatDisruptionsForPdf = (disruptions: ExportDisruptions) => {
    return disruptions.map((disruption) => [
        disruption.id,
        disruption.title,
        disruption.serviceModes,
        disruption.operatorWide,
        disruption.networkWide,
        disruption.servicesAffectedCount.toString(),
        disruption.stopsAffectedCount.toString(),
        disruption.startDate,
        disruption.endDate,
        disruption.publishStartDate,
        disruption.publishEndDate,
        disruption.severity,
        disruption.isLive,
        disruption.status,
        disruption.description,
        disruption.disruptionType,
        disruption.creationTime,
        disruption.disruptionReason,
        disruption.servicesAffected,
    ]);
};

export const createNewPdfDoc = (config: jsPDFOptions) => new jsPDF(config);
