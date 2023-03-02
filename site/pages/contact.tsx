import Link from "next/link";
import { ReactElement } from "react";
import { BaseLayout } from "../components/layout/Layout";
import { SUPPORT_EMAIL_ADDRESS, SUPPORT_PHONE_NUMBER } from "../constants";

const title = "Contact - Create Transport Disruption Data Service";
const description = "Contact page for the Create Transport Disruption Data Service";

const Contact = (): ReactElement => {
    return (
        <BaseLayout title={title} description={description} hideHelp>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <h1 className="govuk-heading-l">Contact the Create Transport Disruption Data Service team</h1>
                    <h2 className="govuk-heading-m">Feedback and support</h2>
                    <p className="govuk-body">
                        If you are experiencing technical issues, or if you have any suggestions, comments or
                        criticisms, please contact the Create Transport Disruption Data team through one of the channels
                        below.
                    </p>
                    <p className="govuk-body">
                        The Help Desk is available Monday to Friday, 9am to 5pm (excluding Bank Holidays in England and
                        Wales, and the 24th of December).
                    </p>
                    <p className="govuk-body">The Help Desk can be contacted by telephone or email as follows.</p>
                    <p className="govuk-body">
                        Telephone: {SUPPORT_PHONE_NUMBER}
                        <br />
                        Email:{" "}
                        <Link className="govuk-link" href={`mailto:${SUPPORT_EMAIL_ADDRESS}`}>
                            {SUPPORT_EMAIL_ADDRESS}
                        </Link>
                    </p>
                    <h3 className="govuk-heading-s">Related services</h3>
                    <p className="govuk-body">
                        If your query relates to the use of the Bus Open Data Service go&nbsp;
                        <Link href="/contact" aria-label="go to the bus open data service" className="underline">
                            here
                        </Link>
                        &nbsp;to view their contact details
                    </p>
                </div>
                <div className="govuk-grid-column-one-third">
                    <h2 className="govuk-heading-s">Create Transport Disruption Data Service</h2>
                    <p className="govuk-body">
                        Create Transport Disruption Data The Create Transport Disruption Data gives local transport
                        authorities and operators within England the ability to create disruptions for bus, light rail,
                        ferry and tram services Help documents
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
};

export default Contact;
