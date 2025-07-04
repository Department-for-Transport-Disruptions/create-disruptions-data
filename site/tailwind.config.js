/** @type {import('tailwindcss').Config} */

const baseFontSize = 16;

module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    variants: {
        extend: {
            display: ["group-hover"],
        },
    },
    theme: {
        extend: {
            screens: {
                xs: "360px",
            },
            colors: {
                govBlue: "#1d70b8",
                govYellow: "#ffdd00",
                backgroundGrey: "#f3f2f1",
                focusText: "#0b0c0c",
                hoverBlue: "#003078",
                govGreen: "#00703c",
                govRed: "#d4351c",
                markerActive: "#278C2B",
                markerDefault: "grey",
                white: "#ffffff",
            },
            borderWidth: {
                DEFAULT: "1px",
                3: "3px",
                10: "10px",
            },
            width: {
                "1/10": "10%",
            },
            spacing: () => ({
                ...Array.from({ length: 96 }, (_, index) => index * 0.5)
                    .filter((i) => i)
                    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                    .reduce((acc, i) => ({ ...acc, [i]: `${i / (baseFontSize / 4)}rem` }), {}),
            }),
            fontSize: {
                arrow: "0.5em",
                xs: [
                    `${(16 * 0.75) / baseFontSize}rem` /* 12px */,
                    {
                        lineHeight: `${(16 * 1) / baseFontSize}rem` /* 16px */,
                    },
                ],
                sm: [
                    `${(16 * 0.875) / baseFontSize}rem` /* 14px */,
                    {
                        lineHeight: `${(16 * 1.25) / baseFontSize}rem` /* 20px */,
                    },
                ],
                base: [
                    `${(16 * 1) / baseFontSize}rem` /* 16px */,
                    {
                        lineHeight: `${(16 * 1.5) / baseFontSize}rem` /* 24px */,
                    },
                ],
                lg: [
                    `${(16 * 1.125) / baseFontSize}rem` /* 18px */,
                    {
                        lineHeight: `${(16 * 1.75) / baseFontSize}rem` /* 28px */,
                    },
                ],
                xl: [
                    `${(16 * 1.25) / baseFontSize}rem` /* 20px */,
                    {
                        lineHeight: `${(16 * 1.75) / baseFontSize}rem` /* 28px */,
                    },
                ],
                "2xl": [
                    `${(16 * 1.5) / baseFontSize}rem` /* 24px */,
                    {
                        ineHeight: `${(16 * 2) / baseFontSize}rem` /* 32px */,
                    },
                ],
                "3xl": [
                    `${(16 * 1.875) / baseFontSize}rem` /* 30px */,
                    {
                        lineHeight: `${(16 * 2.25) / baseFontSize}rem` /* 36px */,
                    },
                ],
                "4xl": [
                    `${(16 * 2.25) / baseFontSize}rem` /* 36px */,
                    {
                        lineHeight: `${(16 * 2.5) / baseFontSize}rem` /* 40px */,
                    },
                ],
                "5xl": [
                    `${(16 * 3) / baseFontSize}rem` /* 48px */,
                    {
                        lineHeight: (16 * 1) / baseFontSize,
                    },
                ],
                "6xl": [
                    `${(16 * 3.75) / baseFontSize}rem` /* 60px */,
                    {
                        lineHeight: (16 * 1) / baseFontSize,
                    },
                ],
                "7xl": [
                    `${(16 * 4.5) / baseFontSize}rem` /* 72px */,
                    {
                        lineHeight: (16 * 1) / baseFontSize,
                    },
                ],
                "8xl": [
                    `${(16 * 6) / baseFontSize}rem` /* 96px */,
                    {
                        lineHeight: (16 * 1) / baseFontSize,
                    },
                ],
                "9xl": [
                    `${(16 * 8) / baseFontSize}rem` /* 128px */,
                    {
                        lineHeight: (16 * 1) / baseFontSize,
                    },
                ],
            },
        },
    },
    plugins: [],
};
