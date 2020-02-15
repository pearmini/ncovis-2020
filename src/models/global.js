export default {
  namespace: "global",
  state: {
    selectedPlatform: 1,
    selectedRegion: 1,
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
    setSelectedKey(state, action) {
      const { type, id } = action.payload;
      const key = type === "platform" ? "selectedPlatform" : "selectedRegion";
      return { ...state, [key]: parseInt(id) };
    }
  }
};
