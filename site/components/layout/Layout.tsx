import Head from "next/head";
import React, { PropsWithChildren, ReactElement } from "react";
import Help from "../Help";
import { ErrorInfo } from "../../interfaces";
import { buildTitle } from "../../utils";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";

interface LayoutProps {
    title: string;
    description: string;
    errors?: ErrorInfo[];
    hideCookieBanner?: boolean;
    hideHelp?: boolean;
}

export const BaseLayout = ({
    title,
    description,
    errors = [],
    children,
    hideHelp,
}: PropsWithChildren<LayoutProps>): ReactElement => {
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <title>{buildTitle(errors, title || "Create Disruptions")}</title>
                <meta name="description" content={description || "Create Disruptions"} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta charSet="utf-8" />
            </Head>

            <PhaseBanner />

            <div className="govuk-width-container">
                <main className="govuk-main-wrapper">{children}</main>
                {!hideHelp && <Help />}
            </div>
            <Footer />
        </>
    );
};

export const FullColumnLayout = ({
    title,
    description,
    errors = [],
    children,
    hideHelp = false,
}: PropsWithChildren<LayoutProps>): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} hideHelp={hideHelp}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">{children}</div>
        </div>
    </BaseLayout>
);

export const TwoThirdsLayout = ({
    title,
    description,
    errors = [],
    children,
    hideHelp = false,
}: PropsWithChildren<LayoutProps>): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} hideHelp={hideHelp}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">{children}</div>
        </div>
    </BaseLayout>
);

export default TwoThirdsLayout;
