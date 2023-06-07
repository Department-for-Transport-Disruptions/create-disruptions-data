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
            column: "mode",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.mode,
        },
        {
            column: "operator wide",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData["operator wide"],
        },
        {
            column: "network wide",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData["network wide"],
        },
        {
            column: "services affected",
            type: Number,
            value: (objectData: ExportDisruptionData) => objectData["services affected"],
        },
        {
            column: "stops affected",
            type: Number,
            value: (objectData: ExportDisruptionData) => objectData["stops affected"],
        },
        {
            column: "start",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.start,
        },
        {
            column: "end",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.end,
        },
        {
            column: "severity",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.severity,
        },
        {
            column: "live",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.live,
        },
        {
            column: "status",
            type: String,
            value: (objectData: ExportDisruptionData) => objectData.severity,
        },
    ];
};
