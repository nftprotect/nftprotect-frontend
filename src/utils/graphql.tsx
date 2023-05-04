import { ApolloClient, InMemoryCache, DefaultOptions } from "@apollo/client";
import { graphURI } from "./config";

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}

const graphClient = new ApolloClient({
    uri: graphURI,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});

export default graphClient;