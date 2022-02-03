const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/sdk.js",
  externals: ["axios"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "sdk.js",
    library: "VerstkaSDK",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: ["last 2 version"],
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
