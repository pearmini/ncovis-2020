import regionOptions from "../assets/data/region_options.json";
import indexOf from "../utils/indexOf";
export default {
  namespace: "global",
  state: {
    selectedPlatform: "weibo",
    selectedRegion: "全国",
    selectedDate: null,
    selectedTime: 1581739201,
    selectedWords: [],
    selectedHots: [],
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
    },
    toggleHots(state, action) {
      const { item } = action.payload;
      const selectedWords = [...state.selectedWords];

      const cnt = selectedWords.reduce(
        (total, cur) => (cur.index === item.index ? total + 1 : total),
        0
      );
      if (cnt === item.words.length) {
        // 如果全选，就删除
        for (let index = selectedWords.length - 1; index >= 0; index--) {
          const word = selectedWords[index];
          if (word.index === item.index) {
            selectedWords.splice(index, 1);
          }
        }
      } else {
        // 否者就全选
        selectedWords.push(...item.words);
      }
      return { ...state, selectedWords };
    },
    toggleWords(state, action) {
      const { item } = action.payload;
      const selectedWords = [...state.selectedWords];

      const index = indexOf(
        selectedWords,
        item,
        (a, b) => a.index === b.index && a.text === b.text
      );

      if (index === -1) {
        selectedWords.push(item);
      } else {
        selectedWords.splice(index, 1);
      }
      return { ...state, selectedWords };
    }
  }
};
