import { useContext } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";

export const useNftProtectGraph = (chainId: number) => {
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useNftProtectGraph has to be used within <AppContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const graphURI = nftProtectGraphs[chainId.toString()]

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
        return result
    }

    return {
        loadNFTPRequest
    }
        
}