import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { z } from "zod";
import CreateConsequenceServices, { CreateConsequenceServicesProps, fetchStops } from "./index.page";
import {
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    API_BASE_URL,
    ADMIN_AREA_CODE,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../../constants";
import {
    Stop,
    ServicesConsequence,
    Service,
    serviceSchema,
    servicesConsequenceSchema,
} from "../../../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { redirectTo } from "../../../utils";
import { getPageState } from "../../../utils/apiUtils";

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: CreateConsequenceServicesProps } | void> => {
    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_SERVICES_ERRORS];

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

    const previousConsequenceInformationData = previousConsequenceInformation.data;

    const pageState = getPageState<ServicesConsequence>(errorCookie, servicesConsequenceSchema);

    let services: Service[] = [];
    const searchApiUrl = `${API_BASE_URL}services?adminAreaCodes=${ADMIN_AREA_CODE}`;
    const res = await fetch(searchApiUrl, { method: "GET" });
    const parse = z.array(serviceSchema).safeParse(await res.json());

    if (parse.success) {
        services = parse.data;
    }

    let stops: Stop[] = [];

    if (pageState.inputs.services) {
        const stopPromises = pageState.inputs.services.map((service) => fetchStops(service.id));
        stops = (await Promise.all(stopPromises)).flat();
    }

    return {
        props: {
            ...pageState,
            previousConsequenceInformation: previousConsequenceInformationData,
            initialServices: services,
            initialStops: stops,
        },
    };
};

export default CreateConsequenceServices;
