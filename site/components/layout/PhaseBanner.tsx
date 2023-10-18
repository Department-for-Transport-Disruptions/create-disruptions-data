import Link from "next/link";
import { ReactElement } from "react";

const PhaseBanner = (): ReactElement => (
    <div className="app-phase-banner__wrapper">
        <div className="govuk-phase-banner max-w-[960px] w-[90%] border-0 mx-auto app-phase-banner app-width-container">
            <p className="govuk-phase-banner__content">
                <strong className="govuk-tag govuk-phase-banner__content__tag">beta</strong>
                <span className="govuk-phase-banner__text">
                    This is a new service – your{" "}
                    <Link className="govuk-link" id="feedback-link" href="/feedback">
                        feedback
                    </Link>{" "}
                    will help us to improve it.
                </span>
            </p>
        </div>
    </div>
);

export default PhaseBanner;
