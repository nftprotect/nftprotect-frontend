import { useContext } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";
import { TheGraphContext } from "../context/TheGraphContextProvider";

export const useNftProtectGraph = (chainId: number) => {
    const currentContext = useContext(TheGraphContext);
    if (!currentContext) {
        throw new Error(
            "useNftProtectGraph has to be used within <TheGraphContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const { uri: graphURI } = nftProtectGraphs.find( it => it.chainId === chainId ) || { uri: undefined }

    const checkURI = () => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId: ${chainId}`
            );
        }
    }

    const loadNFTPRequest = async (requestId: BigNumber) => {
        checkURI()
        if (graphURI) {
            const query = `
                query loadRequest($requestId: Bytes!) {
            }          
            `
            const result = await performQuery(graphURI, query, { requestId: requestId })
            return result
        }
    }

    return {
        loadNFTPRequest
    }
        
}