import hot from "../assets/data/hots_data.json";

function getHots() {
  return hot;
}

export default {
  namespace: "hot",
  state: null,
  reducers: {
    setHotlist(state, action) {
      const { data } = action.payload;
      return { ...state, list: data };
    },
    setHotWords(state, action) {
      const { data } = action.payload;
      return { ...state, words: data };
    },
    setHot(state, action) {
      const { data } = action.payload;
      return data;
    }
  },
  effects: {
    *getData(action, { call, put }) {
      const data = yield call(getHots);
      yield put({ type: "setHot", payload: { data } });
    }
  }
};
