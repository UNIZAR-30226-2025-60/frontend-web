const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: { port: 8081 },
  publicPath: '/',
  outputDir: 'dist'
});

//NUEVO ABAJOOOOOOOOOOOOOOOOOOOOOOOOO

// const { defineConfig } = require('@vue/cli-service');
// const webpack = require('webpack'); // Importante: importar webpack explícitamente

// module.exports = defineConfig({
//   transpileDependencies: true,
//   devServer: { port: 8081 },
//   publicPath: '/',
//   outputDir: 'dist',
  
//   configureWebpack: {
//     plugins: [
//       new webpack.DefinePlugin({
//         __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
//       }),
//     ],
//   },
// });

