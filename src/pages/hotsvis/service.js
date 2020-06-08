import { client, gql } from "../../utils/request";

export const getHots = ({ name, from, limit = 10 }) => {
  return client.query({
    query: gql`
      {
        ${name}(
          numWords:4
          limit:${limit}, 
          ${from ? `from:${from}` : ""}
        ){
          paging{
            total
            nextCursor
          }
          data {
            time
            topics {
              heat
              title
              keywords{
                name
                weight
              }
            }
          }
        }
      }
    `,
  });
};

export const getTimeRange = (platform = "zhihu") =>
  client.query({
    query: gql`{
      ${platform} {
        data{
          time
        }
      }
    }`,
  });

export const getWordsOfTopics = ({ name, time }) =>
  client.query({
    query: gql`
      {
        ${name}(
          time:${time}
        ){
          data {
            topics {
              keywords {
                name
                weight
              }
              heat
              title
            }
          }
        }
      }
    `,
  });
