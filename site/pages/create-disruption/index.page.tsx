import { NextPageContext } from "next";
import { randomUUID } from "crypto";
import CreateDisruption from "./[disruptionId].page";
import { CREATE_DISRUPTION_PAGE_PATH } from "../../constants";
import { redirectTo } from "../../utils";

export const getServerSideProps = (ctx: NextPageContext): void => {
    const disruptionId = randomUUID();

    if (ctx.res) {
        redirectTo(ctx.res, `${CREATE_DISRUPTION_PAGE_PATH}/${disruptionId}`);
        return;
    }
};

export default CreateDisruption;
