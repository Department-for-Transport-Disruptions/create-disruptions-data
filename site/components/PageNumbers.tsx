/* eslint-disable jsx-a11y/anchor-is-valid */
import { Dispatch, ReactElement, SetStateAction } from "react";

interface PageNumbersProps {
    currentPage: number;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    numberOfPages: number;
}

const createPageNumbers = (
    numberOfPages: number,
    currentPage: number,
    setCurrentPage: Dispatch<SetStateAction<number>>,
) => {
    if (numberOfPages < 10) {
        const pageNumbers = [];

        for (let count = 0; count < numberOfPages; count++) {
            pageNumbers.push(
                <li
                    key={`page-${count + 1}`}
                    className={`govuk-pagination__item${
                        count + 1 === currentPage ? " govuk-pagination__item--current" : ""
                    }`}
                >
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(count + 1);
                        }}
                        className="govuk-link govuk-pagination__link"
                        href="#"
                        aria-label={`Page ${count + 1}`}
                    >
                        {count + 1}
                    </a>
                </li>,
            );
        }

        return pageNumbers;
    }

    if (currentPage === 1) {
        return [
            <li className="govuk-pagination__item govuk-pagination__item--current" key="page-1">
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(1);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label="Page 1"
                >
                    1
                </a>
            </li>,
            <li className="govuk-pagination__item" key="page-2">
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(2);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label="Page 2"
                >
                    2
                </a>
            </li>,
            <li className="govuk-pagination__item govuk-pagination__item--ellipses" key="ellipses-1">
                ...
            </li>,
            <li className="govuk-pagination__item" key={`page-${numberOfPages}`}>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(numberOfPages);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label={`Page ${numberOfPages}`}
                >
                    {numberOfPages}
                </a>
            </li>,
        ];
    }

    if (currentPage === numberOfPages) {
        return [
            <li className="govuk-pagination__item" key="page-1">
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(1);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label="Page 1"
                >
                    1
                </a>
            </li>,
            <li className="govuk-pagination__item govuk-pagination__item--ellipses" key="ellipses-1">
                ...
            </li>,
            <li className="govuk-pagination__item" key={`page-${numberOfPages - 1}`}>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(numberOfPages - 1);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label={`Page ${numberOfPages - 1}`}
                >
                    {numberOfPages - 1}
                </a>
            </li>,
            <li className="govuk-pagination__item govuk-pagination__item--current" key={`page-${numberOfPages}`}>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(numberOfPages);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label={`Page ${numberOfPages}`}
                >
                    {numberOfPages}
                </a>
            </li>,
        ];
    }

    const pageNumbers = [
        currentPage - 1 !== 1 ? (
            <li className="govuk-pagination__item" key="page-1">
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(1);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label="Page 1"
                >
                    1
                </a>
            </li>
        ) : (
            []
        ),
        currentPage !== 2 ? (
            <li className="govuk-pagination__item govuk-pagination__item--ellipses" key="ellipses-1">
                ...
            </li>
        ) : (
            []
        ),
        <li className="govuk-pagination__item" key={`page-${currentPage - 1}`}>
            <a
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage - 1);
                }}
                className="govuk-link govuk-pagination__link"
                href="#"
                aria-label={`Page ${currentPage - 1}`}
            >
                {currentPage - 1}
            </a>
        </li>,
        <li className="govuk-pagination__item govuk-pagination__item--current" key={`page-${currentPage}`}>
            <a
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage);
                }}
                className="govuk-link govuk-pagination__link"
                href="#"
                aria-label={`Page ${currentPage}`}
            >
                {currentPage}
            </a>
        </li>,
        <li className="govuk-pagination__item" key={`page-${currentPage + 1}`}>
            <a
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage + 1);
                }}
                className="govuk-link govuk-pagination__link"
                href="#"
                aria-label={`Page ${currentPage + 1}`}
            >
                {currentPage + 1}
            </a>
        </li>,
        currentPage !== numberOfPages - 1 ? (
            <li className="govuk-pagination__item govuk-pagination__item--ellipses" key="ellipses-2">
                ...
            </li>
        ) : (
            []
        ),
        currentPage + 1 !== numberOfPages ? (
            <li className="govuk-pagination__item" key={`page-${numberOfPages}`}>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(numberOfPages);
                    }}
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label={`Page ${numberOfPages}`}
                >
                    {numberOfPages}
                </a>
            </li>
        ) : (
            []
        ),
    ];

    return pageNumbers;
};

const PageNumbers = ({ currentPage, numberOfPages, setCurrentPage }: PageNumbersProps): ReactElement =>
    numberOfPages === 0 ? (
        <></>
    ) : (
        <nav className="govuk-pagination" role="navigation">
            {currentPage !== 1 ? (
                <div className="govuk-pagination__prev">
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(currentPage - 1);
                        }}
                        className="govuk-link govuk-pagination__link"
                        href=""
                        rel="prev"
                    >
                        <svg
                            className="govuk-pagination__icon govuk-pagination__icon--prev"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                        >
                            <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
                        </svg>
                        <span className="govuk-pagination__link-title">Previous</span>
                    </a>
                </div>
            ) : null}

            <ul className="govuk-pagination__list"> {createPageNumbers(numberOfPages, currentPage, setCurrentPage)}</ul>
            {currentPage !== numberOfPages ? (
                <div className="govuk-pagination__next">
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(currentPage + 1);
                        }}
                        className="govuk-link govuk-pagination__link"
                        href=""
                        rel="next"
                    >
                        <span className="govuk-pagination__link-title">Next</span>{" "}
                        <svg
                            className="govuk-pagination__icon govuk-pagination__icon--next"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                        >
                            <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                        </svg>
                    </a>
                </div>
            ) : null}
        </nav>
    );
export default PageNumbers;
