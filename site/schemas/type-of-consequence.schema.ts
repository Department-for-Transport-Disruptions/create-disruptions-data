import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const typeOfConsequenceSchema = z.object({
    consequenceType: z.union(
        [z.literal("services"), z.literal("networkWide"), z.literal("operatorWide"), z.literal("stops")],
        setZodDefaultError("Select a mode of transport"),
    ),
    modeOfTransport: z.nativeEnum(VehicleMode, setZodDefaultError("Select a mode of transport")),
});

export type ConsequenceType = z.infer<typeof typeOfConsequenceSchema>;
