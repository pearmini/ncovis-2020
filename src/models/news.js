function getData({ region }) {
  return {
    words: []
  };
}

export default {
  namespace: "news",
  state: {
    words: []
  },
  effects: {
    *getWords(action, { call, put }) {
      const { words } = yield call(getData, action.payload);
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
