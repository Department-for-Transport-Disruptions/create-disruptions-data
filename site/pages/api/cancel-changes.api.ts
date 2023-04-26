import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_PATH } from "../../constants";
import { publishSchema } from "../../schemas/publish.schema";
import { redirectTo } from "../../utils/apiUtils";

const cancelChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    const validatedBody = publishSchema.safeParse(req.body);

    if (!validatedBody.success) {
        redirectTo(res, ERROR_PATH);
        return;
    }

    const disruptionId = validatedBody.data.disruptionId;
};

export default cancelChanges;
