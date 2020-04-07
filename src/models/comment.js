function requestData({ code, type, index }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        isAdmin: true,
        pages: 20,
        data: [
          {
            id: 1,
            title: "Vue",
            url: "https://www.baidu.com",
            des:
              "下图中右边是热力图，其中每一个格子代表一个地区，该格子颜色越深，表示该地区当天相对前一天的变化越剧烈。在这里你不仅能看各个省份（湖北省、山东省等）和各个直辖市（北京市、上海市）的变化情况，还可以通过点击下图中右边的树，来对区域进行合并，从而查看各个分区（华中地区、华南地区等），甚至全国的变化。",
            createTime: new Date("2020-03-16"),
            author: "尤小溪",
            reading: 2,
            isTop: 1,
            isShow: 1,
            words: [],
          },
          {
            id: 2,
            title: "React",
            url: "https://www.baidu.com",
            des:
              "下图中右边是热力图，其中每一个格子代表一个地区，该格子颜色越深，表示该地区当天相对前一天的变化越剧烈。在这里你不仅能看各个省份（湖北省、山东省等）和各个直辖市（北京市、上海市）的变化情况，还可以通过点击下图中右边的树，来对区域进行合并，从而查看各个分区（华中地区、华南地区等），甚至全国的变化。",
            createTime: new Date("2020-03-11"),
            reading: 10,
            isTop: 0,
            isShow: 1,
            author: "Facebook",
          },
          {
            id: 3,
            title: "Angular",
            url: "https://www.baidu.com",
            des:
              "下图中右边是热力图，其中每一个格子代表一个地区，该格子颜色越深，表示该地区当天相对前一天的变化越剧烈。在这里你不仅能看各个省份（湖北省、山东省等）和各个直辖市（北京市、上海市）的变化情况，还可以通过点击下图中右边的树，来对区域进行合并，从而查看各个分区（华中地区、华南地区等），甚至全国的变化。",
            createTime: new Date("2020-03-13"),
            reading: 5,
            isTop: 0,
            isShow: 0,
            author: "不晓得",
          },
        ],
      });
    }, 1000);
  });
}

export default {
  namespace: "comment",
  state: {
    openForm: false,
    isAdmin: false,
    data: [],
    pages: 0,
  },
  reducers: {
    setOpenForm(state, action) {
      const { value } = action.payload;
      return { ...state, openForm: value };
    },
    setAdmin(state) {
      return { ...state, isAdmin: true };
    },
    setData(state, action) {
      return { ...state, ...action.payload };
    },
    addComment(state, action) {
      const { data } = state;
      const c = {
        ...action.payload,
        createTime: new Date(),
        reading: 0,
        isTop: 0,
        isShow: 0,
      };
      data.push(c);

      // 同步数据
      return { ...state, data };
    },
    setShow(state, action) {
      const { id } = action.payload;
      const data = state.data.slice();
      const c = data.find((d) => d.id === id);
      c && (c.isShow = c.isShow === 1 ? 0 : 1);

      // 同步数据
      return { ...state, data };
    },
    setTop(state, action) {
      const { id } = action.payload;
      const data = state.data.slice();
      const c = data.find((d) => d.id === id);
      c && (c.isTop = c.isTop === 1 ? 0 : 1);

      // 同步数据
      return { ...state, data };
    },
    deleteComment(state, action) {
      const { id } = action.payload;
      const c = state.data.find((d) => d.id === id);
      const index = state.data.indexOf(c);
      const data = state.data.slice();
      data.splice(index, 1);

      // 同步数据
      return { ...state, data };
    }
  },
  effects: {
    *getData(action, { call, put }) {
      try {
        const { index, type } = action.payload;
        const code = localStorage.getItem("ncovis");
        const res = yield call(requestData, {
          code,
          index,
          type,
        });
        if (res.isAdmin) yield put({ type: "setAdmin" });
        yield put({
          type: "setData",
          payload: {
            data: res.data || [],
            pages: res.pages,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
