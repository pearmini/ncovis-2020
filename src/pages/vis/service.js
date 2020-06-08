import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";

const client = new ApolloClient({
  uri:
    "https://api.ncovis.mllab.cn/graphql?token=fuBwv4pYedUUaHycszp21pMmloRf1TQS",
});

export const get = () =>
  client.query({
    query: gql`
      {
        ncov(country: "中国") {
          date
        }
      }
    `,
  });
