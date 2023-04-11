import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import CreateConsequenceNetwork from "./index.page";
import { COOKIES_CONSEQUENCE_NETWORK_ERRORS, COOKIES_CONSEQUENCE_TYPE_INFO } from "../../../constants";
import { NetworkConsequence, networkConsequenceSchema } from "../../../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { getPageState } from "../../../utils/apiUtils";

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
    let previousConsequenceInformationData = {};

    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_NETWORK_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    const pageState = getPageState<NetworkConsequence>(errorCookie, networkConsequenceSchema);

    return { props: { ...pageState, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceNetwork;
