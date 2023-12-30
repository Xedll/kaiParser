const path = require('path')
module.exports = {
   entry: path.resolve(__dirname, "src", "index.js"),
   output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      clean: true
   },
   module: {
      rules: [
         {
            test: /\.([cm]?ts|tsx)$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         }
      ],
   },
   resolve: {
      extensions: ['.tsx', '.ts', '.js'],
   },
   target: 'node',
   devServer: {
      static: {
         directory: path.join(__dirname, 'src'),
      },
      compress: true,
      port: 9000,
   },
}