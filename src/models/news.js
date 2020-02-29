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
    selectedDate: 0
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
      const news = yield call(getNews);
      const dataByRegion = d3.rollup(
          news.map(({ date, ...rest }) => ({
            date: new Date(date).getTime(),
            ...rest
          })),
          ([d]) => ({ ...d.data, image: d.imageURL }),
          d => d.region,
          d => d.date
        ),
        [selectedDate] = d3.extent(news, d => new Date(d.date).getTime());

      yield put({
        type: "init",
        payload: { dataByRegion, selectedDate }
      });
    }
  }
};
