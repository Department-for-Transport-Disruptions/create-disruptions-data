/** @type {import('next').NextConfig} */

const securityHeaders = [
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "Referrer-Policy",
        value: "same-origin",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "X-XSS-Protection",
        value: "1; mode=block",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
];

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
    transpilePackages: ["@create-disruptions-data/shared-ts"],
    pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js", "api.tsx", "api.ts", "api.jsx", "api.js"],
};

module.exports = nextConfig;
