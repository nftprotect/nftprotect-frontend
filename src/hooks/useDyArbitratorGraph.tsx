import { useContext } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { BigNumber } from '@ethersproject/bignumber'
import { dynamicArbRegistryGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";

export const useDyArbitratorGraph = (chainId: number) => {
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useNftProtectGraph has to be used within <AppContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const graphURI = dynamicArbRegistryGraphs[chainId.toString()]

    const loadNFTPRequest = async (requestId: BigNumber) => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId: ${chainId}`
            );
        }
        const query = `
            query loadRequest($requestId: Bytes!) {
        }          
        `
        const result = await performQuery(graphURI, query, { requestId: requestId })
        console.log('GRAPH RETURNS', result)
        return result
    }

    const { account, active } = useAppContext()

    const checkAccount= () => {
        if (!account) {
            throw new Error(
                "Invalid account!"
            );
        }
        if (!active) {
            throw new Error(
                "Invalid account!"
            );
        }
    }

    const loadDyArbitrators = async () => {
        checkAccount()
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

    return {
        loadDyArbitrators
    }
        
}