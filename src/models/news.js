import data from "../assets/data/news.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array
};

function getNews() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), 1000);
  });
}

export default {
  namespace: "news",
  state: {
    dataByRegion: d3.map(),
    selectedDate: new Date().getTime(),
    range: [],
    dataByDate: d3.map()
  },
  reducers: {
    init: (state, action) => ({ ...state, ...action.payload }),
    setSelectedDate: (state, action) => ({
      ...state,
      selectedDate: action.payload
    })
  },
  effects: {
    *getData(action, { call, put }) {
      try {
        const news = yield call(getNews);
        const data = news.map(({ date, ...rest }) => ({
          date: new Date(date).getTime(),
          ...rest
        }));
        const dataByRegion = d3.rollup(
            data,
            ([d]) => ({ ...d.data, key: d.key, fill: d.fill }),
            d => d.region,
            d => d.date
          ),
          range = d3.extent(data, d => d.date),
          dataByDate = d3.rollup(
            data,
            data =>
              data.map(d => ({
                region: d.region,
                data: d.data
              })),
            d => d.date
          ),
          [, selectedDate] = range;
        yield put({
          type: "init",
          payload: { dataByRegion, selectedDate, range, dataByDate }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
