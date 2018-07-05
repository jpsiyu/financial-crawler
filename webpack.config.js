const path = require('path');

module.exports = {
  mode: "development", // "production" | "development" | "none"
  entry: {index: "./client/src/index.jsx"},
  output: {
    path: path.resolve(__dirname, "client/public"), // string
    filename: "[name].bundle.js", // string
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, "client/src")
        ],
        exclude: [
          path.resolve(__dirname, "/node_modules/")
        ],
        loader: "babel-loader",
        options: {
          presets: ["env", "react"],
          plugins: ["transform-runtime"]
        },
      },
      {
        include:[path.resolve(__dirname, 'css')],
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
}