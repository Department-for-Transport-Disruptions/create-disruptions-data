import { z } from "zod";
import {
    consequenceOperatorsSchema,
    consequenceSchema,
    disruptionInfoSchema,
    disruptionSchema,
    networkConsequenceSchema,
    operatorConsequenceSchema,
    serviceSchema,
    servicesConsequenceSchema,
    stopSchema,
    stopsConsequenceSchema,
    validitySchema,
} from "./disruptionTypes.zod";

export type Disruption = z.infer<typeof disruptionSchema>;
export type DisruptionInfo = z.infer<typeof disruptionInfoSchema>;

export type Validity = z.infer<typeof validitySchema>;

export type Consequence = z.infer<typeof consequenceSchema>;
export type ConsequenceOperators = z.infer<typeof consequenceOperatorsSchema>;
export type Stop = z.infer<typeof stopSchema>;
export type Service = z.infer<typeof serviceSchema>;

export type NetworkConsequence = z.infer<typeof networkConsequenceSchema>;
export type OperatorConsequence = z.infer<typeof operatorConsequenceSchema>;
export type StopsConsequence = z.infer<typeof stopsConsequenceSchema>;
export type ServicesConsequence = z.infer<typeof servicesConsequenceSchema>;

export const serviceWithCentrePointSchema = serviceSchema.and(
    z.object({
        centrePointLat: z.string(),
        centrePointLon: z.string(),
    }),
);

export type ServiceWithCentrePoint = z.infer<typeof serviceWithCentrePointSchema>;

export const routesSchema = z.object({
    inbound: z.array(stopSchema.partial()),
    outbound: z.array(stopSchema.partial()),
});

export type Routes = z.infer<typeof routesSchema>;

export type ServiceGeoJSON = {
    type: string;
    geometry: {
        type: string;
        coordinates: number[][];
    };
    properties: {
        service_line_id: string;
        destination: string;
        origin: string;
        service_line_name: string;
        service_noc_code: string;
        service_operator: string;
        service_code: string;
    };
};
