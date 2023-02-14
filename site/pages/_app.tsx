import "styles/globals.scss";
import type { AppProps } from "next/app";
import { useEffect } from "react";

declare global {
    interface Window {
        GOVUKFrontend: {
            // eslint-disable-next-line @typescript-eslint/ban-types
            initAll: Function;
        };
    }
}

const App = ({ Component, pageProps }: AppProps) => {
    useEffect(() => {
        document.getElementsByTagName("body")[0].classList.add("js-enabled");

        if (window.GOVUKFrontend) {
            window.GOVUKFrontend.initAll();
        }
    });

    return <Component {...pageProps} />;
};

export default App;
