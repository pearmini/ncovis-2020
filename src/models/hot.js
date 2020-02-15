import hotWeibo from "../assets/data/hot_weibo.json";
import hotZhihu from "../assets/data/hot_zhihu.json";
import * as d3 from "d3";
import cloud from "d3-cloud";

function getHots({ key }) {
  const { value } = key;
  if (value === "weibo") {
    return hotWeibo;
  } else {
    return hotZhihu;
  }
}

function getWords(data) {
  const words = data.map(item => {
    const text = item.title.substr(0, 2);
    return { text, size: 10 + Math.random() * 90 };
  });

  return new Promise((resolve, reject) => {
    cloud()
      .size([800, 350])
      .words(words)
      .padding(5)
      .rotate(function() {
        return ~~(Math.random() * 2) * 90;
      })
      .fontSize(function(d) {
        return d.size;
      })
      .on("end", resolve)
      .start();
  });
}

export default {
  namespace: "hot",
  state: {
    list: {},
    words: []
  },
  reducers: {
    setHotlist(state, action) {
      const { data } = action.payload;
      return { ...state, list: data };
    },
    setHotWords(state, action) {
      const { data } = action.payload;
      return { ...state, words: data };
    }
  },
  effects: {
    *getlist(action, { call, put }) {
      const res = yield call(getHots, action.payload);

      // 对数据进行一下处理，方便可视化
      // 条形图需要的可视化
      res.data.forEach(item => (item.reading = parseInt(item.reading)));
      const domain = d3.extent(
        res.data.filter(item => item.reading !== 0),
        d => d.reading
      );
      const scale = d3
        .scaleLinear()
        .domain(domain)
        .range([10, 100]);
      res.data.forEach(item => (item.width = scale(item.reading)));
      yield put({ type: "setHotlist", payload: { data: res } });

      // 词云需要的可视化
      const words = yield call(getWords, res.data);
      yield put({ type: "setHotWords", payload: { data: words } });
    }
  }
};
