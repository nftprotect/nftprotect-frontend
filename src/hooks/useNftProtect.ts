import { useClient, useWalletClient } from 'wagmi';
import NFTProtectABI from '../abi/NFTProtectABI';
import { Client, getContract } from 'viem';
import { useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber'
import { supportedChains } from '../config';
import { ReqStatus } from './useNftProtectGraph';
import { NftTokenType } from 'alchemy-sdk';

export interface ActionRequest {
    id: BigNumber,
    reqtype: number,
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

const useNftProtect = (chainId: number) => {

    const client  = useClient({chainId}) // useClient is recommended by wagmi docs but is always undefined
    const {data: walletClient} = useWalletClient({chainId})  
    const currentClient = walletClient || client

    const contract = useMemo(() => {
        const address = supportedChains.find(it => it.id === chainId)?.nftpContractAddress
        return currentClient && address ? getContract({
            address: address as `0x${string}`,
            abi: NFTProtectABI,
            client: currentClient
        }) : null
    }, [currentClient])

    /**
     * Fetches the request.
     * @param requestId The request ID.
     * @returns Request data.
     */
    const getRequest = async (requestId: BigNumber): Promise<ActionRequest|null> => { // TODO: use bigint
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
                id: requestId,
                reqtype,
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
     * Fetches the owner address of the pNFT.
     * @param tokenId The token ID of the pNFT.
     * @returns The owner address.
     */
    const getOwnerAddress = async (tokenId: BigNumber): Promise<`0x${string}`|null> => {
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
    const getOriginalNFTData = async (tokenId: BigNumber): Promise<OriginalNFTData|null> => {
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
        getOwnerAddress,
        getOriginalNFTData
    }
};

export default useNftProtect;
