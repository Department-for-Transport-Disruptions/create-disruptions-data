import "../styles/globals.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import { useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import type { Session } from "../schemas/session.schema";
import { getCsrfToken } from "../utils";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { initAll } from "govuk-frontend";

config.autoAddCss = false;

declare global {
    interface Window {
        GOVUKFrontend: {
            initAll: () => void;
        };
    }
}

type ExtendedAppProps = {
    csrfToken: string;
    session: Session | null;
};

const CustomApp = ({ Component, pageProps, csrfToken, session }: AppProps & ExtendedAppProps) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
    
            const bodyElement = document.getElementsByTagName("body")[0];
            bodyElement.classList.add("js-enabled");
    
            if ("noModule" in HTMLScriptElement.prototype) {
                bodyElement.classList.add("govuk-frontend-supported");
            }
    
            initAll();
        }
    }, []);

    return (
        <>
            <Header session={session} csrfToken={csrfToken} />
            <Component {...pageProps} csrfToken={csrfToken} session={session} />
        </>
    );
};

CustomApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps & ExtendedAppProps> => {
    const ctx = await App.getInitialProps(context);
    const { getSession } = await import("../utils/apiUtils/auth");
    let session: Session | null = null;

    if (context.ctx.req) {
        session = getSession(context.ctx.req);
    }

    return { ...ctx, csrfToken: getCsrfToken(context.ctx), session };
};

export default CustomApp;
