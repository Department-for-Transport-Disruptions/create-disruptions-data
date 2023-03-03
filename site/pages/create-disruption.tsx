import React, { ReactElement } from "react";
import { DisruptionInfo } from "interfaces";
import { DisruptionsDateTimeInfo } from "components/DisruptionDateTimeInfo";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS } from "../constants/index";

DISRUPTION_REASONS;
const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: DisruptionInfo;
}

const getReasonOptions = (): JSX.Element[] => {
    const options: JSX.Element[] = [
        <option value="" disabled>
            Choose a reason
        </option>,
    ];

    DISRUPTION_REASONS.forEach((reasonType) => {
        options.push(
            <option value={reasonType.value} key={reasonType.value}>
                {reasonType.reason}
            </option>,
        );
    });

    return options;
};

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createDisruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new Disruption</h1>

                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-!-padding-top-2">
                                    <span className="govuk-heading-s govuk-!-margin-bottom-0" id="disruption-type">
                                        Type of disruption
                                    </span>
                                </legend>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-planned"
                                        name="disruptionType"
                                        type="radio"
                                        value="Planned"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="disruption-planned">
                                        Planned
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-unplanned"
                                        name="disruptionType"
                                        type="radio"
                                        value="Unplanned"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="disruption-unplanned">
                                        Unplanned
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label govuk-label--s" htmlFor="summary">
                                Summary
                            </label>
                            <input className="govuk-input w-3/4" id="summary" name="summary" type="text" />
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label govuk-label--s" htmlFor="description">
                                Description
                            </label>
                            <textarea className="govuk-textarea w-3/4" id="description" name="description" rows={5} />
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label govuk-label--s" htmlFor="associated-link">
                                Associated Link
                            </label>
                            <input
                                className="govuk-input w-3/4"
                                id="associated-link"
                                name="associatedLink"
                                type="text"
                            />
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label govuk-label--s" htmlFor="Distruption-reason">
                                Reason for disruption
                            </label>
                            <select
                                className="govuk-select w-3/4"
                                id="disruption-reason"
                                name="disruptionReason"
                                defaultValue=""
                            >
                                {getReasonOptions()}
                            </select>
                        </div>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-6">
                        <h2 className="govuk-heading-l">When is the disruption?</h2>

                        <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity />
                        <fieldset className="govuk-fieldset">
                            <legend
                                className="govuk-fieldset__legend govuk-!-padding-top-6"
                                id="disruption-repeat-hint"
                            >
                                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
                                    Does this disruption repeat?
                                </h3>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-repeats"
                                        name="disruptionRepeats"
                                        type="radio"
                                        value="yes"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="disruption-repeats">
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-does-not-repeat"
                                        name="disruptionRepeats"
                                        type="radio"
                                        value="no"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="disruption-does-not-repeat"
                                    >
                                        No
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-6">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity={false} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = (): { props: object } => {
    const inputs: DisruptionInfo = {
        validityStartDate: "",
        validityEndDate: "",
        validityStartTime: "",
        validityEndTime: "",
        publishStartDate: "",
        publishEndDate: "",
        publishStartTime: "",
        publishEndTime: "",
    };

    return {
        props: { inputs },
    };
};

export default CreateDisruption;
