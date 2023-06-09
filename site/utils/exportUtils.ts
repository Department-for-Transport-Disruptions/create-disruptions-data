import { Schema } from "write-excel-file";
import { ExportDisruptionData } from "../schemas/disruption.schema";

export const getExportSchema = (): Schema<ExportDisruptionData> => {
    return [
        {
            column: "id",
            type: Number,
            value: (objectData: ExportDisruptionData) => objectData.id,
        },
        {
            column: "title",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.title,
        },
        {
            column: "serviceModes",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.serviceModes,
        },
        {
            column: "operatorWide",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.operatorWide,
        },
        {
            column: "networkWide",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.networkWide,
        },
        {
            column: "servicesAffectedCount",
            type: Number,
            value: (objectData: ExportDisruptionData) => objectData.servicesAffectedCount,
        },
        {
            column: "stopsAffectedCount",
            type: Number,
            value: (objectData: ExportDisruptionData) => objectData.stopsAffectedCount,
        },
        {
            column: "startDate",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.startDate,
        },
        {
            column: "endDate",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.endDate,
        },
        {
            column: "severity",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.severity,
        },
        {
            column: "isLive",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.isLive,
        },
        {
            column: "status",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.severity,
        },
    ];
};
