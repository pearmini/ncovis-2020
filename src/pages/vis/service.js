import { client, gql } from "../../utils/request";

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
