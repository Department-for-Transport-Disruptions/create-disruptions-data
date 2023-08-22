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

console.log(util.inspect(parsedJson, false, null));
