import { useContext, useEffect, useMemo, useRef } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { Contract } from "@ethersproject/contracts";
import ArbitrableProxyABI from "../abi/ArbitrableProxyABI";
import { maxBlocksPerRequest } from "../config";
import { BigNumber } from '@ethersproject/bignumber';
import KlerosLiquidABI from "../abi/KlerosLiquidABI";
import { timestampToDate } from "../utils/helpers";
import { Period } from "./useArbitratorGraph";
import { Web3Provider } from "@ethersproject/providers";

export interface EvidenceSubmission {
    evidenceURI: string,
    submittedBy: string,
    blockNumber: number
}

interface ContractsHolder {
    arbitratorId: number,
    arbitrableProxy?: Contract,
    arbitrator?: Contract
}

export interface DisputePeriodData {
    period: Period,
    lastPeriodChange: Date
}

export const useArbitrableProxy = () => {
    const currentContext = useContext(AppContext)
    if (!currentContext) {
        throw new Error(
            "useArbitrable has to be used within <AppContext.Provider>"
        );
    }
    const { currentChain, active, library, account, arbRegistryContract, currentBlock } = useAppContext()
    const contracts = useRef<ContractsHolder[]>([])

    const loadArbitrableProxy = async (arbitratorId: number) => {
        const [ arbitrableProxyAddress ] = await arbRegistryContract.arbitrator(arbitratorId)
        const contract = new Contract(
            arbitrableProxyAddress,
            ArbitrableProxyABI, 
            account && active ? library.getSigner(account) : library
        )
        return contract
    }

    const loadArbitrator = async (arbitrableProxy: Contract) => {
        const arbitratorAddress = await arbitrableProxy.arbitrator()
        const contract = new Contract(
            arbitratorAddress, 
            KlerosLiquidABI, 
            account && active ? library.getSigner(account) : library
        )
        return contract
    }

    const getArbitrableProxy = async (arbitratorId: number): Promise<Contract> => {
        let holder = contracts.current.find( (item) => item.arbitratorId === arbitratorId )
        if (!holder?.arbitrableProxy) {
            const newHolder: ContractsHolder = holder || { arbitratorId }
            newHolder.arbitrableProxy = await loadArbitrableProxy(arbitratorId)
            contracts.current.push(newHolder)
            holder = newHolder
        }
        if (holder?.arbitrableProxy) {
            return holder.arbitrableProxy
        } else {
            throw Error(`Unable to load arbitrableProxy for arbitratorId ${arbitratorId}`)
        }
        
    }

    const getArbitrator = async (arbitratorId: number) => {
        const arbitrableProxy = await getArbitrableProxy(arbitratorId)
        let holder = contracts.current.find( (item) => item.arbitratorId === arbitratorId )
        if (!holder) {
            throw Error(`Unable to load arbitrableProxy for arbitratorId ${arbitratorId}`)
        }
        if (!holder.arbitrator) {
            holder.arbitrator = await loadArbitrator(arbitrableProxy)
        }
        if (holder.arbitrator) {
            return holder.arbitrator
        } else {
            throw Error(`Unable to load arbitrator for arbitratorId ${arbitratorId}`)
        }
    }

    const listEvidences = async ( 
        arbitratorId: number, 
        internalDisputeId: BigNumber, 
        blockNumber: number
    ): Promise<EvidenceSubmission[]> => {
        const contract = await getArbitrableProxy(arbitratorId)
        const startBlock = blockNumber
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
        const filter = contract.filters.Evidence(null, internalDisputeId);
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

    const getPeriod = async ( 
        arbitratorId: number, 
        externalDisputeId: BigNumber, 
    ): Promise<DisputePeriodData> => {
        const contract = await getArbitrator(arbitratorId)
        const { period, lastPeriodChange } = await contract.disputes(externalDisputeId)
        return { 
            period, 
            lastPeriodChange: timestampToDate(lastPeriodChange)
        }
    }

    const isRuled = async ( 
        arbitratorId: number, 
        internalDisputeId: BigNumber, 
    ): Promise<boolean> => {
        const contract = await getArbitrableProxy(arbitratorId)
        const { isRuled } = await contract.disputes(internalDisputeId)
        return isRuled
    }

    const submitEvidence = async ( 
        arbitratorId: number, 
        localDisputeId: BigNumber,
        evidenceURI: string
    ): Promise<any> => {
        const contract = await getArbitrableProxy(arbitratorId)
        return contract.submitEvidence(localDisputeId, evidenceURI)
    }

    const executeRuling = async ( 
        arbitratorId: number, 
        externalDisputeId: BigNumber,
    ): Promise<any> => {
        const contract = await getArbitrator(arbitratorId)
        return contract.executeRuling(externalDisputeId)
    }

    useEffect(() => {
        contracts.current = []
    }, [active, currentChain])

    return {
        listEvidences,
        getPeriod,
        submitEvidence,
        isRuled,
        getArbitrableProxy,
        getArbitrator,
        executeRuling
    }
}