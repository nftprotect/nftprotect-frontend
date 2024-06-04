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

export enum NFTPTokenStandard {
    ERC721,
    ERC1155,
    ERC20
}

const useNftProtect = (chainId: number) => {

    const publicClient = usePublicClient({chainId})
    const {data: walletClient} = useWalletClient({chainId})  
    const address = useMemo(() => {
        return supportedChains.find(it => it.id === chainId)?.nftpContractAddress as `0x${string}`
    }, [chainId])

    const getPublicContractInstance = (contractAddress: `0x${string}`) => {
        if (!publicClient) {
            throw new Error('Public client not configured')
        }
        return getContract({
            address,
            abi: NFTProtectABI,
            client: publicClient
        });
    }

    const getWalletContractInstance = (contractAddress: `0x${string}`) => {
        if (!walletClient) {
            throw new Error('Wallet client not configured')
        }
        return getContract({
            address,
            abi: NFTProtectABI,
            client: walletClient
        });
    }

    /**
     * Fetches the request.
     * @param requestId The request ID.
     * @returns Request data.
     */
    const getRequest = async (requestId: BigNumber|bigint|string): Promise<ActionRequest|null> => { // TODO: use bigint
        const contract = getPublicContractInstance(address)
        const result = await contract.read.requests([requestId.toString()]) as Array<any>
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

    /**
     * Fetches the request by token ID.
     * @param tokenId The token ID.
     * @returns Request data.
     */
    const getRequestByTokenId = async (tokenId: BigNumber|bigint|string): Promise<ActionRequest|null> => {
        const contract = getPublicContractInstance(address)
        let requestId
        requestId = await contract.read.tokenToRequest([tokenId.toString()]) as bigint
        return (requestId && requestId > BigInt(0)) ? getRequest(requestId.toString()) : null
    }

    /**
     * Fetches the owner address of the pNFT.
     * @param tokenId The token ID of the pNFT.
     * @returns The owner address.
     */
    const getOwnerAddress = async (tokenId: BigNumber|bigint|string): Promise<`0x${string}`> => {
        const contract = getPublicContractInstance(address)
        const ownerAddress = await contract.read.ownerOf([tokenId.toString()])
        return ownerAddress as `0x${string}`
    }
    
    /**
     * Fetches the original NFT data for pNFT.
     * @param tokenId The token ID of the pNFT.
     * @returns The original NFT data.
     */
    const getOriginalNFTData = async (tokenId: BigNumber|bigint|string): Promise<OriginalNFTData> => {
        const contract = getPublicContractInstance(address)
        let result
        result = await contract.read.tokens([tokenId.toString()]) as Array<any>
        const [
            standardId, 
            contractAddress, 
            tokenIdR, 
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
            case NFTPTokenStandard.ERC721:
                nftData.tokenType = NftTokenType.ERC721;
                break;
            case NFTPTokenStandard.ERC1155:
                nftData.tokenType = NftTokenType.ERC1155;
                break;
            default:
                nftData.tokenType = NftTokenType.NO_SUPPORTED_NFT_STANDARD;
                break;
        }

        return nftData;
    }

    const protect = async (
        tokenStandard: NFTPTokenStandard,
        contractAddress: `0x${string}`,
        tokenId: BigNumber|bigint|string,
        amount: BigNumber|bigint|string|number,
        user: `0x${string}`,
        referrerAddress: `0x${string}`,
        value: BigNumber|bigint|string|number
    ) => {
        //  debugger;
        const contract = getWalletContractInstance(address)
        const {request} = await contract.simulate.protect(
            [tokenStandard, contractAddress, BigInt(tokenId.toString()), BigInt(amount.toString()), user, referrerAddress],
            {
                value: BigInt(value.toString())
            },
        )
        return await walletClient!.writeContract(request)
    };

    const burn = async (
        tokenId: BigNumber|bigint|string,
        destination: `0x${string}`,
        signature: string
    ) => {
        //  debugger;
        const contract = getWalletContractInstance(address)
        const {request} = await contract.simulate.burn(
            [tokenId, destination, signature]
        )
        return await walletClient!.writeContract(request)
    };

    return {
        getRequest,
        getRequestByTokenId,
        getOwnerAddress,
        getOriginalNFTData,
        protect,
        burn
    }
};

export default useNftProtect;
