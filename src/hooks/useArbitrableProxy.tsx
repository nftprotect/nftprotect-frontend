import { useContext, useMemo } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { Contract } from "@ethersproject/contracts";
import ArbitrableProxyABI from "../abi/ArbitrableProxyABI";
import { nftpDeployBlockNumber } from "../utils/config";
import { maxBlocksPerRequest } from "../utils/config";
import { BigNumber } from '@ethersproject/bignumber';

export interface EvidenceSubmission {
    evidenceURI: string,
    submittedBy: string,
    blockNumber: number
}

export const useArbitrableProxy = () => {
    const currentContext = useContext(AppContext)
    if (!currentContext) {
        throw new Error(
            "useArbitrable has to be used within <AppContext.Provider>"
        );
    }
    const { currentChain, library, nftProtectContract, arbRegistryContract, currentBlock } = useAppContext()

    const listEvidences = async ( 
        arbitratorId: number, 
        disputeId: BigNumber, 
        blockNumber: number|undefined = undefined 
    ): Promise<EvidenceSubmission[]> => {
        const [ arbitrableProxyAddress ] = await arbRegistryContract.arbitrator(arbitratorId)
        const contract = new Contract(arbitrableProxyAddress, ArbitrableProxyABI, library)
        const startBlock = blockNumber || nftpDeployBlockNumber
        const endBlock = currentBlock || await library.getBlockNumber()
        const ranges = []
        let i = startBlock
        do {
            let j = i + maxBlocksPerRequest
            ranges.push({
                rangeStart: i,
                rangeEnd: ((j - 1) <= endBlock) ? (j - 1) : endBlock
            })
            i = j
        } while (i - 1 < endBlock)
        const filter = contract.filters.Evidence(null, disputeId);
        const promises = ranges.map(({rangeStart, rangeEnd}) => {
            return contract.queryFilter(filter, rangeStart, rangeEnd)
        })
        const allResults = await Promise.all(promises)
        const events = allResults.flat()

        const result:EvidenceSubmission[] = []
        for (const event of events) {
            if (event.args) {
                result.push({
                    evidenceURI: event.args._evidence,
                    submittedBy: event.args._party,
                    blockNumber: event.blockNumber
                })
            }
        }
        return result
    }

    return {
        listEvidences
    }
}