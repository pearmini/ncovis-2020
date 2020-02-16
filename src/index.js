import React from "react";
import * as serviceWorker from "./serviceWorker";

import createLoading from "dva-loading";
import dva from "dva";

import App from "./App";
import globalModel from "./models/global";
import HotModel from "./models/hot";
import totalModel from "./models/total";
import newsModel from "./models/news";
import "./index.css";

const app = new dva();

app.use(createLoading());

app.model(globalModel);
app.model(HotModel);
app.model(totalModel);
app.model(newsModel);

app.router(() => <App />);

app.start("#root");

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
