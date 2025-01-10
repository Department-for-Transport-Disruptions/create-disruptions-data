import { z } from "zod";
import { serviceSchema, stopSchema, } from "./disruptionTypes.zod";
export const serviceWithCentrePointSchema = serviceSchema.and(z.object({
    centrePointLat: z.string().nullable(),
    centrePointLon: z.string().nullable(),
}));
export const routesSchema = z.object({
    inbound: z.record(z.array(stopSchema.partial())),
    outbound: z.record(z.array(stopSchema.partial())),
});
export const routesPreformattedSchema = z.object({
    inbound: z.array(stopSchema.partial()),
    outbound: z.array(stopSchema.partial()),
});
