import data from "../assets/data/news.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import formatDate from "../utils/formatDate";
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import regionTree from "../assets/data/region_options.json";

const d3 = {
  ...d3All,
  ...d3Array
};

function getNews() {
  const client = new ApolloClient({
    uri: "https://api.ncovis.mllab.cn:4431/graphql",
    headers: {}
  });
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

export default {
  namespace: "news",
  state: {
    dataByRegion: d3.map(),
    selectedDate: "2020-2-20",
    range: [],
    dataByDate: d3.map()
  },
  reducers: {
    init: (state, action) => ({ ...state, ...action.payload }),
    setSelectedDate: (state, action) => ({
      ...state,
      selectedDate: action.payload
    })
  },
  effects: {
    *getData(action, { call, put }) {
      try {
        const result = yield call(getNews);
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
          selectedDate = formatDate(new Date(range[1]));
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
