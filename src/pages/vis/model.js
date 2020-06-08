import * as d3 from "d3";
import * as commonApi from "./service";
export default {
  namespace: "common",
  state: {
    selectedTime: new Date().getTime(),
    selectedRegion: "中国",
    timeRange: [],
    timeTicks: [],
  },
  effects: {
    *getTime(_, { call, put }) {
      const res = yield call(commonApi.get);
      const ncov = res.data.ncov;
      const timeTicks = Array.from(new Set(ncov.map((d) => d.date))),
        timeRange = d3.extent(timeTicks).map((d) => new Date(d)),
        selectedTime = new Date(timeRange[0]).getTime();
      yield put({
        type: "save",
        payload: { timeTicks, timeRange, selectedTime },
      });
    },
  },
  reducers: {
    save: (state, action) => ({ ...state, ...action.payload }),
    setSelectedRegion: (state, action) => ({
      ...state,
      selectedRegion: action.payload,
    }),
    setSelectedTime: (state, action) => ({
      ...state,
      selectedTime: action.payload,
    }),
  },
};
