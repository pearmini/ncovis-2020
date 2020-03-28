import data from "../assets/data/hots.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import cloud from "d3-cloud";

const d3 = {
  ...d3All,
  ...d3Array
};

const cache = new InMemoryCache({});

(async () =>
  await persistCache({
    cache,
    storage: window.localStorage,
    maxSize: false
  }))();

const client = new ApolloClient({
  cache,
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS"
});

function getHots({ name = "zhihu", cursor, from, limit = 10 }) {
  return client.query({
    query: gql`
      {
        ${name}(
          limit:${limit}, 
          ${cursor ? `cursor:${cursor}` : ""}, 
          ${from ? `from:${from}` : ""}
        ){
          paging{
            total
            nextCursor
          }
          data {
            time
            keywords {
              name
              weight
            }
            topics {
              heat
              qid
              title
            }
          }
        }
      }
    `
  });
}

function getTimeRange(platform = "zhihu") {
  return client.query({
    query: gql`{
      ${platform} {
        data{
          time
        }
      }
    }`
  });
}

function preprocess(data, ticks) {
  // const wordsKeyframes = Array.from(
  //   d3.rollup(
  //     data,
  //     ([d]) => d.keywords,
  //     d => d.time
  //   )
  // ).sort(([a], [b]) => a - b);
  // console.log(data);

  const datevalues = Array.from(
    d3.rollup(
      data,
      ([d]) =>
        d3.rollup(
          d.topics,
          ([{ heat }]) => heat,
          d => d.qid
        ),
      d => d.time
    )
  )
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => a - b);

  const topics = new Set(
    data.flatMap(d => d.topics.map(({ qid, title }) => ({ qid, title })))
  );
  const listKeyframes = interpolate(10);

  // 一天用 12s 来展现，那么一天插值成至少 12 帧，最大的间隔就是 1 小时
  const datewords = Array.from(
    d3.rollup(
      data,
      ([d]) =>
        d3.rollup(
          d.keywords,
          ([{ weight }]) => weight,
          d => d.name
        ),
      d => d.time
    )
  );

  const [start, end] = d3.extent(datewords, d => d[0]);
  // 对数据进行一下筛选，将间隔太小的删除
  // const minInterval = 60 * 60 * 3;
  // const hello = datewords.reduce((total, cur) => {
  //   const len = total.length;
  //   if (len === 0) return [cur];
  //   const interval = cur[0] - total[len - 1][0];
  //   if (interval < minInterval) return total;
  //   else return [...total, cur];
  // }, []);

  const words = new Set(data.flatMap(d => d.keywords.map(d => d.name)));
  // 对词云进行一下插值，将间隔时间太长的缩小
  // 否者会出现变换很慢的情况
  // 对数据进行插值，让它们等间隔
  // const wordsKeyframes = interpolateValues(hello, words, minInterval);
  // console.log(wordsKeyframes);

  // 根据 ticks 进行插值
  // 根据返回的数据找到 ticks 的范围，然后进行插值
  // const lo = d3.bisectLeft(ticks, start * 1000),
  //   hi = d3.bisectLeft(ticks, end * 1000);
  // const f = ticks.slice(lo, hi);
  // const r = f.map(tick => interpolateWordsValues(datewords, words, tick));
  // console.log(r, lo, hi, start, end);
  const r = ticks.map(tick => interpolateWordsValues(datewords, words, tick));

  return {
    listKeyframes,
    wordsKeyframes: r
  };

  function interpolateWordsValues(data, names, time) {
    const bisect = d3.bisector(d => d[0] * 1000).left;
    const i = bisect(data, time, 0, data.length - 1),
      a = data[i];
    if (!i) return [time / 1000, interpolateWord(names, key => a[1].get(key))];

    const b = data[i - 1],
      t = (time / 1000 - a[0]) / (b[0] - a[0]);
    return [
      time / 1000,
      interpolateWord(names, key => a[1].get(key) * (1 - t) + b[1].get(key) * t)
    ];
  }

  function interpolateValues(datevalues, names, minInterval) {
    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
      const k = Math.ceil((kb - ka) / minInterval);
      for (let i = 0; i < k; i++) {
        const t = i / k;
        keyframes.push([
          new Date(ka * (1 - t) + kb * t).getTime(),
          interpolateWord(names, key => a.get(key) * (1 - t) + b.get(key) * t)
        ]);
      }
    }
    keyframes.push([
      new Date(kb).getTime(),
      interpolateWord(names, key => b.get(key))
    ]);
    return keyframes;
  }

  function interpolateWord(names, value) {
    const data = Array.from(names, name => ({
      name,
      value: value(name) || 0
    }));
    data.sort((a, b) => d3.descending(a.value, b.value));
    return data;
  }

  function interpolate(k) {
    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
      for (let i = 0; i < k; i++) {
        const t = i / k;
        keyframes.push([
          new Date(ka * (1 - t) + kb * t).getTime(),
          rank(qid => a.get(qid) * (1 - t) + b.get(qid) * t)
        ]);
      }
    }
    keyframes.push([new Date(kb).getTime(), rank(qid => b.get(qid))]);
    return keyframes;
  }

  function rank(heat) {
    const n = 10;
    const data = Array.from(topics, ({ qid, title }) => ({
      qid,
      heat: heat(qid) || 0,
      title
    }));
    data.sort((a, b) => d3.descending(a.heat, b.heat));
    for (let i = 0; i < data.length; ++i) data[i].rank = i;
    return data.slice(0, n);
  }
}

