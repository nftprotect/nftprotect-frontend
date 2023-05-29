import { useContext, createContext, useState } from "react";
import { NormalizedCacheObject, gql } from "@apollo/client"
import { ApolloClient, InMemoryCache, DefaultOptions } from "@apollo/client";

interface GraphData {
    uri: string,
    client: ApolloClient<NormalizedCacheObject>
}

export interface TheGraphContextInterface {
    performQuery: Function,
}

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

export const TheGraphContext = createContext<TheGraphContextInterface|null>(null);

export function TheGraphContextProvider({ children }:any) {

    const [ graphs, setGraphs ] = useState<Array<GraphData>>([])

    const performQuery = async (graphURI: string, query: string, variables: any) => {
        const { client } = graphs.find(({ uri }) => uri === graphURI) || { client: createGraph(graphURI) }
        const result = await client.query({
            query: gql(query),
            variables
        })
        console.log('GRAPH RETURNS', result)
        return result
    }

    const createGraph = (graphURI: string) => {
        const client = new ApolloClient({
            uri: graphURI,
            cache: new InMemoryCache(),
            defaultOptions: defaultOptions
        })
        setGraphs((graphs) => [...graphs, { uri: graphURI, client }]);
        return client
    }

    return (
        <TheGraphContext.Provider value={{
            performQuery
        }}>
            {children}
        </TheGraphContext.Provider>
    );
}