import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";

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

export const getNcov = (country = "中国") =>
  client.query({
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

export const getAllCountry = () =>
  client.query({
    query: gql`
      {
        ncov(date: "2020-04-07") {
          country
        }
      }
    `,
  });
