import data from "../assets/data/news.json";
import * as d3 from "d3-array";

function getNews() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), 1000);
  });
}

export default {
  namespace: "news",
  state: new Map(),
  effects: {
    *getData(action, { call, put }) {
      const data = yield call(getNews);
      const datevalues = d3.rollup(
        data,
        ([d]) => d.data,
        d => d.region,
        d => d.date
      );
      yield put({ type: "setData", payload: { data: datevalues } });
    }
  },
  reducers: {
    setData(state, action) {
      const { data } = action.payload;
      return data;
    }
  }
};
