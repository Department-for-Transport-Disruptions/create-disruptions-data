import { z } from "zod";
import { operatorSchema } from "./consequence.schema";
import { MAX_OPERATOR_NOC_CODES } from "../constants";
import { setZodDefaultError } from "../utils";

export const addOperatorSchema = z.object({
    operatorName: z.string(setZodDefaultError("Enter a name for the operator")).min(1),
    nocCodes: z
        .array(operatorSchema.pick({ id: true, operatorPublicName: true, nocCode: true }))
        .min(1, { message: "Select at least one NOC code" })
        .max(MAX_OPERATOR_NOC_CODES, {
            message: `Maximum of ${MAX_OPERATOR_NOC_CODES} NOC codes permitted per operator user`,
        }),

    orgId: z.string().uuid(),
});

export type AddOperatorSchema = z.infer<typeof addOperatorSchema>;
