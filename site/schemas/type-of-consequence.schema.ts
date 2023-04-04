import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const typeOfConsequenceSchema = z.object({
    modeOfTransport: z.nativeEnum(VehicleMode, setZodDefaultError("Select a mode of transport")),
    consequenceType: z.union(
        [z.literal("services"), z.literal("networkWide"), z.literal("operatorWide"), z.literal("stops")],
        setZodDefaultError("Select a consequence type"),
    ),
});

export type ConsequenceType = z.infer<typeof typeOfConsequenceSchema>;
