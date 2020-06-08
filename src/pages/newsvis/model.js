import * as newsApi from "./service";

export default {
  namespace: "news",
  state: {
    newsByRegion: new Map(),
  },
  reducers: {
    addNews: (state, action) => {
      const { region, dataByDate } = action.payload;
      const { newsByRegion } = state;
      newsByRegion.set(region, dataByDate);
      return { ...state, newsByRegion };
    },
  },
  effects: {
    *getNewsData(action, { call, put }) {
      try {
        // 这里要处理一下时间的问题
        const { region, date } = action.payload;
        const result = yield call(newsApi.getNews, region, date);
        const { tags, keywords, fillingWords } = result.data.news.news[0];
        const data = {
          tags,
          words: {
            keywords,
            fillingWords,
          },
        };
        const dataByDate = new Map([[date, data]]);
        yield put({
          type: "addNews",
          payload: { region, dataByDate },
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
