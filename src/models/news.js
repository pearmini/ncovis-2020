import newsShandong from "../assets/data/news_shandong.json";
function getData({ region }) {
  return newsShandong;
}

export default {
  namespace: "news",
  state: {
    words: []
  },
  effects: {
    *getWords(action, { call, put }) {
      const {words} = yield call(getData, action.payload);
      yield put({ type: "setWords", payload: { words } });
    }
  },
  reducers: {
    setWords(state, action) {
      const { words } = action.payload;
      return { ...state, words };
    }
  }
};
