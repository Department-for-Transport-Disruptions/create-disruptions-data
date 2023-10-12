import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext, Redirect } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import DeleteDisruptionButton from "../../../components/buttons/DeleteDisruptionButton";
import CsrfForm from "../../../components/form/CsrfForm";
import ErrorSummary from "../../../components/form/ErrorSummary";
import Radios from "../../../components/form/Radios";
import { TwoThirdsLayout } from "../../../components/layout/Layout";
import {
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CONSEQUENCE_TYPES,
    DISRUPTION_NOT_FOUND_ERROR_PAGE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../../constants/index";
import { getDisruptionById } from "../../../data/dynamo";
import { PageState } from "../../../interfaces/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create Consequences";
const description = "Create Consequences page for the Create Transport Disruptions Service";

export interface ConsequenceTypePageProps extends PageState<Partial<ConsequenceType>> {}

const TypeOfConsequence = (props: ConsequenceTypePageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const queryParams = useRouter().query;
    const isTemplate = queryParams["template"]?.toString() ?? "";

    const returnPath =
        isTemplate || props.disruptionStatus === PublishStatus.published
            ? DISRUPTION_DETAIL_PAGE_PATH
            : REVIEW_DISRUPTION_PAGE_PATH;

    const isEditing =
        props.disruptionStatus === PublishStatus.editing ||
        props.disruptionStatus === PublishStatus.editPendingApproval ||
        props.disruptionStatus === PublishStatus.pendingAndEditing;

    const displayCancelButton = isEditing || props.inputs.consequenceType;

    return (
        <TwoThirdsLayout title={title} description={description} errors={props.errors}>
            <CsrfForm
                action={`/api/type-of-consequence${isTemplate ? "?template=true" : ""}`}
                method="post"
                csrfToken={props.csrfToken}
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>

                        <Radios<ConsequenceType>
                            display="Select consequence type"
                            radioDetail={CONSEQUENCE_TYPES}
                            inputName="consequenceType"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.consequenceType}
                            initialErrors={props.errors}
                            paddingTop={3}
                        />

                        <input type="hidden" name="disruptionId" value={props.disruptionId} />
                        <input type="hidden" name="consequenceIndex" value={props.consequenceIndex} />

                        <div className="govuk-button-group">
                            <button className="govuk-button" data-module="govuk-button">
                                Save and continue
                            </button>

                            {displayCancelButton ? (
                                <Link
                                    role="button"
                                    href={
                                        isTemplate
                                            ? `${returnPath}/${pageState.disruptionId || ""}?template=true`
                                            : `${returnPath}/${pageState.disruptionId || ""}`
                                    }
                                    className="govuk-button mt-8 ml-1 govuk-button--secondary"
                                >
                                    Cancel Changes
                                </Link>
                            ) : (
                                <></>
                            )}

                            <DeleteDisruptionButton
                                disruptionId={props.disruptionId}
                                csrfToken={props.csrfToken}
                                isTemplate={isTemplate}
                                returnPath={returnPath}
                            />
                        </div>
                    </div>
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: ConsequenceTypePageProps } | { redirect: Redirect } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_TYPE_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(
        ctx.query.disruptionId?.toString() ?? "",
        session.orgId,
        !!ctx.query.template,
    );

    if (!disruption) {
        return {
            redirect: {
                destination: `${DISRUPTION_NOT_FOUND_ERROR_PAGE}${!!ctx.query?.template ? "?template=true" : ""}`,
                statusCode: 302,
            },
        };
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_ERRORS, ctx.res);

    return {
        props: {
            ...getPageState(
                errorCookie,
                typeOfConsequenceSchema,
                ctx.query.disruptionId?.toString(),
                disruption?.consequences?.find((c) => c.consequenceIndex === index) ?? undefined,
            ),
            consequenceIndex: index,
            disruptionStatus: disruption.publishStatus,
        },
    };
};

export default TypeOfConsequence;
