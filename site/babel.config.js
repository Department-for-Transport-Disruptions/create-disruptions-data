module.exports = (api) =>
    api.env("test")
        ? {
              presets: [
                  ["@babel/preset-env", { targets: { node: "current" } }],
                  "@babel/preset-react",
                  "@babel/preset-typescript",
              ],
          }
        : {
              presets: ["next/babel"],
          };
