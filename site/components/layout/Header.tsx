import { faAngleDown, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { ReactElement } from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { LOGIN_PAGE_PATH } from "../../constants";
import { Session } from "../../schemas/session.schema";
import CsrfForm from "../form/CsrfForm";

interface HeaderProps {
    session: Session | null;
    csrfToken: string;
}

const Header = ({ session, csrfToken }: HeaderProps): ReactElement => {
    const isAdmin = session?.isSystemAdmin || session?.isOrgAdmin;
    const { buttonProps, itemProps, isOpen } = useDropdownMenu(isAdmin ? 3 : 2);

    return (
        <header className="govuk-header border-b-10 border-govBlue" role="banner" data-module="govuk-header">
            <div className="govuk-header__container mb-0 border-b-0 govuk-width-container">
                <div className="govuk-header__logo">
                    <Link href="https://www.gov.uk/" className="govuk-header__link govuk-header__link--homepage">
                        <span className="govuk-header__logotype">
                            <svg
                                role="presentation"
                                focusable="false"
                                className="govuk-header__logotype-crown inline"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 132 97"
                                height="30"
                                width="36"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
                                />
                            </svg>
                            <span className="govuk-header__logotype-text pl-1">GOV.UK</span>
                        </span>
                    </Link>
                </div>

                <div className="govuk-header__content max-[950px]:float-none max-[950px]:pl-0">
                    <Link href="/" id="title-link" className="govuk-header__link govuk-header__link--service-name">
                        Create Transport Disruption Data
                    </Link>
                </div>

                <div className="govuk-header__account-link mt-2.5 mb-5 xs:m-0 xs:absolute xs:right-0 xs:top-1/2 xs:w-80 xs:text-right xs:-translate-y-1/2">
                    {session ? (
                        <>
                            <div className="group govuk-header__link mr-1.5 overflow-hidden float-right">
                                <button
                                    className="text-white px-5 py-2 m-0 focus:outline-govYellow focus:bg-govYellow focus:text-focusText"
                                    {...buttonProps}
                                >
                                    <FontAwesomeIcon className="mr-2" icon={faUser} />
                                    <strong>My Account</strong>
                                    <FontAwesomeIcon className="ml-2" icon={faAngleDown} />
                                </button>
                                <div
                                    className={`absolute bg-white min-w-max shadow-md z-10 px-0.5 group-hover:block group-focus:block ${
                                        isOpen ? "visible" : "invisible"
                                    }`}
                                    role="menu"
                                >
                                    <Link
                                        className="float-none text-black text-left px-5 block hover:bg-slate-100 py-2 focus:text-focusText focus:bg-govYellow focus:outline-govYellow"
                                        href="/account-settings"
                                        {...itemProps[0]}
                                    >
                                        Account settings
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            className="float-none text-black text-left px-5 block hover:bg-slate-100 py-2 focus:text-focusText focus:bg-govYellow focus:outline-govYellow"
                                            href="/user-management"
                                            {...itemProps[2]}
                                        >
                                            User management
                                        </Link>
                                    )}
                                    <CsrfForm action="/api/sign-out" method="post" csrfToken={csrfToken}>
                                        <button
                                            className="float-none text-black text-left px-5 w-full block hover:bg-slate-100 py-2 focus:text-focusText focus:bg-govYellow focus:outline-govYellow"
                                            {...(itemProps[1] as object)}
                                        >
                                            Sign out
                                        </button>
                                    </CsrfForm>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link href={LOGIN_PAGE_PATH} className="govuk-header__link">
                            <span> {"Sign in"} </span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
