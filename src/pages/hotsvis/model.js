import * as d3All from "d3";
import * as d3Array from "d3-array";
import cloud from "d3-cloud";
import "array-flat-polyfill";

import * as hotApi from "./service";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default {
  namespace: "hots",
  state: {
    dataByName: d3.map(),
    timeByName: d3.map(),
    wordsByTime: d3.map(),
    selectedWords: [],
    computingLayout: false,
  },
  reducers: {
    setComputingLayout(state, action) {
      return { ...state, computingLayout: action.payload };
    },
    setSelectedCountries(state, action) {
      const keys = action.payload;
      return { ...state, selectedCountries: keys };
    },
    addWords: (state, action) => {
      const { words, time } = action.payload;
      const { wordsByTime } = state;
      wordsByTime.set(time, words);
      return { ...state, wordsByTime };
    },
    setSelectedWords: (state, action) => ({
      ...state,
      selectedWords: action.payload,
    }),
    addTimeRange: (state, action) => {
      const { range, name } = action.payload;
      const { timeByName } = state;
      timeByName.set(name, range);
      return { ...state, timeByName };
    },
    updateDataByTime: (state, action) => {
      const { name, from, to } = action.payload;
      const { timeByName } = state;
      const oldRange = timeByName.get(name);
      const newRange = oldRange.map((d, i) => ({
        ...d,
        request: i >= from && i < to ? true : d.request,
      }));
      timeByName.set(name, newRange);
      return { ...state, timeByName };
    },
    addFrames: (state, action) => {
      const { name, listKeyframes, cloudsKeyframes } = action.payload;
      const { dataByName } = state;
      const value = dataByName.get(name);
      if (!value) {
        dataByName.set(name, {
          listKeyframes,
          cloudsKeyframes,
        });
      } else {
        const newListKeyframes = unique(
          [...value.listKeyframes, ...listKeyframes].sort(
            (a, b) => a[0] - b[0]
          ),
          (d) => d[0]
        );
        const newCloudsKeyframes = unique(
          [...value.cloudsKeyframes, ...cloudsKeyframes].sort(
            (a, b) => a[0] - b[0]
          ),
          (d) => d[0]
        );

        dataByName.set(name, {
          listKeyframes: newListKeyframes,
          cloudsKeyframes: newCloudsKeyframes,
        });
      }

      return { ...state, dataByName, computingLayout: false };
    },
  },
  effects: {
    *getWords(action, { call, put }) {
      try {
        const { time, name, title } = action.payload;
        const data = yield call(hotApi.getWordsOfTopics, { name, time });
        const words = data.data[name].data[0].topics;
        const wordsWithLayout = yield call(computePreFramesWordsCloud, words);
        const selectedWords = wordsWithLayout.find((d) => d.title === title);
        const keywords = selectedWords ? selectedWords.keywords : [];
        yield put({ type: "addWords", payload: { wordsWithLayout, time } });
        yield put({ type: "setSelectedWords", payload: keywords });
      } catch (e) {
        console.error(e);
      }
    },
    *getTime(action, { call, put }) {
      try {
        const { name } = action.payload;
        const timeData = yield call(hotApi.getTimeRange, name);
        const range = timeData.data[name].data
          .map(({ time }) => time * 1000)
          .map((d) => ({ time: d, request: false }))
          .sort((a, b) => a.time - b.time);

        yield put({ type: "addTimeRange", payload: { range, name } });
      } catch (e) {
        console.error(e);
      }
    },
    *getData(action, { call, put }) {
      const { name, interval, tick, limit, start } = action.payload;
      try {
        yield put({ type: "setComputingLayout", payload: true });
        const result = yield call(hotApi.getHots, {
          name,
          from: ((tick.time / 1000) | 0) - 1, // 这里的 from 是大于当前时刻，所以需要减少 1
          limit: limit + 1,
        });
        const data = combine(result.data[name].data);
        const { listKeyframes, wordsKeyframes } = preprocess(
          data,
          start,
          interval
        );
        const cloudsKeyframes = yield call(
          computeFramesWordCloud,
          wordsKeyframes
        );

        yield put({
          type: "addFrames",
          payload: { name, listKeyframes, cloudsKeyframes },
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};

function combine(data) {
  return data.map(({ time, topics }) => {
    const keywords = topics.flatMap((t, index) =>
      t.keywords.map((k) => ({
        title: t.title,
        weight: k.weight * (1 - index * 0.05),
        name: k.name,
      }))
    );
    return { time, keywords: Array.from(new Set(keywords)), topics };
  });
}

function words(data, n = 20) {
  const w = new Set([
    "没有",
    "知道",
    "可能",
    "觉得",
    "时候",
    "应该",
    "还有",
    "出来",
    "需要",
    "事情",
    "大家",
    "还有",
    "看到",
  ]);
  return data
    .map((d) => ({
      text: d.name,
      value: d.weight || d.value,
    }))
    .filter((d) => !w.has(d.text))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

function computeWordCloud(data, get) {
  return new Promise((resolve) => {
    cloud()
      .size([900, 600])
      .words(data)
      .padding(5)
      .rotate(0)
      .fontSize((d) => Math.sqrt(d.value) * 80)
      .on("end", (words) => resolve(get(words)))
      .start();
  });
}

function computePreFramesWordsCloud(data) {
  return Promise.all(
    data.map(({ keywords, title }) =>
      computeWordCloud(words(keywords), (words) => ({
        keywords: words,
        title,
      }))
    )
  );
}

function computeFramesWordCloud(data) {
  return Promise.all(
    data.map(([date, d]) =>
      computeWordCloud(words(d), (words) => [date, words])
    )
  );
}

function preprocess(raw, start, interval) {
  const data = raw.map(({ time, ...rest }) => ({ time: time * 1000, ...rest }));
  const range = d3.extent(data, (d) => d.time);
  const begin = start + (((range[0] - start) / interval) | 0) * interval;
  const end = begin + Math.ceil((range[1] - begin) / interval) * interval + 1;
  const listTicks = d3.range(begin, end, interval);
  const wordTicks = d3.range(begin, end, interval * 5);
  const words = new Set(data.flatMap((d) => d.keywords.map((d) => d.name)));
  const topics = new Set(data.flatMap((d) => d.topics.map((d) => d.title)));

  const datewords = Array.from(
    d3.rollup(
      data,
      ([d]) =>
        d3.rollup(
          d.keywords,
          ([{ weight }]) => weight,
          (d) => d.name
        ),
      (d) => d.time
    )
  );

  const datetopics = Array.from(
    d3.rollup(
      data,
      ([d]) =>
        d3.rollup(
          d.topics,
          ([{ heat }]) => heat,
          (d) => d.title
        ),
      (d) => d.time
    )
  ).sort(([a], [b]) => a - b);

  return {
    listKeyframes: listTicks
      .map((tick) => interploate(datetopics, topics, tick))
      .map(([date, data]) => [
        date,
        data.map((d, index) => ({ ...d, rank: index })).slice(0, 10),
      ]),
    wordsKeyframes: wordTicks.map((tick) =>
      interploate(datewords, words, tick)
    ),
  };
}

function interploate(data, names, time) {
  const bisect = d3.bisector((d) => d[0]).left;
  const i = bisect(data, time, 0, data.length - 1),
    a = data[i];
  if (!i) return [time, interpolateValues(names, (key) => a[1].get(key))];

  const b = data[i - 1],
    t = (time - a[0]) / (b[0] - a[0]);
  return [
    time,
    interpolateValues(names, (key) => {
      const v1 = a[1].get(key) || 0;
      const v2 = b[1].get(key) || 0;
      return v1 * (1 - t) + v2 * t;
    }),
  ];
}

function interpolateValues(names, value) {
  const data = Array.from(names, (name) => ({
    name,
    value: value(name) || 0,
  }));
  data.sort((a, b) => d3.descending(a.value, b.value));
  return data;
}

function unique(data, key) {
  return data
    .map((d, index) => {
      if (index === 0 || key(data[index - 1]) !== key(d)) return [...d, true];
      else return [...d, false];
    })
    .filter((d) => d[2])
    .map(([date, data]) => [date, data]);
}
