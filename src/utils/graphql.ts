import { ApolloClient, InMemoryCache, DefaultOptions } from "@apollo/client";
import { dynamicArbRegistryGraphURI, NFTProtectGraphURI } from "./config";

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

export const dynamicArbRegistryGraph = new ApolloClient({
    uri: dynamicArbRegistryGraphURI,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});

export const NFTProtectGraph = new ApolloClient({
    uri: NFTProtectGraphURI,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});