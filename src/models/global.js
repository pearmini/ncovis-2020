import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import * as d3 from "d3";

const client = new ApolloClient({
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS",
});

function getTimeRange() {
  return client.query({
    query: gql`
      {
        ncov(country: "中国") {
          date
        }
      }
    `,
  });
}

export default {
  namespace: "global",
  state: {
    selectedTime: new Date().getTime(),
    selectedRegion: "湖北",
    timeRange: [],
    timeTicks: [],
  },
  effects: {
    *getTime(action, { call, put }) {
      const res = yield call(getTimeRange);
      const ncov = res.data.ncov;
      const timeTicks = Array.from(new Set(ncov.map((d) => d.date))),
        timeRange = d3.extent(timeTicks).map((d) => new Date(d)),
        selectedTime = new Date(timeRange[0]).getTime();
      yield put({
        type: "init",
        payload: { timeTicks, timeRange, selectedTime },
      });
    },
  },
  reducers: {
    init: (state, action) => ({ ...state, ...action.payload }),
  },
};
