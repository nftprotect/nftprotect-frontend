import { useContext, useState } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { NormalizedCacheObject, gql } from "@apollo/client"
import { BigNumber } from '@ethersproject/bignumber'
import { ApolloClient, InMemoryCache, DefaultOptions } from "@apollo/client";

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

interface GraphData{
    uri: string,
    client: ApolloClient<NormalizedCacheObject>
}

export const useTheGraph = () => {

    const [ graphs, setGraphs ] = useState<Array<GraphData>>([])

    //TODO: needs actual bind to context
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useTheGraph has to be used within <AppContext.Provider>"
        );
    }

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

    return {
        performQuery
    }
        
}