import { ReactElement } from "react";
import { TwoThirdsLayout } from "../components/layout/Layout";

const title = "Changelog - Create Transport Disruption Data Service";
const description = "Changelog page for the Create Transport Disruption Data Service";

const Changelog = (): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Service Changelog</h1>
            <p className="govuk-body">Last updated: 17 December 2024</p>
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
            <h2 className="govuk-heading-l">December 2024 (1.63.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Addition of BCS and BCQ stop types when creating stop consequences</li>
                <li>A fix for exporting disruptions data to PDF</li>{" "}
            </ul>
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
            <h2 className="govuk-heading-l">November 2024 (1.62.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Update to site password policy</li>
                <li>A fix on the disruption detail page to allow the delete social media pop up to show</li>{" "}
            </ul>
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
            <h2 className="govuk-heading-l">October 2024 (1.61.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Service changelog page.</li>
                <li>Further updates to bring site up to WCAG 2.2AA standard.</li>{" "}
                <li>Additional guidance text within consequence pages.</li>{" "}
            </ul>
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
            <h2 className="govuk-heading-l">July 2024 (1.60.1)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Updated to WCAG 2.2AA standard.</li>{" "}
            </ul>
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
            <h2 className="govuk-heading-l">June 2024 (1.57.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>
                    Addition of <em>VersionedAtTime</em> in SIRI-SX output.
                </li>
                <li>
                    Addition of <em>AffectsPlace</em> group in SIRI-SX output including <em>PlaceRef</em>,{" "}
                    <em>PlaceName</em>, <em>PlaceCategory</em>.
                </li>
                <li>
                    Addition of <em>PublishedLineName</em> in SIRI-SX output.
                </li>
            </ul>{" "}
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />{" "}
            <h2 className="govuk-heading-l">May 2024 (1.56.0)</h2>
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Functionality to include an image in Nextdoor social media posts.</li>{" "}
                <li>Increase to the character limit for Nextdoor posts.</li>{" "}
                <li>Addition of London Underground as a mode (for TfL users only).</li>{" "}
            </ul>{" "}
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />{" "}
            <h2 className="govuk-heading-l">April 2024 (1.55.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                {" "}
                <li>Integration with Nextdoor social media platform.</li>{" "}
            </ul>{" "}
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />{" "}
            <h2 className="govuk-heading-l">March 2024 (1.54.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                {" "}
                <li>Email notifications for new Street Manager roadworks in your area.</li>{" "}
                <li>
                    Update to Account Settings for users to enable Street Manager new roadworks emails to be toggled
                    on/off.
                </li>{" "}
                <li>Email notifications for cancelled Street Manager roadworks.</li>{" "}
                <li>‘Remove all’ button for stops/services consequence pages.</li>{" "}
            </ul>{" "}
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />{" "}
            <h2 className="govuk-heading-l">February 2024 (1.53.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                {" "}
                <li>Street Manager map visual.</li>
                <li>Improvement to dashboard page performance.</li>{" "}
            </ul>{" "}
            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />{" "}
            <h2 className="govuk-heading-l">January 2024 (1.52.0)</h2>{" "}
            <p className="govuk-body">This release will deploy the following changes:</p>
            <ul className="govuk-list govuk-list--bullet">
                {" "}
                <li>Street Manager integration.</li>{" "}
                <li>Functionality to enable users to include images within Twitter posts.</li>{" "}
                <li>An additional filter for different data sources when within the “View all disruptions” page.</li>{" "}
                <li>
                    An update to search functionality for services consequence, text does not disappear so results can
                    easily be re-accessed.
                </li>{" "}
                <li>The addition of a back button to improve navigation through pages.</li>{" "}
                <li>
                    An extension to the reports within the tool, additional columns added, and date format updated to{" "}
                    <em>[DD/MM/YYYY]</em>.
                </li>{" "}
            </ul>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = () => {
    return { props: {} };
};

export default Changelog;
