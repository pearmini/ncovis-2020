import regionOptions from "../assets/data/region_options.json";
import indexOf from "../utils/indexOf";
export default {
  namespace: "global",
  state: {
    selectedPlatform: "weibo",
    selectedRegion: "all",
    selectedDate: "2003-03-17",
    selectedTime: -631180800000,
    selectedType: "confirm",
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
      ]
    }
  },
  reducers: {
    setSelectedTime(state, action) {
      const { value } = action.payload;
      return { ...state, selectedTime: value };
    },
    setSelectedRegion(state, action) {
      const { value } = action.payload;
      return { ...state, selectedRegion: value };
    },
    setSelectedPlatform(state, action) {
      const { value } = action.payload;
      return { ...state, selectedPlatform: value };
    },
    setSelectedType(state, action) {
      const { type } = action.payload;
      return { ...state, selectedType: type };
    },
    setSelectedDate(state, action) {
      const { date } = action.payload;
      const selectedDate = `${date.getFullYear()}-${
        date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate()}`;
      return { ...state, selectedDate };
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
