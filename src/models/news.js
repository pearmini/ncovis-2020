import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import "array-flat-polyfill";

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
    `,
  });
}

export default {
  namespace: "news",
  state: {
    newsByRegion: new Map(),
  },
  reducers: {
    addNews: (state, action) => {
      const { region, dataByDate } = action.payload;
      const { newsByRegion } = state;
      newsByRegion.set(region, dataByDate);
      return { ...state, newsByRegion };
    },
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
            fillingWords,
          },
        };
        const dataByDate = new Map([[date, data]]);
        yield put({
          type: "addNews",
          payload: { region, dataByDate },
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
