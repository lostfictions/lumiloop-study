/* eslint no-undef:2, no-unused-vars:1 */
// @ts-check
const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(/** @type {{[key: string]: any}} */ env) {
  /** @type {{[key: string]: any}} */
  let config = {
    mode: "development",
    target: "web",
    devtool: "cheap-module-eval-source-map",
    entry: [path.resolve(__dirname, "./src/index.tsx")],
    output: { filename: "bundle.js", path: path.resolve(__dirname, "./build") },
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.resolve(__dirname, "./tsconfig.json")
      }),
      new HtmlWebpackPlugin({
        title: "lumiloop study"
      })
    ],
    module: {
      rules: [
        // {
        //   test: /\.(j|t)sx?$/,
        //   use: "source-map-loader",
        //   enforce: "pre"
        // },
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: [
                [
                  "@babel/preset-env",
                  { targets: { browsers: "last 2 Chrome versions, iOS 10" } }
                ],
                "@babel/preset-typescript",
                "@babel/preset-react"
              ],
              plugins: [
                "@babel/plugin-syntax-dynamic-import",
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                "react-hot-loader/babel"
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: "[local]___[hash:base64:5]"
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|wav)$/,
          loader: "url-loader",
          options: { limit: 8192 }
        }
      ]
    }
  };

  if (env.production) {
    config = {
      ...config,
      mode: "production",
      devtool: "source-map",
      plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify("production")
        })
      ]
    };
  } else {
    config = {
      ...config,
      plugins: [...config.plugins, new webpack.NoEmitOnErrorsPlugin()]
    };
  }

  return config;
};
