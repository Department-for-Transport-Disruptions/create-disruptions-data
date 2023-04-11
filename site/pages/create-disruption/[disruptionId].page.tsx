import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import CreateDisruptionBase, { DisruptionPageProps } from "./index.page";
import { COOKIES_DISRUPTION_ERRORS } from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { createDisruptionSchema } from "../../schemas/create-disruption.schema";
import { getPageState } from "../../utils/apiUtils";

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DisruptionPageProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_DISRUPTION_ERRORS];

    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");

    if (!disruption) {
        return {
            props: {
                inputs: {},
                errors: [],
            },
        };
    }

    return {
        props: {
            ...getPageState(
                errorCookie,
                createDisruptionSchema,
                ctx.query.disruptionId?.toString(),
                disruption.disruptionInfo,
            ),
        },
    };
};

export default CreateDisruptionBase;
