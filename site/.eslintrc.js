module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        "next",
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:prettier/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "eslint-config-prettier",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: `./tsconfig.json`,
    },
    plugins: ["react", "@typescript-eslint", "jsx-a11y", "vitest"],
    rules: {
        "@typescript-eslint/triple-slash-reference": 0,
        "no-console": "error",
        "@typescript-eslint/no-empty-interface": 0,
        "no-return-await": "off",
        "@typescript-eslint/return-await": "error",
        indent: [
            0,
            4,
            {
                ignoredNodes: [
                    "JSXElement",
                    "JSXElement > *",
                    "JSXAttribute",
                    "JSXIdentifier",
                    "JSXNamespacedName",
                    "JSXMemberExpression",
                    "JSXSpreadAttribute",
                    "JSXExpressionContainer",
                    "JSXOpeningElement",
                    "JSXClosingElement",
                    "JSXText",
                    "JSXEmptyExpression",
                    "JSXSpreadChild",
                ],
                SwitchCase: 1,
            },
        ],
    },
    settings: {
        react: {
            version: "detect",
        },
        next: {
            rootDir: "site",
        },
    },
};
