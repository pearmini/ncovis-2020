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

  const datetopics = Array.from(
    d3.rollup(
      data,
      ([d]) =>
        d3.rollup(
          d.topics,
          ([{ heat }]) => heat,
          d => d.title
        ),
      d => d.time
    )
  ).sort(([a], [b]) => a - b);

  const words = new Set(data.flatMap(d => d.keywords.map(d => d.name)));
  const topics = new Set(data.flatMap(d => d.topics.map(d => d.title)));
  const topicsTicks = interploateTicks(ticks, 20);

  // 第一个 ticks 上面一帧已经插值过了，所以就不需要再才插值了
  // 但是需要它来获取数据
  const wordsKeyframes = ticks
    .slice(0, ticks.length - 1)
    .map(tick => interpolateWordsValues(datewords, words, tick));
  const listKeyframes = topicsTicks
    .slice(0, topicsTicks.length - 1)
    .map(tick => interpolateTopicsValues(datetopics, topics, tick));

  return {
    listKeyframes,
    wordsKeyframes
  };

  function interploateTicks(ticks, k) {
    const res = [];
    for (let [a, b] of d3.pairs(ticks)) {
      for (let i = 0; i < k; i++) {
        const t = i / k;
        res.push(a * (1 - t) + b * t);
      }
    }
    res.push(ticks[ticks.length - 1]);
    return res;
  }

  function interpolateWordsValues(data, names, time) {
    const bisect = d3.bisector(d => d[0] * 1000).left;
    const i = bisect(data, time, 0, data.length - 1),
      a = data[i];
    if (!i) return [time / 1000, interpolateWord(names, key => a[1].get(key))];

    const b = data[i - 1],
      t = (time / 1000 - a[0]) / (b[0] - a[0]);
    return [
      time / 1000,
      interpolateWord(names, key => {
        const v1 = a[1].get(key) || 0;
        const v2 = b[1].get(key) || 0;
        return v1 * (1 - t) + v2 * t;
      })
    ];
  }

  function interpolateTopicsValues(data, names, time) {
    const bisect = d3.bisector(d => d[0] * 1000).left;
    const i = bisect(data, time, 0, data.length - 1),
      a = data[i];
    if (!i) return [time / 1000, interpolateTopic(names, key => a[1].get(key))];

    const b = data[i - 1],
      t = (time / 1000 - a[0]) / (b[0] - a[0]);
    return [
      time / 1000,
      interpolateTopic(names, key => {
        const v1 = a[1].get(key) || 0;
        const v2 = b[1].get(key) || 0;
        return v1 * (1 - t) + v2 * t;
      })
    ];
  }

  function interpolateTopic(names, value) {
    const data = Array.from(names, name => ({
      title: name,
      heat: value(name)
    }));
    data.sort((a, b) => d3.descending(a.heat, b.heat));
    for (let i = 0; i < data.length; ++i) data[i].rank = i;
    return data.slice(0, 10);
  }

  function interpolateWord(names, value) {
    const data = Array.from(names, name => ({
      name,
      value: value(name) || 0
    }));
    data.sort((a, b) => d3.descending(a.value, b.value));
    return data;
  }
}

function computeWordCloud(data, n = 20) {
  const words = data =>
    data
      .map(d => ({
        text: d.name,
        value: d.weight || d.value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  return Promise.all(
    data.map(
      ([date, d]) =>
        new Promise((resolve, reject) => {
          cloud()
            .size([900, 600])
            .words(words(d))
            .padding(5)
            .rotate(0)
            .fontSize(d => d.value * 120)
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
        // const { listKeyframes: oldL, cloudsKeyframes: oldC } = value;
        // const newL = [listKeyframes, ...oldL].sort((a, b) => a[0] - b[0]).filter
        value.listKeyframes.push(...listKeyframes);
        value.listKeyframes.sort((a, b) => a[0] - b[0]);

        // console.log(d3.pairs(value.listKeyframes).map(([a, b]) => b[0] - a[0]));
        // 添加并且排序
        value.cloudsKeyframes.push(...cloudsKeyframes);
        value.cloudsKeyframes.sort((a, b) => a[0] - b[0]);
        // console.log(
        //   d3.pairs(value.cloudsKeyframes).map(([a, b]) => b[0] - a[0])
        // );
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
