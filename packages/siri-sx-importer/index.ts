import { BasePtSituationElement, PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { siriSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { parseString } from "xml2js";
import { parseBooleans } from "xml2js/lib/processors";
import { promises as fs } from "fs";
import * as util from "util";

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

//Console log below to inspect the SIRI data when converted to XML
// console.log(util.inspect(parsedXml().parsedXml.Siri, false, 7));

const parsedSiri: PtSituationElement[] =
    parsedXml().parsedXml.Siri.ServiceDelivery.SituationExchangeDelivery.Situations.PtSituationElement;

const myNewObject = parsedSiri.map((element) => {
    if (Array.isArray(element.ValidityPeriod)) {
        return element;
    }
    if (!!element.Consequences && Array.isArray(element.Consequences.Consequence)) {
        return element;
    }

    if (!!element.Consequences) {
        return {
            ...element,
            ValidityPeriod: [element.ValidityPeriod],
            Consequences: {
                Consequence: [element.Consequences.Consequence],
            },
        };
    }
});

console.log(util.inspect(myNewObject, false, null));

// const parsedJson = siriSchema.parse(parseXml().parsedXml.Siri);
