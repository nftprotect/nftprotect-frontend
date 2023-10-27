import { useContext } from "react";
import { dynamicArbRegistryGraphs } from "../config";
import { TheGraphContext } from "../context/TheGraphContextProvider";
import { useTheGraph } from "./useTheGraph";

export const useDyArbitratorGraph = (chainId: number) => {
    const currentContext = useContext(TheGraphContext)
    if (!currentContext) {
        throw new Error(
            "useDyArbitratorGraph has to be used within <TheGraphContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const { uri: graphURI } = dynamicArbRegistryGraphs.find( it => it.chainId === chainId ) || { uri: undefined }

    const checkAccount = (account: string) => {
        if (!account) {
            throw new Error(
                "Invalid account!"
            );
        }
    }

    const checkURI = () => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId: ${chainId}`
            );
        }
    }

    const loadDyArbitrators = async (account: string) => {
        checkURI()
        checkAccount(account)
        if (graphURI) {
            const query = `
                query GetAllArbitrators($managerAddress: Bytes!) {
                    requests(where: {status: InDispute, manager: $managerAddress}) {
                        id
                        name
                        disputeID
                        operation
                        manager
                    }
    
                    arbitrators(where: {manager: $managerAddress}) {
                        id
                        name
                        operations {
                            id
                            operation
                            extraData
                        }
                        contracts {
                            id
                            contract
                        }
                    }
                }          
            `
            const result = await performQuery(
                graphURI,
                query,
                { managerAddress: account }
            )
            console.log('GRAPH RETURNS', result)
            return result
        }
    }

    return {
        loadDyArbitrators
    }
        
}