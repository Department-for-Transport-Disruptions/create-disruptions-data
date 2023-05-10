import "../styles/globals.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import { useEffect } from "react";
import Header from "../components/layout/Header";
import type { Session } from "../schemas/session.schema";
import { getCsrfToken } from "../utils";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

declare global {
    interface Window {
        GOVUKFrontend: {
            // eslint-disable-next-line @typescript-eslint/ban-types
            initAll: Function;
        };
    }
}

type ExtendedAppProps = {
    csrfToken: string;
    session: Session | null;
};

const CustomApp = ({ Component, pageProps, csrfToken, session }: AppProps & ExtendedAppProps) => {
    useEffect(() => {
        document.getElementsByTagName("body")[0].classList.add("js-enabled");
    });

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
