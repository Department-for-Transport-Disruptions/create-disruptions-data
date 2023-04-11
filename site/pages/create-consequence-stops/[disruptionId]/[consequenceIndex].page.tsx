import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import CreateConsequenceStops, { CreateConsequenceStopsProps } from "./index.page";
import {
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../../constants";
import { StopsConsequence, stopsConsequenceSchema } from "../../../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { redirectTo } from "../../../utils";
import { getPageState } from "../../../utils/apiUtils";

export const getServerSideProps = (ctx: NextPageContext): { props: CreateConsequenceStopsProps } | void => {
    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_STOPS_ERRORS];

    if (!typeCookie && ctx.res) {
        if (ctx.res) {
            redirectTo(ctx.res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
        }

        return;
    }

    const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

    if (!previousConsequenceInformation.success) {
        if (ctx.res) {
            redirectTo(ctx.res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
        }

        return;
    }

    const pageState = getPageState<StopsConsequence>(errorCookie, stopsConsequenceSchema);

    return {
        props: { ...pageState, previousConsequenceInformation: previousConsequenceInformation.data },
    };
};

export default CreateConsequenceStops;
