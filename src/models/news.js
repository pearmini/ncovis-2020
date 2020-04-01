import regionTree from "../assets/data/region_options.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import "array-flat-polyfill";
import formatDate from "../utils/formatDate";

const d3 = {
  ...d3All,
  ...d3Array
};

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

function getNcov() {
  return client.query({
    query: gql`
      {
        ncov {
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

function getNews(region, date) {
  return client.query({
    query: gql`
      {
        news(region: "${region}", date: "${date}T16:00:00Z") {
          news {
            date
            tags {
              name
              count
            }
            keywords {
              name
              color
              fontSize
              transX
              transY
              fillX
              fillY
              rotate
            }
            fillingWords {
              name
              color
              fontSize
              transX
              transY
              fillX
              fillY
              rotate
            }
          }
        }
      }
    `
  });
}

export default {
  namespace: "news",
  state: {
    dataByRegion: new Map(),
    selectedDate: "",
    range: [],
    newsByRegion: new Map(),
    dataByDate: new Map()
  },
  reducers: {
    init: (state, action) => ({ ...state, ...action.payload }),
    addNews: (state, action) => {
      const { region, dataByDate } = action.payload;
      const { newsByRegion } = state;
      newsByRegion.set(region, dataByDate);
      return { ...state, newsByRegion };
    },
    setSelectedDate: (state, action) => ({
      ...state,
      selectedDate: action.payload
    })
  },
  effects: {
    *getNewsData(action, { call, put }) {
      try {
        // 这里要处理一下时间的问题
        const { region, date } = action.payload;
        const result = yield call(getNews, region, date);
        const { tags, keywords, fillingWords } = result.data.news.news[0];
        const data = {
          tags,
          words: {
            keywords,
            fillingWords
          }
        };
        const dataByDate = new Map([[date, data]]);
        yield put({
          type: "addNews",
          payload: { region, dataByDate }
        });
      } catch (e) {
        console.error(e);
      }
    },
    *getData(action, { call, put }) {
      try {
        const result = yield call(getNcov);
        const news = result.data.ncov;
        const data = preprocess(news),
          dataByRegion = d3.rollup(
            data,
            ([d]) => d,
            d => d.region,
            d => d.date
          ),
          range = d3.extent(data, d => new Date(d.date)),
          dataByDate = d3.rollup(
            data,
            data =>
              data.map(d => ({
                region: d.region,
                data: d.data
              })),
            d => d.date
          ),
          selectedDate = "2020-03-27";

        yield put({
          type: "init",
          payload: { dataByRegion, selectedDate, range, dataByDate }
        });

        function preprocess(data) {
          const days = Array.from(new Set(data.map(d => d.date)));
          const root = d3.hierarchy(regionTree);
          const regionvalues = d3
            .rollups(
              data,
              ([d]) => d,
              d => d.region,
              d => d.date
            )
            .filter(([region]) => region !== "中国") // 这里有点奇怪
            .map(([region, data]) => [
              region,
              data.sort((a, b) => new Date(a[0]) - new Date(b[0]))
            ])
            .map(([region, data]) => [
              region,
              days.map(d => interpolateValues(data, d))
            ]);

          root.eachAfter(node => {
            if (!node.children) return;
            const newRegion = sum(
              node.children.map(d => d.data.title),
              regionvalues,
              node.data.title,
              days
            );
            regionvalues.push(newRegion);
          });
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
                cured: a[1].cured
              }
            };
          const b = values[i - 1],
            t =
              (new Date(date) - new Date(a[0])) /
              (new Date(b[0]) - new Date(a[0]));

          const interpolate = key =>
            Math.ceil(a[1][key] * (1 - t) + b[1][key] * t);
          return {
            region: b[1].region,
            date,
            data: {
              confirmed: interpolate("confirmed"),
              dead: interpolate("dead"),
              cured: interpolate("cured")
            }
          };
        }

        function sum(regions, values, title, days) {
          const data = days.map(day => ({
            region: title,
            date: day,
            data: {
              confirmed: 0,
              cured: 0,
              dead: 0
            }
          }));

          const dataByDate = d3.rollup(
            data,
            ([d]) => d,
            d => d.date
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
      } catch (e) {
        console.error(e);
      }
    }
  }
};
