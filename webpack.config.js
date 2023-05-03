const webpack = require("webpack");
const path = require('path');
const htmlWebpackPlugin =  require('html-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); 
const ESLintPlugin = require('eslint-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const devMode = process.env.NODE_ENV === 'development'; 

console.log('IS DEV',devMode);

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all' //чтобы грузить сторонние библиотеки котрые мы подключаем в разные файлы один раз
    }
  }

  if(!devMode) {
    config.minimizer =[
      new OptimizeCSSAssetsPlugin(),
      new TerserPlugin(),
      new BundleAnalyzerPlugin()
    ]
  }
  return config
}

const plugins = [
  new htmlWebpackPlugin({
    title: 'My web page',
    filename: 'index.html',
    template: './index.html'
  }),
  new copyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src/forcopy'), to: '' //кпирует файл в нашу главную папку dist (без его изменений)
      }
    ]
  }),
  new MiniCssExtractPlugin({
    filename: 'css-[name].css'
  })
];

if (devMode) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new ESLintPlugin());
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    filename:  ['./index.js','./ts/hello.ts', './jsx/react.jsx'], // точка входа в прилажение(файл к которому будут подключаться все остальные и он конвертится в dist)
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'javaScript-[name].js',
    assetModuleFilename:'[name][ext]', //чтобы при сборке сохранять имя файла и расширение
    clean: true
  },
  resolve: {
    extensions: ['.js','.jsx','.scss'],
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  optimization: optimization(),
  performance: {
    hints: false, //убрать подсказки в консоли
    maxAssetSize: 512000, //максимальный размер (килобайты)
    maxEntrypointSize :512000 //точка начала ленивой подгрузки
  }, 
  devServer: {
    port: 3000,
    compress: true,
    hot: devMode,
    static: {
      directory: path.join(__dirname, 'dist')
    }
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.scss$/, //береём все файлы с таким расширением
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader',
          'sass-loader'] // применение этих библиотек к scss файлам
      },
      {
        test: /\.(jpg|png|svg|webp)$/i, //i - для обработки разных регистров
        type: 'asset/resource' //говорим что ёто изображение
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.m?ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', "@babel/preset-typescript"]
          }
        }
      },
      {
        test: /\.m?jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-react"
              ]
            ]
          }
        }
      }
    ],
  },
}