function computeWordCloud(data, n = 20) {
  // console.log(data);
  const words = data =>
    data
      .map(d => ({
        text: d.name,
        value: d.weight || d.value
      }))
      .slice(0, n);
  return Promise.all(
    data.map(
      ([date, d]) =>
        new Promise((resolve, reject) => {
          cloud()
            .size([1200, 800])
            .words(words(d))
            .padding(5)
            .rotate(0)
            .fontSize(d => d.value * 170)
            .on("end", words => resolve([date * 1000, words]))
            .start();
        })
    )
  );
}

export default {
  namespace: "hots",
  state: {
    dataByName: d3.map(),
    timeByName: d3.map(),
    nextCursor: "",
    selectedTime: null
  },
  reducers: {
    addTimeRange: (state, action) => {
      const { range, name } = action.payload;
      const { timeByName, selectedTime } = state;
      timeByName.set(name, range);
      const time = selectedTime === null ? range[0].time : selectedTime;
      return { ...state, timeByName, selectedTime: time };
    },
    updateDataByTime: (state, action) => {
      const { name, range } = action.payload;
      const { timeByName } = state;
      timeByName.set(name, range);
      return { ...state, timeByName };
    },
    setSelectedTime: (state, action) => ({
      ...state,
      selectedTime: action.payload
    }),
    addFrames: (state, action) => {
      const { name, listKeyframes, cloudsKeyframes } = action.payload;
      const { dataByName } = state;
      const value = dataByName.get(name);
      if (!value)
        dataByName.set(name, {
          listKeyframes,
          cloudsKeyframes
        });
      else {
        value.listKeyframes.push(...listKeyframes);

        // 添加并且排序
        value.cloudsKeyframes.push(...cloudsKeyframes);
        value.cloudsKeyframes.sort((a, b) => a[0] - b[0]);
        console.log(
          d3.pairs(value.cloudsKeyframes).map(([a, b]) => b[0] - a[0])
        );
      }
      return { ...state, dataByName };
    }
  },
  effects: {
    *getTime(action, { call, put }) {
      try {
        const { name } = action.payload;
        const data = yield call(getTimeRange, name);
        const range = data.data[name].data
          .map(({ time }) => time * 1000)
          .map(d => ({ time: d, request: false }))
          .sort((a, b) => a.time - b.time);
        yield put({ type: "addTimeRange", payload: { range, name } });
      } catch (e) {
        console.error(e);
      }
    },
    *getData(action, { call, put }) {
      try {
        const result = yield call(getHots, action.payload);
        const { name, ticks } = action.payload,
          data = result.data[name].data;
        const { listKeyframes, wordsKeyframes } = preprocess(data, ticks);
        const cloudsKeyframes = yield call(computeWordCloud, wordsKeyframes);
        yield put({
          type: "addFrames",
          payload: { name, listKeyframes, cloudsKeyframes }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
