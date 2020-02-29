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
      try {
        const hots = yield call(getHots),
          range = Array.from(
            d3.rollup(
              hots,
              ([{ list }]) =>
                d3.extent(list, d => d.time).map(d => new Date(d).getTime()),
              d => d.value
            )
          ).reduce(
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
          payload: { dataByName, selectedTime, range }
        });

        function preprocess([{ list, words }]) {
          const datevalues = Array.from(
            d3.rollup(
              list,
              ([d]) => d.reading,
              d => d.time,
              d => d.title
            )
          )
            .map(([date, data]) => [new Date(date), data])
            .sort(([a], [b]) => a - b);

          const titles = new Set(list.map(d => d.title));
          const keyframes = interpolate(10);
          const nameframes = d3.groups(
            keyframes.flatMap(([date, data]) => data),
            d => d.title
          );
          const pre = new Map(
            nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
          );
          const next = new Map(
            nameframes.flatMap(([, data]) => d3.pairs(data))
          );

          return {
            keyframes,
            pre,
            next
          };

          function interpolate(k) {
            const keyframes = [];
            let ka, a, kb, b;
            for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
              for (let i = 0; i < k; i++) {
                const t = i / k;
                keyframes.push([
                  new Date(ka * (1 - t) + kb * t).getTime(),
                  rank(title => a.get(title) * (1 - t) + b.get(title) * t)
                ]);
              }
            }

            keyframes.push([
              new Date(kb).getTime(),
              rank(title => b.get(title))
            ]);
            
            keyframes.forEach(([date, data]) =>
              data.forEach(d => (d.time = date))
            );
            return keyframes;
          }

          function rank(reading) {
            const n = 10;
            const data = Array.from(titles, title => ({
              title,
              reading: reading(title) || 0
            }));
            data.sort((a, b) => d3.descending(a.reading, b.reading));
            for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
            return data;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
};
