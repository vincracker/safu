import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const link = new HttpLink({ uri: "https://api.studio.thegraph.com/query/39890/easysendcrypto/v0.0.5" });

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
