/* eslint-disable no-console */
import "../styles/globals.scss";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import { useEffect } from "react";
import { inspect } from "util";
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
    csrfToken?: string;
};

const CustomApp = ({ Component, pageProps, csrfToken }: AppProps & ExtendedAppProps) => {
    useEffect(() => {
        document.getElementsByTagName("body")[0].classList.add("js-enabled");
    });

    console.log(csrfToken);

    return <Component {...pageProps} csrfToken={csrfToken} />;
};

CustomApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps & ExtendedAppProps> => {
    const ctx = await App.getInitialProps(context);

    console.log(inspect(context, false, null, true));

    return { ...ctx, csrfToken: getCsrfToken(context.ctx) };
};

export default CustomApp;
