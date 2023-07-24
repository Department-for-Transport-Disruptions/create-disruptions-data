import Link from "next/link";

interface NotificationBannerProps {
    title?: string;
    content: string;
    linkText?: string;
    afterLinkText?: string;
}

const NotificationBanner = ({ title = "Important", content, linkText, afterLinkText }: NotificationBannerProps) => (
    <div
        className="govuk-notification-banner"
        role="region"
        aria-labelledby="govuk-notification-banner-title"
        data-module="govuk-notification-banner"
    >
        <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                {title}
            </h2>
        </div>
        <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">
                {content}
                {linkText && (
                    <Link className="govuk-notification-banner__link" href="#">
                        {linkText}
                    </Link>
                )}
                {afterLinkText ? afterLinkText : ""}
            </p>
        </div>
    </div>
);

export default NotificationBanner;
