import { ApolloClient, InMemoryCache } from "@apollo/client";
import { graphURI } from "./config";

const graphClient = new ApolloClient({
    uri: graphURI,
    cache: new InMemoryCache(),
});

export default graphClient;