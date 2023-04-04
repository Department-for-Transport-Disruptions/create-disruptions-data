/* eslint-disable no-console */
import "../styles/globals.scss";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import { useEffect } from "react";
import { ServerResponse } from "http";
import { getCsrfToken } from "../utils";

declare global {
    interface Window {
        GOVUKFrontend: {
            // eslint-disable-next-line @typescript-eslint/ban-types
            initAll: Function;
        };
    }
}

type ExtendedAppProps = {
    pageResponse?: ServerResponse;
};

const CustomApp = ({ Component, pageProps, pageResponse }: AppProps & ExtendedAppProps) => {
    useEffect(() => {
        document.getElementsByTagName("body")[0].classList.add("js-enabled");
    });

    console.log(pageResponse);

    const csrfToken = getCsrfToken(pageResponse);

    return <Component {...pageProps} csrfToken={csrfToken} />;
};

CustomApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps & ExtendedAppProps> => {
    const ctx = await App.getInitialProps(context);

    console.log(ctx);

    return { ...ctx, pageResponse: context.ctx.res };
};

export default CustomApp;
