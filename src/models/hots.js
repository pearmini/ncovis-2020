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
              keywords {
                name
                weight
              }
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

function preprocess(data) {
  const wordsKeyframes = Array.from(
    d3.rollup(
      data,
      ([d]) => d.keywords,
      d => d.time
    )
  ).sort(([a], [b]) => a - b);

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
  return {
    listKeyframes,
    wordsKeyframes
  };

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
    keyframes.push([new Date(kb).getTime(), rank(title => b.get(title))]);
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

function computeWordCloud(data) {
  const words = data =>
    data.map(d => ({
      text: d.name,
      value: d.weight
    }));
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
            .on("end", words => resolve([date, words]))
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
      const {
        name,
        listKeyframes,
        cloudsKeyframes,
        nextCursor
      } = action.payload;
      const { dataByName } = state;
      const value = dataByName.get(name);
      if (!value)
        dataByName.set(name, {
          listKeyframes,
          cloudsKeyframes
        });
      else {
        value.listKeyframes.push(...listKeyframes);
        value.cloudsKeyframes.push(...cloudsKeyframes);
      }
      return { ...state, dataByName, nextCursor };
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
        const { name } = action.payload,
          nextCursor = result.data[name].paging.nextCursor,
          data = result.data[name].data;
        const { listKeyframes, wordsKeyframes } = preprocess(data);
        const cloudsKeyframes = yield call(computeWordCloud, wordsKeyframes);
        yield put({
          type: "addFrames",
          payload: { name, listKeyframes, cloudsKeyframes, nextCursor }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
