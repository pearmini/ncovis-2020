import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import * as d3 from "d3-array";
const cache = new InMemoryCache({});

(async () =>
  await persistCache({
    cache,
    storage: window.localStorage
  }))();

const client = new ApolloClient({
  cache,
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS"
});

function getTotal() {
  return client.query({
    query: gql`
      {
        ncov(region: "中国") {
          date
          confirmed
          dead
          cured
          region
        }
      }
    `
  });
}

function preprocess(data) {
  const datevalues = Array.from(
    d3.rollup(
      data,
      ([d]) => d,
      d => d.date
    )
  )
    .map(([date, data]) => [new Date(date), data])
    .sort((a, b) => b[0] - a[0]);
  const [a, b] = datevalues;
  const remain = d => d[1].confirmed - d[1].cured - d[1].dead;
  return {
    time: a[0],
    data: [
      {
        name: "累计确诊",
        value: a[1].confirmed,
        change: a[1].confirmed - b[1].confirmed
      },
      {
        name: "现存确诊",
        value: remain(a),
        change: remain(a) - remain(b)
      },
      { name: "累计治愈", value: a[1].cured, change: a[1].cured - b[1].cured },
      { name: "累计死亡", value: a[1].dead, change: a[1].dead - b[1].dead }
    ]
  };
}
export default {
  namespace: "total",
  state: {
    time: new Date(),
    data: [
      {
        name: "累计确诊",
        value: 0,
        change: 0
      },
      {
        name: "现存确诊",
        value: 0,
        change: 0
      },
      { name: "累计治愈", value: 0, change: 0 },
      { name: "累计死亡", value: 0, change: 0 }
    ]
  },
  reducers: {
    setData: (state, action) => ({ ...state, ...action.payload })
  },
  effects: {
    *getData(action, { call, put }) {
      try {
        const result = yield call(getTotal);
        const news = result.data.ncov;
        const data = preprocess(news);
        yield put({ type: "setData", payload: data });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
