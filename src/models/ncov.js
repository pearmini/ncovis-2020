import regionTree from "../assets/data/region_options.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import "array-flat-polyfill";
import { formTree } from "../utils/tree";

const d3 = {
  ...d3All,
  ...d3Array,
};

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

function getNcov(country = "中国") {
  return client.query({
    query: gql`
      {
        ncov(country:"${country}") {
          date
          confirmed
          dead
          cured
          region
        }
      }
    `,
  });
}

function getAllCountry() {
  return client.query({
    query: gql`
      {
        ncov(date: "2020-04-07") {
          country
        }
      }
    `,
  });
}

function preprocess(data, days, country = "中国") {
  const root = d3.hierarchy(regionTree);
  const regionvalues = d3
    .rollups(
      data,
      ([d]) => d,
      (d) => d.region,
      (d) => d.date
    )
    .filter(([region]) => region !== "中国") // 这里有点奇怪
    .map(([region, data]) => [
      region,
      data.sort((a, b) => new Date(a[0]) - new Date(b[0])),
    ])
    .map(([region, data]) => [
      region,
      days.map((d) => interpolateValues(data, d)),
    ]);

  if (country === "中国") {
    root.eachAfter((node) => {
      if (!node.children) return;
      const newRegion = sum(
        node.children.map((d) => d.data.title),
        regionvalues,
        node.data.title,
        days
      );
      regionvalues.push(newRegion);
    });
  }

  return regionvalues.flatMap(([, data]) => data);
}

function interpolateValues(values, date) {
  const bisect = d3.bisector(([time]) => new Date(time)).left;
  const i = bisect(values, new Date(date), 0, values.length - 1),
    a = values[i];
  if (!i)
    return {
      region: a[1].region,
      date,
      data: {
        confirmed: a[1].confirmed,
        dead: a[1].dead,
        cured: a[1].cured,
      },
    };
  const b = values[i - 1],
    t = (new Date(date) - new Date(a[0])) / (new Date(b[0]) - new Date(a[0]));

  const interpolate = (key) => Math.ceil(a[1][key] * (1 - t) + b[1][key] * t);
  return {
    region: b[1].region,
    date,
    data: {
      confirmed: interpolate("confirmed"),
      dead: interpolate("dead"),
      cured: interpolate("cured"),
    },
  };
}

function sum(regions, values, title, days) {
  const data = days.map((day) => ({
    region: title,
    date: day,
    data: {
      confirmed: 0,
      cured: 0,
      dead: 0,
    },
  }));

  const dataByDate = d3.rollup(
    data,
    ([d]) => d,
    (d) => d.date
  );
  for (let r of regions) {
    const [, value] = values.find(([region]) => region === r);
    for (let { date, data } of value) {
      const d = dataByDate.get(date);
      d.data.confirmed += data.confirmed;
      d.data.cured += data.cured;
      d.data.dead += data.dead;
    }
  }
  return [title, data];
}

function* getCountryData(action, { call, put }) {
  const { country, total, dataByDate, dataByRegion } = action.payload;
  const result = yield call(getNcov, country);
  const ncov = result.data.ncov;
  const data = preprocess(ncov, total, country);
  const countryByDate = d3.rollup(
    data,
    ([d]) => d.data,
    (d) => d.date
  );
  const countryByRegion = d3.rollup(
    data,
    ([d]) => d,
    (d) => d.region,
    (d) => d.date
  );

  for (let [key, value] of dataByDate.entries()) {
    const d = countryByDate.get(key);
    value.push({ region: country, data: d });
    dataByDate.set(key, value);
  }

  dataByRegion.set(country, countryByRegion.get(country));

  yield put({
    type: "addCountryData",
    payload: {
      dataByDate,
      dataByRegion,
      country,
    },
  });
}
export default {
  namespace: "ncov",
  state: {
    dataByRegion: new Map(),
    dataByDate: new Map(),
    selectedDate: "2020-02-10",
    range: [],
    countries: [],
    widthData: new Set(),
    total: [],
    selectedCountries: [],
    treeData: d3.hierarchy({
      name: "empty",
      children: [],
    }),
  },
  reducers: {
    addCountryData(state, action) {
      const { dataByDate, dataByRegion, country } = action.payload;
      const { selectedCountries, widthData } = state;
      selectedCountries.push(country);
      widthData.add(country);
      return {
        ...state,
        dataByDate,
        dataByRegion,
        selectedCountries,
        treeData: d3.hierarchy(formTree(selectedCountries)),
      };
    },
    setSelectedCountries(state, action) {
      const { keys } = action.payload;
      return { ...state, selectedCountries: keys };
    },
    init(state, action) {
      return { ...state, ...action.payload };
    },
    setSelectedTime: (state, action) => ({
      ...state,
      selectedTime: action.payload,
    }),
    setSelectedDate: (state, action) => ({
      ...state,
      selectedDate: action.payload,
    }),
    setTreeData: (state, action) => ({
      ...state,
      treeData: action.payload,
    }),
  },
  effects: {
    getCountryData,
    *getData(action, { call, put }) {
      try {
        // 获得所有的城市列表
        const countryResult = yield call(getAllCountry);
        const countries = Array.from(
          new Set(
            countryResult.data.ncov
              .map((d) => d.country)
              .filter((d) => d !== "")
          )
        );

        // 获得中国的数据
        const country = "中国";
        const ncovResult = yield call(getNcov, country);
        const ncov = ncovResult.data.ncov;
        const total = Array.from(new Set(ncov.map((d) => d.date)));
        const data = preprocess(ncov, total, country),
          dataByRegion = d3.rollup(
            data,
            ([d]) => d,
            (d) => d.region,
            (d) => d.date
          ),
          range = d3.extent(total).map((d) => new Date(d)),
          dataByDate = d3.rollup(
            data,
            (data) =>
              data.map((d) => ({
                region: d.region,
                data: d.data,
              })),
            (d) => d.date
          ),
          selectedTime = new Date(range[0]).getTime(),
          selectedCountries = ["中国"],
          widthData = new Set(["中国"]),
          selectedDate = "2020-03-27",
          treeData = d3.hierarchy(formTree([country]));

        yield put({
          type: "init",
          payload: {
            dataByRegion,
            dataByDate,
            selectedDate,
            selectedTime,
            country,
            range,
            selectedCountries,
            total,
            widthData,
            countries,
            treeData,
          },
        });

        // 获得其他城市的数据
        const restCountries = action.payload;
        for (let country of restCountries) {
          yield call(
            getCountryData,
            {
              payload: {
                country,
                total,
                dataByDate,
                dataByRegion,
              },
            },
            { call, put }
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};
