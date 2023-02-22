import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

import { graphUrl } from "./constant";

const link = new HttpLink({ uri: graphUrl });

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache
});

//test
// const query = gql`
//   {
//     orders(first: 3) {
//       id
//       tokenAddress
//       amount
//       sender {
//         id
//       }
//     }
//   }
// `;

// client.query({ query }).then((res) => {
//   console.log(res);
// });

export default client;
