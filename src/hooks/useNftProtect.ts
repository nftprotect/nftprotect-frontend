import { usePublicClient, useWalletClient } from 'wagmi';
import NFTProtectABI from '../abi/NFTProtectABI';
import { getContract } from 'viem';
import { useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber'
import { supportedChains } from '../config';
import { NftTokenType } from 'alchemy-sdk';

export interface ActionRequest {
    id: BigNumber,
    reqtype: ReqType,
    tokenId: BigNumber,
    newowner: string,
    timeout: BigNumber,
    status: ReqStatus,
    arbitratorId: number,
    localDisputeId: BigNumber,
    externalDisputeId: BigNumber,
    metaevidence: number
}

export interface OriginalNFTData {
    ownerAddress: string,
    tokenId: string,
    contractAddress: string,
    tokenType: NftTokenType
    amount: number,
    nonce: number     //** Holds nonce for signing purposes */
}

export enum ReqType {
    OwnershipAdjustment,
    OwnershipRestore,
    Burn
}

export enum ReqStatus {
    Initial,
    Accepted,
    Rejected,
    Disputed
}

const useNftProtect = (chainId: number) => {

    const publicClient = usePublicClient({chainId})
    const {data: walletClient} = useWalletClient({chainId})  

    const contract = useMemo(() => {
        const address = supportedChains.find(it => it.id === chainId)?.nftpContractAddress
        return publicClient && address ? getContract({
            address: address as `0x${string}`,
            abi: NFTProtectABI,
            client: {wallet: walletClient, public: publicClient}
        }) : null
    }, [publicClient, walletClient])

    /**
     * Fetches the request.
     * @param requestId The request ID.
     * @returns Request data.
     */
    const getRequest = async (requestId: BigNumber|bigint|string): Promise<ActionRequest|null> => { // TODO: use bigint
        if (!contract) {
            throw new Error('Client not configured')
        }
        let result
        try {
            result = await contract.read.requests([requestId.toString()])
        } catch (e: any) {
            console.error(`Failed fetching request ${requestId.toString()}`, e)
            return null
        }
        if (Array.isArray(result)) {
            const [
                reqtype,
                tokenId,
                newowner,
                timeout,
                status,
                arbitratorId,
                localDisputeId,
                externalDisputeId,
                metaevidence
            ] = result;
            return {
                id: BigNumber.from(requestId.toString()),
                reqtype: reqtype as ReqType,
                tokenId: BigNumber.from(tokenId.toString()),
                newowner,
                timeout: BigNumber.from(timeout.toString()),
                status: status as ReqStatus,
                arbitratorId: Number(arbitratorId),
                localDisputeId: BigNumber.from(localDisputeId.toString()),
                externalDisputeId: BigNumber.from(externalDisputeId.toString()),
                metaevidence
            }
        }
        return null
    }

    /**
     * Fetches the request by token ID.
     * @param tokenId The token ID.
     * @returns Request data.
     */
    const getRequestByTokenId = async (tokenId: BigNumber|bigint|string): Promise<ActionRequest|null> => {
        if (!contract) {
            throw new Error('Client not configured')
        }
        let requestId
        try {
            requestId = await contract.read.tokenToRequest([tokenId.toString()])
        } catch (e: any) {
            console.error(`Failed fetching request ID for token ${tokenId.toString()}`, e)
            return null
        }
        return requestId ? getRequest(requestId.toString()) : null
    }

    /**
     * Fetches the owner address of the pNFT.
     * @param tokenId The token ID of the pNFT.
     * @returns The owner address.
     */
    const getOwnerAddress = async (tokenId: BigNumber|bigint|string): Promise<`0x${string}`|null> => {
        if (!contract) {
            throw new Error('Client not configured')
        }
        try {
            const ownerAddress = await contract.read.ownerOf([tokenId.toString()])
            return ownerAddress as `0x${string}`
        } catch (e: any) {
            console.error(`Failed fetching token ${tokenId.toString()}`, e)
            return null
        }
    }
    
    /**
     * Fetches the original NFT data for pNFT.
     * @param tokenId The token ID of the pNFT.
     * @returns The original NFT data.
     */
    const getOriginalNFTData = async (tokenId: BigNumber|bigint|string): Promise<OriginalNFTData|null> => {
        if (!contract) {
            throw new Error('Client not configured')
        }
        let result
        try {
            result = await contract.read.tokens([tokenId.toString()])
        } catch (e: any) {
            console.error(`Failed fetching data for token ${tokenId.toString()}`, e)
            return null
        }
        if (Array.isArray(result)) {
            const [
                standardId, 
                contractAddress, 
                tokenId, 
                amount, 
                owner, 
                nonce
            ] = result;
            
            const nftData: OriginalNFTData = {
                tokenId: tokenId.toString(),
                amount: Number(amount),
                nonce: Number(nonce),
                contractAddress,
                ownerAddress: owner as string,
                tokenType: NftTokenType.NO_SUPPORTED_NFT_STANDARD
            };
            switch (standardId) {
                case 0: // Assuming 0 is ERC721
                    nftData.tokenType = NftTokenType.ERC721;
                    break;
                case 1: // Assuming 1 is ERC1155
                    nftData.tokenType = NftTokenType.ERC1155;
                    break;
                default:
                    nftData.tokenType = NftTokenType.NO_SUPPORTED_NFT_STANDARD;
                    break;
            }

            return nftData;
        }
        return null;
    }

    return {
        getRequest,
        getRequestByTokenId,
        getOwnerAddress,
        getOriginalNFTData
    }
};

export default useNftProtect;
