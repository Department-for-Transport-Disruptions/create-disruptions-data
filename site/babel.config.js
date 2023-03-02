module.exports = (api) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
