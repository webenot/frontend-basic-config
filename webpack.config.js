const path = require('path');
const webpack = require('webpack');

require('dotenv').config();

const isProduction = (process.env.NODE_ENV === 'production');

// Additional plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const Cleanplugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HTMLPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
require('@babel/polyfill');

const appConfig = require(`applications/${process.env.CURRENT_APP}/webpack.config.js`);

const webpackConfig = {
  // Режим
  mode: (isProduction) ? 'production' : 'development',

  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
    ],
    usedExports: true,
  },

  // слежение
  watch: !isProduction,

  devtool: (isProduction) ? false : 'inline-source-map',

  // Базовый путь к проекту
  context: path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'src'),

  // Точки входа JS
  entry: {
    // Основной файл приложения
    index: [
      '@babel/polyfill',
      path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'src', 'js', 'index.js'),
      path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'src', 'sass', 'style.sass'),
    ],
  },
  resolve: appConfig.resolve,
  // Путь для собранных файлов
  output: {
    filename: isProduction ? 'js/[name].[hash:8].js' : 'js/[name].js',
    path: path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'dist'),
    publicPath: '../',
  },
  module: {
    rules: [
      // js
      {
        test: /\.m?jsx?$/i,
        exclude: /^(node_modules)$/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.js',
            cacheDirectory: true,
          },
        },
      },
      // HTML
      {
        test: /\.pug$/i,
        use: [
          {
            loader: 'pug-loader',
            options: {
              sourceMap: !isProduction,
              pretty: true,
            },
          },
        ],
      },
      // sass
      {
        test: /\.sass$/i,
        resolve: { extensions: [ '.scss', '.sass' ] },
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: path.resolve('dist', 'css') },
          },
          // 'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: !isProduction },
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: !isProduction },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: !isProduction },
          },
        ],
      },
      // Images
      {
        test: /\.(png|gif|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              publicPath: '../',
            },
          },
          'img-loader',
        ],

      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              publicPath: '../',
            },
          },
        ],
      },
      // SVG
      {
        test: /\.svg$/i,
        use: {
          loader: 'svg-url-loader',
          options: { encoding: 'base64' },
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({ NODE_ENV: JSON.stringify(process.env.NODE_ENV) }),
    new Cleanplugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
    new HTMLPlugin({
      filename: 'html/index.html',
      template: './pug/index.pug',
      mobile: true,
    }),
    new MiniCssExtractPlugin(
      { filename: isProduction ? './css/[name].[hash:8].css' : './css/[name].css' },
    ),
    new CopyPlugin(
      {
        patterns: [
          {
            from: path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'src', 'img'),
            to: path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'dist', 'img'),
          },
        ],
      },
      {
        ignore: [
          { glob: 'svg/*' },
        ],
      },
    ),
    new ImageminPlugin({
      maxConcurrency: 1,
      test: filename => {
        console.log(`Attempting to compress "${filename}"...`);
        try {
          return (/\.(jpe?g|png|gif|svg)$/i).test(filename);
        } catch (e) {
          return null;
        }
      },
      plugins: [
        imageminJpegtran({ progressive: true }),
        imageminPngquant({ strip: true }),
      ],
      disable: !isProduction,
    }),
  ],
};

if (appConfig.module.rules) {
  webpackConfig.module.rules = webpackConfig.module.rules.concat(appConfig.module.rules);
}
if (appConfig.plugins) {
  webpackConfig.plugins = webpackConfig.plugins.concat(appConfig.plugins);
}
if (appConfig.entry) {
  webpackConfig.entry = Object.assign(webpackConfig.entry, appConfig.entry);
}
// PRODUCTION ONLY
if (isProduction) {
  webpackConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({ minimize: true }),
  );
  webpackConfig.plugins.push(new OptimizeCSSAssetsPlugin());
}

module.exports = webpackConfig;
