import hotWeibo from "../assets/data/hot_weibo.json";
import hotZhihu from "../assets/data/hot_zhihu.json";
import * as d3 from "d3";
// import cloud from "d3-cloud";

function getHots({ key }) {
  if (key === "weibo") {
    return hotWeibo;
  } else {
    return hotZhihu;
  }
}

// function getWords(data) {
//   const words = data.map(item => {
//     const text = item.title.substr(0, 2);
//     return { text, size: 10 + Math.random() * 90 };
//   });

//   return new Promise((resolve, reject) => {
//     cloud()
//       .size([800, 350])
//       .words(words)
//       .padding(5)
//       .rotate(function() {
//         return ~~(Math.random() * 2) * 90;
//       })
//       .fontSize(function(d) {
//         return d.size;
//       })
//       .on("end", resolve)
//       .start();
//   });
// }

function computeBarLayout(data, minRange, maxRange) {
  data.forEach(item => (item.reading = parseInt(item.reading)));
  const domain = d3.extent(
    data.filter(item => item.reading !== 0),
    d => d.reading
  );
  const scale = d3
    .scaleLinear()
    .domain(domain)
    .range([minRange, maxRange]);
  data.forEach(item => (item.width = scale(item.reading)));
  return data;
}

export default {
  namespace: "hot",
  state: {
    list: [],
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
    *getData(action, { call, put }) {
      const { list, words } = yield call(getHots, action.payload);
      yield put({ type: "setHotlist", payload: { data: computeBarLayout(list, 10, 100) } });
      yield put({ type: "setHotWords", payload: { data: words } });
    }
  }
};
