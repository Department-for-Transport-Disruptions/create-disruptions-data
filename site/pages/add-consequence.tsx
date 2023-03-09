import TwoThirdsLayout from "components/layout/Layout";
import { InputInfo, ErrorInfo } from "interfaces";
import { ReactElement } from "react";
import Radios from "../components/form/Radios";
import { COOKIES_ADD_CONSEQUENCE_ERRORS, COOKIES_ADD_CONSEQUENCE_INFO } from "../constants/index";
import { destroyCookie, parseCookies } from "nookies";
import { NextPageContext } from "next";

interface AddConsequenceWithErrors {
    errors: ErrorInfo[];
    inputs: AddConsequenceProps;
}

export interface AddConsequenceProps {
    modeOfTransport?: TransportMode;
    consequenceType?: ConsequenceType;
}

enum TransportMode {
    bus = "Bus",
    tram = "Tram",
    ferry = "Ferry",
    train = "Train",
}

enum ConsequenceType {
    services = "Services",
    networkWide = "Network Wide",
    operatorWide = "Operator Wide",
    stops = "Stops",
}

const title = "Add a Consequence";
const description = "Page to add a consequnce by choosing its type and mode of transport";

const modeOfTransportRadio: InputInfo[] = [
    {
        id: "transport-mode-bus",
        name: "modeOfTransport",
        value: "bus",
        display: TransportMode.bus,
    },
    {
        id: "transport-mode-tram",
        name: "modeOfTransport",
        value: "tram",
        display: TransportMode.tram,
    },
    {
        id: "transport-mode-ferry",
        name: "modeOfTransport",
        value: "ferry",
        display: TransportMode.ferry,
    },
    {
        id: "transport-mode-train",
        name: "modeOfTransport",
        value: "train",
        display: TransportMode.train,
    },
];

const consequenceType: InputInfo[] = [
    {
        id: "consequence-type-services",
        name: "consequenceType",
        value: "services",
        display: ConsequenceType.services,
    },
    {
        id: "transport-mode-network-wide",
        name: "consequenceType",
        value: "networkWide",
        display: ConsequenceType.networkWide,
    },
    {
        id: "transport-mode-operator-wide",
        name: "consequenceType",
        value: "operatorWide",
        display: ConsequenceType.operatorWide,
    },
    {
        id: "transport-mode-operator-stops",
        name: "consequenceType",
        value: "stops",
        display: ConsequenceType.stops,
    },
];

const addConsequence = ({ inputs, errors = [] }: AddConsequenceWithErrors): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <form action="/api/add-consequence" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>

                        <Radios heading="Select mode of Transport" errors={errors} inputInfo={modeOfTransportRadio} />
                        <Radios
                            heading="Select consequence type"
                            errors={errors}
                            inputInfo={consequenceType}
                            paddingTop={3}
                        />

                        <div className="govuk-button-group">
                            <button className="govuk-button" data-module="govuk-button">
                                Save and continue
                            </button>
                            <button className="govuk-button govuk-button--secondary" data-module="govuk-button">
                                Save as draft
                            </button>
                        </div>
                    </div>
                </>
            </form>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: AddConsequenceWithErrors } => {
    let errors: ErrorInfo[] = [];
    let inputs: AddConsequenceProps = {};

    const cookies = parseCookies(ctx);

    const disruptionInfo = cookies[COOKIES_ADD_CONSEQUENCE_INFO];

    if (disruptionInfo) {
        inputs = JSON.parse(cookies[COOKIES_ADD_CONSEQUENCE_INFO]) as AddConsequenceProps;
        destroyCookie(ctx, COOKIES_ADD_CONSEQUENCE_INFO);
    }

    const errorInfo = cookies[COOKIES_ADD_CONSEQUENCE_ERRORS];

    if (errorInfo) {
        errors = JSON.parse(cookies[COOKIES_ADD_CONSEQUENCE_ERRORS]) as ErrorInfo[];
        destroyCookie(ctx, COOKIES_ADD_CONSEQUENCE_ERRORS);
    }

    return { props: { inputs, errors } };
};

export default addConsequence;
