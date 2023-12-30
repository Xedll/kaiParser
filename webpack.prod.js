const { merge } = require('webpack-merge')
const common = require('./webpack.common')

// @ts-ignore
module.exports = merge(common, {
   mode: 'production',
})
