import { ApolloClient, InMemoryCache } from "@apollo/client";

const graphClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/DyArbitratorRegistry",
  cache: new InMemoryCache(),
});

export default graphClient;