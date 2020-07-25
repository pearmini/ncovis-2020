import React from "react";
import * as serviceWorker from "./serviceWorker";

import createLoading from "dva-loading";
import dva from "dva";

import App from "./App";
import models from "./model";

import "antd/dist/antd.css";
import "./index.css";

const app = new dva();

app.use(createLoading());

models.forEach((model) => app.model(model));

app.router(() => <App />);

app.start("#root");

serviceWorker.unregister();
