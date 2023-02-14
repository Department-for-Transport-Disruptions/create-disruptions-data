import Footer from "components/layout/Footer";
import Head from "next/head";

const Home = () => {
    return (
        <>
            <Head>
                <title>Create Disruptions Data</title>
                <meta
                    name="description"
                    content="Create Disruptions Data is a service that allows you to generate disruptions data in SIRI-SX format"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Footer />
        </>
    );
};

export const getServerSideProps = (): { props: object } => ({
    props: {},
});

export default Home;
