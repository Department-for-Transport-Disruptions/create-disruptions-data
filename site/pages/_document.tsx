import Header from "components/layout/Header";
import crypto from "node:crypto";
import Document, { Html, Head, Main, NextScript, DocumentInitialProps, DocumentContext } from "next/document";
import { ReactElement } from "react";
import { v4 } from "uuid";

const generateCsp = (): { csp: string; nonce: string } => {
    const production = process.env.NODE_ENV === "production";

    const hash = crypto.createHash("sha256");
    hash.update(v4());
    const nonce = hash.digest("base64");

    const csp = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com ${
        production ? "" : "'unsafe-eval' 'unsafe-inline'"
    };
        frame-src 'self';
        base-uri 'self';
        block-all-mixed-content;
        font-src 'self' https: data:;
        img-src * 'self' data: https;
        object-src 'none';
        script-src-attr 'none';
        style-src 'self' ${production ? "" : "'unsafe-inline'"};
        upgrade-insecure-requests;
    `
        .replace(/\s{2,}/g, " ")
        .trim();

    return { csp, nonce };
};

interface DocumentProps extends DocumentInitialProps {
    nonce: string;
    isAuthed: boolean;
    csrfToken: string;
    url: string;
    showCookieBanner: boolean;
    allowTracking: boolean;
    noc: string | undefined;
}

export default class MyDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        const { csp, nonce } = generateCsp();
        const res = ctx?.res;

        if (res != null && !res.headersSent) {
            res.setHeader("Content-Security-Policy", csp);
        }

        return {
            ...initialProps,
            nonce,
        };
    }

    render(): ReactElement {
        const { nonce } = this.props;

        return (
            <Html lang="en" className="govuk-template bg-backgroundGrey">
                <Head nonce={nonce} />
                <body className="govuk-template__body">
                    <a href="#main-content" className="govuk-skip-link">
                        Skip to main content
                    </a>
                    <div id="js-cookie-banner" />

                    <Header isAuthed={this.props.isAuthed} csrfToken={this.props.csrfToken} noc={this.props.noc} />
                    <Main />
                    <NextScript nonce={nonce} />
                </body>
            </Html>
        );
    }
}
