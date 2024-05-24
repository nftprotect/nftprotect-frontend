import { useClient, useWalletClient } from 'wagmi';
import NFTProtectABI from '../abi/NFTProtectABI';
import { Client, getContract } from 'viem';
import { useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber'
import { supportedChains } from '../config';
import { ReqStatus } from './useNftProtectGraph';

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

    const getRequest = async (requestId: BigNumber): Promise<ActionRequest|null> => { // TODO: use bigint
        if (!contract) {
            throw new Error('Client not configured')
        }
        const result = await contract.read.requests([requestId.toString()])
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

    return {
        getRequest
    }
};

export default useNftProtect;
