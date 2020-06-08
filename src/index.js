import React from "react";
import * as serviceWorker from "./serviceWorker";

import createLoading from "dva-loading";
import dva from "dva";

import App from "./App";
import models from "./model";
import "./index.css";
// import hotsModel from "./models/hots";
// import newsModel from "./models/news";
// import totalModel from "./models/total";
// import commentModel from "./models/comment";
// import ncovModel from "./models/ncov";
// import globalModel from "./models/global";

const app = new dva();

app.use(createLoading());
models.forEach((model) => app.model(model));
// app.model(ncovModel);
// app.model(hotsModel);
// app.model(newsModel);
// app.model(totalModel);
// app.model(commentModel);
// app.model(globalModel);

app.router(() => <App />);

app.start("#root");

serviceWorker.unregister();
