import data from "../assets/data/news.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import formatDate from "../utils/formatDate";

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
    selectedDate: "2020-2-20",
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
        const dataByRegion = d3.rollup(
            news,
            ([d]) => d,
            d => d.region,
            d => d.date
          ),
          range = d3.extent(data, d => new Date(d.date)),
          dataByDate = d3.rollup(
            news,
            data =>
              data.map(d => ({
                region: d.region,
                data: d.data
              })),
            d => d.date
          ),
          selectedDate = formatDate(new Date(range[1]));
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
