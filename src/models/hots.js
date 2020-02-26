import data from "../assets/data/hots.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array
};

function getHots() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), 1000);
  });
}

export default {
  namespace: "hots",
  state: new Map(),
  reducers: {
    setHots(state, action) {
      const { data } = action.payload;
      return data;
    }
  },
  effects: {
    *getData(action, { call, put }) {
      const platforms = yield call(getHots);
      const data = platforms.map(({ words, list, name }) => {
        const range = d3
          .extent(list, d => d.time)
          .map(d => new Date(d).getTime());

        const valueByTime = Array.from(
          d3.rollup(list, rank, d => d.time)
        ).map(([date, data]) => [new Date(date), data]);
        
        return {
          name,
          range,
          list: [],
          words: []
        };
      });

      const dataByName = d3.map(data, d => d.name);

      function rank(d) {
        d.map(({ time, reading, ...rest }) => ({
          reading: +reading,
          ...rest
        }))
          .sort((a, b) => b.reading - a.reading)
          .map((item, i) => ({ ...item, rank: i }));
      }
      yield put({ type: "setHots", payload: { data: dataByName } });
    }
  }
};
