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

        
        const titlevalues = Array.from(
          d3.rollup(
            list,
            d => ({
              url: d[0].url,
              values: d.map(i => [new Date(i.time).getTime(), +i.reading])
            }),
            d => d.title
          )
        );

        return {
          name,
          range,
          getListByTime: time =>
            titlevalues
              .map(([title, d]) => ({
                title,
                url: d.url,
                reading: interpolateValues(d.values, time)
              }))
              .filter(d => !isNaN(d.reading))
              .sort((a, b) => d3.descending(a.reading, b.reading)),
          getWordsByTime: time => ({})
        };
      });

      function interpolateValues(values, time) {
        const bisect = d3.bisector(d => d[0]);
        const i = bisect.left(values, time, 0, values.length - 1),
          a = values[i];

        if (i > 0) {
          const b = values[i - 1],
            t = (time - a[0]) / (b[0] - a[0]);
          return a[1] * (1 - t) + b[1] * t;
        }
        return a[1];
      }

      yield put({
        type: "setHots",
        payload: { data: d3.map(data, d => d.name) }
      });
    }
  }
};
