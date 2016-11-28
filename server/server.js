import path from 'path';
import Express from 'express';
import qs from 'qs';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import Helmet from 'react-helmet'

import configureStore from '../common/store/configureStore';
import CounterContainer from '../common/containers/CounterContainer';

import { fetchCounter } from '../common/api/counter';

const app = new Express();
const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'view'))
app.set('view engine', 'ejs')

var scriptSrcs ;
if ( process.env.NODE_ENV === 'production' ) {
  let refManifest = require('../../rev-manifest.json');
  scriptSrcs = [
    `/${refManifest['vendor.js']}`,
    `/${refManifest['client.js']}`,
  ];
} else {
  scriptSrcs = [
    'http://localhost:3001/static/vendor.js',
    'http://localhost:3001/static/dev.js',
    'http://localhost:3001/static/client.js'
  ];
}

function handleRender(req, res) {
  // 模仿實際非同步 api 處理情形
  fetchCounter(apiResult => {
    // 讀取 api 提供的資料（這邊我們 api 是用 setTimeout 進行模仿非同步狀況），若網址參數有值擇
    // 取值，若無則使用 api 提供的隨機值，若都沒有則取 0
    const params = qs.parse(req.query);
    const counter = parseInt(params.counter, 10) || apiResult || 0;
    // 將 initialState 轉成 immutable 和符合 state 設計的格式
    const initialState = fromJS({
      count: counter,
    });
    // 建立一個 redux store
    const store = configureStore(initialState);
    // 使用 renderToString 將 component 轉為 string
    const html = renderToString(
      <Provider store={store}>
        <CounterContainer />
      </Provider>
    );
    // 從建立的 redux store 中取得 initialState
    const reduxState = store.getState();

    // HTML Markup，同時也把 preloadedState 轉成字串（stringify）傳到
    // client-side，又稱為 dehydration（脫水）
    const preloadedState = JSON.stringify(reduxState).replace(/</g, '\\x3c');
    let metaHeader = Helmet.rewind();
    // 將 HTML 和 initialState 傳到 client-side
    //渲染模板引擎
    res.render('index', { metaHeader, html, scriptSrcs, preloadedState })
  })
}

 //使用 middleware 於 webpack 去進行 hot module reloading
//const compiler = webpack(webpackConfig);
//app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
//app.use(webpackHotMiddleware(compiler));

// 每次 server 接到 request 都會呼叫 handleRender
app.use(handleRender);

// 監聽 server 狀況
app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
  }
});
