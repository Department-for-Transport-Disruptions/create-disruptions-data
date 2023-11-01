import { z } from "zod";
import { operatorSchema } from "./consequence.schema";
import { setZodDefaultError } from "../utils";

export const addOperatorSchema = z.object({
    operatorName: z.string(setZodDefaultError("Enter a first name")).min(1),
    nocCodes: z.array(operatorSchema.pick({ id: true, operatorPublicName: true, nocCode: true })),
    orgId: z.string().uuid(),
});

export type AddOperatorSchema = z.infer<typeof addOperatorSchema>;
