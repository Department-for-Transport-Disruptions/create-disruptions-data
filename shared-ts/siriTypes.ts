import { z } from "zod";
import {
    basePtSituationElementSchema,
    infoLinkSchema,
    periodSchema,
    ptSituationElementSchema,
    referenceSchema,
    repetitionsSchema,
    serviceDeliverySchema,
    siriSchema,
    situationElementRefSchema,
    situationExchangeDeliverySchema,
    situationSchema,
    sourceSchema,
} from "./siriTypes.zod";

export type Source = z.infer<typeof sourceSchema>;

export type Period = z.infer<typeof periodSchema>;

export type InfoLink = z.infer<typeof infoLinkSchema>;

export type SituationElementRef = z.infer<typeof situationElementRefSchema>;

export type Reference = z.infer<typeof referenceSchema>;

export type Repetitions = z.infer<typeof repetitionsSchema>;

export type InfoLinks = z.infer<typeof infoLinkSchema>;

export type BasePtSituationElement = z.infer<typeof basePtSituationElementSchema>;

export type PtSituationElement = z.infer<typeof ptSituationElementSchema>;

export type Situation = z.infer<typeof situationSchema>;

export type SituationExchangeDelivery = z.infer<typeof situationExchangeDeliverySchema>;

export type ServiceDelivery = z.infer<typeof serviceDeliverySchema>;

export type Siri = z.infer<typeof siriSchema>;
