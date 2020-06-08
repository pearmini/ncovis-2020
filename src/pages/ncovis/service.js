import { client, gql } from "../../utils/request";

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
