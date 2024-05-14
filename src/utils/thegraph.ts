import { ApolloClient, InMemoryCache, NormalizedCacheObject, gql, DefaultOptions } from "@apollo/client";

interface GraphData {
    uri: string;
    client: ApolloClient<NormalizedCacheObject>;
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
};

class GraphManager {
    private graphs: Array<GraphData> = [];

    public async performQuery(graphURI: string, query: string, variables: any) {
        let graph = this.graphs.find(({ uri }) => uri === graphURI);
        if (!graph) {
            graph = this.createGraph(graphURI);
        }
        const result = await graph.client.query({
            query: gql(query),
            variables,
        });
        console.log('GRAPH RETURNS', result);
        return result;
    }

    private createGraph(graphURI: string): GraphData {
        const client = new ApolloClient({
            uri: graphURI,
            cache: new InMemoryCache(),
            defaultOptions: defaultOptions,
        });
        const graphData: GraphData = { uri: graphURI, client };
        this.graphs.push(graphData);
        return graphData;
    }
}

export const graphManager = new GraphManager();