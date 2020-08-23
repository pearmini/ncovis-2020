import { client, gql } from "../../utils/request";

export const get = () =>
  client.query({
    query: gql`
      {
        ncovOverall {
          time
          confirmed
          confirmedIncr
          cured
          curedIncr
          deadIncr
          dead
          remainingConfirmed
          remainingConfirmedIncr
          global {
            confirmed
            confirmedIncr
            cured
            curedIncr
            deadIncr
            dead
            remainingConfirmed
            remainingConfirmedIncr
          }
        }
      }
    `,
  });
