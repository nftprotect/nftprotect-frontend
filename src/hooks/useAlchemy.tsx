import { createContext, useContext } from "react";
import { Alchemy, GetTransfersForContractOptions, GetTransfersForOwnerOptions, GetTransfersForOwnerTransferType, NftMetadataBatchOptions, NftMetadataBatchToken, TransfersNftResponse } from "alchemy-sdk";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { NftTokenType, BigNumberish, Nft } from "alchemy-sdk";

export interface AlchemyContextInterface {
    alchemy: Alchemy,
}

const alchemyFetch = async (alchemyChainId: string, method: string, params: any) => {
    const response = await fetch('/api/alchemy/alchemy', {
        method: "POST",
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            network: alchemyChainId,
            method: method,
            params: params
        })
    })
    return response.json()
}

export function useAlchemy(alchemyChainId?: string) {
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useAlchemyContext has to be used within <AppContext.Provider>"
        );
    }

    const { currentChain } = useAppContext()
    const chainId = alchemyChainId || currentChain?.alchemyId

    const checkChain = () => {
        if (!chainId) {
            throw new Error(
                "Invalid chain!"
            );
        }
    }

    return {
        getBlockNumber: async () => {
            checkChain();
            return await alchemyFetch(chainId, 'core.getBlockNumber', {})
        },
        getNftsForOwner: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftsForOwner', params)
        },
        getNftMetadata: async (params: [
            contractAddress: string, 
            tokenId: BigNumberish, 
            tokenType?: NftTokenType | undefined, 
            tokenUriTimeoutInMs?: number | undefined
        ]): Promise<Nft> => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftMetadata', params)
        },
        getNftMetadataBatch: async (params: [
            tokens: NftMetadataBatchToken[],
            options?: NftMetadataBatchOptions
        ]): Promise<Nft[]> => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftMetadataBatch', params)
        },
        refreshNftMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.refreshNftMetadata', params)
        },
        searchContractMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.searchContractMetadata', params)
        },
        getNftsForOwnerIterator: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftsForOwnerIterator', params)
        },
        getNftsForContractIterator: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftsForContractIterator', params)
        },
        getContractMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getContractMetadata', params)
        },
        getNftsForContract: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getNftsForContract', params)
        },
        getMintedNfts: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getMintedNfts', params)
        },
        getOwnersForNft: async (params: any) => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getOwnersForNft', params)
        },
        getTransfersForContract: async (params: [
            contract: string,
            options?: GetTransfersForContractOptions
        ]) : Promise<TransfersNftResponse> => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getTransfersForContract', params)
        },
        getTransfersForOwner: async (params: [
            owner: string,
            category?: GetTransfersForOwnerTransferType,
            options?: GetTransfersForOwnerOptions
        ]) : Promise<TransfersNftResponse> => {
            checkChain();
            return await alchemyFetch(chainId, 'nft.getTransfersForOwner', params)
        },
    };
}