import { client, gql } from "../../utils/request";

export const getNews = (region, date) =>
  client.query({
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
