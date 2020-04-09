import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import * as d3 from "d3-array";
const cache = new InMemoryCache({});

(async () =>
  await persistCache({
    cache,
    storage: window.localStorage,
  }))();

const client = new ApolloClient({
  cache,
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS",
});

function getTotal() {
  return client.query({
    query: gql`
      {
        ncovOverall {
          time
          confirmed
          confirmedIncr
          cured
          curedIncr
          deadIncr
          dead
          remainingConfirmed
          remainingConfirmedIncr
          global {
            confirmed
            confirmedIncr
            cured
            curedIncr
            deadIncr
            dead
            remainingConfirmed
            remainingConfirmedIncr
          }
        }
      }
    `,
  });
}

function preprocess(data) {
  const { global, time, ...china } = data;
  const format = (
    {
      confirmed,
      confirmedIncr,
      cured,
      curedIncr,
      deadIncr,
      dead,
      remainingConfirmed,
      remainingConfirmedIncr,
    },
    name
  ) => ({
    name,
    data: [
      {
        name: "累计确诊",
        value: confirmed,
        change: confirmedIncr,
      },
      {
        name: "现存确诊",
        value: remainingConfirmed,
        change: remainingConfirmedIncr,
      },
      {
        name: "累计治愈",
        value: cured,
        change: curedIncr,
      },
      { name: "累计死亡", value: dead, change: deadIncr },
    ],
  });
  return {
    time: time * 1000,
    data: [format(global, "全球"), format(china, "全国")],
  };
}

export default {
  namespace: "total",
  state: {
    time: new Date().getTime(),
    data: [
      {
        name: "全球",
        data: [
          {
            name: "累计确诊",
            value: 0,
            change: 0,
          },
          {
            name: "现存确诊",
            value: 0,
            change: 0,
          },
          {
            name: "累计治愈",
            value: 0,
            change: 0,
          },
          { name: "累计死亡", value: 0, change: 0 },
        ],
      },
      {
        name: "全国",
        data: [
          {
            name: "累计确诊",
            value: 0,
            change: 0,
          },
          {
            name: "现存确诊",
            value: 0,
            change: 0,
          },
          {
            name: "累计治愈",
            value: 0,
            change: 0,
          },
          { name: "累计死亡", value: 0, change: 0 },
        ],
      },
    ],
  },
  reducers: {
    setData: (state, action) => ({ ...state, ...action.payload }),
  },
  effects: {
    *getData(action, { call, put }) {
      try {
        const result = yield call(getTotal);
        const ncovOverall = result.data.ncovOverall;
        const data = preprocess(ncovOverall);
        yield put({
          type: "setData",
          payload: data,
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
