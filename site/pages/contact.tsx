import React, { ReactElement } from 'react';
import { BaseLayout } from '../components/layout/Layout'
import { SUPPORT_EMAIL_ADDRESS } from '../constants';
import { SUPPORT_PHONE_NUMBER } from '../constants';

const title = 'Contact - Create Fares Data Service';
const description = 'Contact page for the Create Fares Data Service';

interface ContactProps {
    supportEmail: string;
    supportPhone: string;
}

const Contact = ({ supportEmail, supportPhone }: ContactProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} hideHelp>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <h1 className="govuk-heading-l">Contact the Create Fares Data Service team</h1>
                    <h2 className="govuk-heading-m">Feedback and support</h2>
                    <p className="govuk-body">
                        If you are experiencing technical issues, or if you have any suggestions, comments or criticisms, please contact the Create Transport Disruptions Data team through one of the channels below.
                    </p>
                    <p className="govuk-body">
                        The Help Desk is available Monday to Friday, 9am to 5pm (excluding Bank Holidays in England and Wales, and the 24th of December).
                    </p>
                    <p className="govuk-body">The Help Desk can be contacted by telephone or email as follows.</p>
                    <p className="govuk-body">
                        Telephone: {supportPhone}
                        <br />
                        Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                    </p>
                    <h3 className="govuk-heading-s">Related services</h3>
                    <p className="govuk-body">
                        If your query relates to the use of the Bus Open Data Service go&nbsp;
                        <a href="/contact" aria-label="go to the bus open data service" className="underline">
                            here
                        </a>
                        &nbsp;to view their contact details
                    </p>
                </div>
                <div className="govuk-grid-column-one-third">
                    <h2 className="govuk-heading-s">Create Transport Disruption Data Service</h2>
                    <p className="govuk-body">
                        Create Transport Disruption Data
                        The Create Transport Disruption Data gives local transport authorities and operators within England the ability to create disruptions for bus, light rail, ferry and tram services
                        Help documents
                    </p>
                </div>
                <div className="govuk-grid-column-one-third">
                    <h2 className="govuk-heading-s">Help documents</h2>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (): {} => {
    return {
        props: {
            supportEmail: SUPPORT_EMAIL_ADDRESS || 'test@example.com',
            supportPhone: SUPPORT_PHONE_NUMBER || '0800 123 1234',
        },
    };
};

export default Contact;
