import * as overviewApi from "./service";

export default {
  namespace: "overview",
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
    save: (state, action) => ({ ...state, ...action.payload }),
  },
  effects: {
    *getData(_, { call, put }) {
      try {
        const result = yield call(overviewApi.get);
        const ncovOverall = result.data.ncovOverall;
        const data = preprocess(ncovOverall);
        yield put({
          type: "save",
          payload: data,
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};

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
