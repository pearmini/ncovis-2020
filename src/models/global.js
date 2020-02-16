import regionOptions from "../assets/data/region_options.json";
export default {
  namespace: "global",
  state: {
    selectedPlatform: "weibo",
    selectedRegion: "全国",
    selectedDate: null,
    selectedTime: null,
    regionOptions,
    options: {
      platform: [
        {
          name: "微博",
          value: "weibo",
          id: 1
        },
        {
          name: "知乎",
          value: "zhihu",
          id: 2
        }
      ],
      region: [
        {
          name: "全国",
          value: "all",
          id: 1
        }
      ]
    }
  },
  reducers: {
    setSelectedRegion(state, action) {
      const { value } = action.payload;
      return { ...state, selectedRegion: value };
    },
    setSelectedPlatform(state, action) {
      const { value } = action.payload;
      return { ...state, selectedPlatform: value };
    }
  }
};
