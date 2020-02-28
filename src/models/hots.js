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
  state: {
    dataByName: d3.map(),
    range: [],
    selectedTime: 0
  },
  reducers: {
    init: (state, action) => ({ ...action.payload }),
    setSelectedName: (state, action) => ({
      ...state,
      selectedName: action.payload
    }),
    setSelectedTime: (state, action) => ({
      ...state,
      selectedTime: action.payload
    })
  },
  effects: {
    *getData(action, { call, put }) {
      const hots = yield call(getHots),
        range = Array.from(d3.rollup(hots, extent, d => d.value)).reduce(
          (total, [, [min, max]]) => [
            Math.max(total[0], min),
            Math.min(total[1], max)
          ],
          [-1, Infinity]
        ),
        dataByName = d3.rollup(hots, preprocess, d => d.value),
        selectedTime = range[0];

      yield put({
        type: "init",
        payload: {
          dataByName,
          range,
          selectedTime
        }
      });

      function extent([{ list }]) {
        return d3.extent(list, d => d.time).map(d => new Date(d).getTime());
      }

      function preprocess([{ words, list }]) {
        const titlevalues = Array.from(d3.rollup(list, format, d => d.title));
        return {
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
      }

      function format(d) {
        return {
          url: d[0].url,
          values: d.map(i => [new Date(i.time).getTime(), +i.reading])
        };
      }

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
    }
  }
};
