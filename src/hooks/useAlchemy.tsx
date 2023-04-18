import { createContext, useContext } from "react";
import { Alchemy } from "alchemy-sdk";
import { AppContext, useAppContext } from "../context/AppContextProvider";

export interface AlchemyContextInterface {
    alchemy: Alchemy,
}

const alchemyFetch = async (alchemyChainId: string, method: string, params: any) => {
    const response = await fetch('http://localhost:3000/api/alchemy/alchemy', {
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

export function useAlchemy() {
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useAlchemyContext has to be used within <AppContext.Provider>"
        );
    }

    const { currentChain } = useAppContext()

    const checkChain = () => {
        if (!currentChain) {
            throw new Error(
                "Invalid chain!"
            );
        }
    }

    return {
        getBlockNumber: async () => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'core.getBlockNumber', {})
        },
        getNftsForOwner: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftsForOwner', params)
        },
        getNftMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftMetadata', params)
        },
        getNftMetadataBatch: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftMetadataBatch', params)
        },
        refreshNftMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.refreshNftMetadata', params)
        },
        searchContractMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.searchContractMetadata', params)
        },
        getNftsForOwnerIterator: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftsForOwnerIterator', params)
        },
        getNftsForContractIterator: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftsForContractIterator', params)
        },
        getContractMetadata: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getContractMetadata', params)
        },
        getNftsForContract: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getNftsForContract', params)
        },
        getMintedNfts: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getMintedNfts', params)
        },
        getOwnersForNft: async (params: any) => {
            checkChain();
            return await alchemyFetch(currentChain.alchemyId, 'nft.getOwnersForNft', params)
        },
    };
}