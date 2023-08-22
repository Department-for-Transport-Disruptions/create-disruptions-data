import { DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    EnvironmentReason,
    EquipmentReason,
    MiscellaneousReason,
    PersonnelReason,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement, Reason } from "@create-disruptions-data/shared-ts/siriTypes";
import cryptoRandomString from "crypto-random-string";
import { parseString } from "xml2js";
import { parseBooleans } from "xml2js/lib/processors";
import { promises as fs } from "fs";
import * as util from "util";
import { siriSchema } from "./reverseSiriTypes.zod";

async function loadXml() {
    const data = await fs.readFile("smaller-sirisx.xml", "utf8");
    return data;
}

const xml = await loadXml();

const parsedXml = () => {
    let parsedXml: { Siri: any } = { Siri: {} };
    let error = null;

    parseString(xml, { explicitArray: false, valueProcessors: [parseBooleans] }, function (err, result) {
        error = err;
        parsedXml = result;
    });

    return {
        parsedXml,
        error,
    };
};

const parsedJson = siriSchema.parse(parsedXml().parsedXml.Siri);

const getDisruptionReason = (disruption: PtSituationElement) => {
    switch (disruption.ReasonType) {
        case "EnvironmentReason":
            return disruption.EnvironmentReason;
        case "EquipmentReason":
            return disruption.EquipmentReason;
        case "PersonnelReason":
            return disruption.PersonnelReason;
        case "MiscellaneousReason":
            return disruption.MiscellaneousReason;
    }
};

const disruptionsAndConsequences =
    parsedJson.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement.map((item): DisruptionInfo => {
        return {
            disruptionId: item.SituationNumber,
            disruptionReason: getDisruptionReason(item),
            disruptionType: item.Planned ? "planned" : "unplanned",
            associatedLink: item.InfoLinks?.InfoLink[0].Uri,
            description: item.Description,
            displayId: cryptoRandomString({ length: 6 }),
            //TODO dynamo query
            orgId: {},
            summary: item.Summary,
        };
    });

console.log(util.inspect(parsedJson, false, null));
