import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache({});

(async () =>
  await persistCache({
    cache,
    storage: window.localStorage,
    maxSize: false,
  }))();

const client = new ApolloClient({
  cache,
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS",
});

export { client, gql };
