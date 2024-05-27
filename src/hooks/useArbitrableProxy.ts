import { useClient, usePublicClient, useWalletClient } from 'wagmi';
import { Abi, GetContractReturnType, getContract } from 'viem';
import { useMemo, useRef } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { supportedChains, maxBlocksPerRequest } from '../config';
import ArbitrableProxyABI from '../abi/ArbitrableProxyABI';
import KlerosLiquidABI from '../abi/KlerosLiquidABI';
import { useBlockNumber } from 'wagmi';
import { Period } from './useArbitratorGraph';
import ArbitratorRegistryABI from '../abi/ArbitratorRegistryABI';

export interface EvidenceSubmission {
    evidenceURI: string,
    submittedBy: string,
    blockNumber: number
}

interface ContractsHolder {
    arbitratorId: number,
    arbitrableProxy?: GetContractReturnType,
    arbitrator?: GetContractReturnType
}

export interface DisputePeriodData {
    period: Period,
    lastPeriodChange: Date
}

export const useArbitrableProxy = (chainId: number) => {
    const { data: walletClient } = useWalletClient({ chainId });
    const publicClient = usePublicClient({ chainId })
    const { data: currentBlock } = useBlockNumber({ chainId });

    const contracts = useMemo(() => new Map<number, ContractsHolder>(), [chainId]);

    const loadArbitrableProxy = async (arbitratorId: number) => {
        const arbRegistryAddress = supportedChains.find(it => it.id === chainId)?.arbRegistryContractAddress;
        if (!arbRegistryAddress) throw new Error('Arbitrator registry contract address not found');

        const arbRegistryContract = getContract({
            address: arbRegistryAddress as `0x${string}`,
            abi: ArbitratorRegistryABI as Abi,
            client: {wallet: walletClient, public: publicClient!}
        });

        const result = await arbRegistryContract.read.arbitrators([arbitratorId.toString()]) as any;
        const arbitrableProxyAddress = result[1] as `0x${string}`;
        return getContract({
            address: arbitrableProxyAddress ,
            abi: ArbitrableProxyABI as Abi,
            client: {wallet: walletClient, public: publicClient!}
        });
    };

    const loadArbitrator = async (arbitrableProxy: GetContractReturnType) => {
        const arbitratorAddress = await (arbitrableProxy as any).read.arbitrator();
        return getContract({
            address: arbitratorAddress as `0x${string}`,
            abi: KlerosLiquidABI as Abi,
            client: {wallet: walletClient, public: publicClient!}
        });
    };

    const getArbitrableProxy = async (arbitratorId: number) => {
        let holder = contracts.get(arbitratorId);
        if (!holder?.arbitrableProxy) {
            const newHolder: ContractsHolder = holder || { arbitratorId };
            newHolder.arbitrableProxy = await loadArbitrableProxy(arbitratorId);
            contracts.set(arbitratorId, newHolder);
            holder = newHolder;
        }
        if (holder?.arbitrableProxy) {
            return holder.arbitrableProxy;
        } else {
            throw new Error(`Unable to load arbitrableProxy for arbitratorId ${arbitratorId}`);
        }
    };

    const getArbitrator = async (arbitratorId: number) => {
        const arbitrableProxy = await getArbitrableProxy(arbitratorId);
        let holder = contracts.get(arbitratorId);
        if (!holder) {
            throw new Error(`Unable to load arbitrableProxy for arbitratorId ${arbitratorId}`);
        }
        if (!holder.arbitrator) {
            holder.arbitrator = await loadArbitrator(arbitrableProxy);
        }
        if (holder.arbitrator) {
            return holder.arbitrator;
        } else {
            throw new Error(`Unable to load arbitrator for arbitratorId ${arbitratorId}`);
        }
    };

    const listEvidences = async (
        arbitratorId: number,
        internalDisputeId: BigNumber,
        blockNumber: number
    ): Promise<EvidenceSubmission[]> => {
        const contract = await getArbitrableProxy(arbitratorId);
        const startBlock = blockNumber;
        const endBlock = Number(currentBlock) || startBlock;
        const ranges = [];
        let i = startBlock;
        do {
            let j = i + maxBlocksPerRequest;
            ranges.push({
                rangeStart: i,
                rangeEnd: ((j - 1) <= endBlock) ? (j - 1) : endBlock
            });
            i = j;
        } while (i - 1 < endBlock);
        
        //const filter = contract.filters.Evidence(null, internalDisputeId);
        const promises = ranges.map(({ rangeStart, rangeEnd }) => {
            //return contract.queryFilter(filter, rangeStart, rangeEnd);
            return publicClient!.getLogs({
                address: contract.address,
                event: {
                    name: "Evidence",
                    type: "event",
                    inputs: [
                        { type: 'address', indexed: true, name: '_arbitrator' },
                        { type: 'uint256', indexed: true, name: '_evidenceGroupID' },
                        { type: 'address', indexed: true, name: '_party' },
                        { type: 'string', indexed: false, name: '_evidence' }
                    ]
                },
                args: {
                    _evidenceGroupID: BigInt(internalDisputeId.toString()),
                },
                fromBlock: BigInt(rangeStart),
                toBlock: BigInt(rangeEnd)
            })
        });
        const allResults = await Promise.all(promises);
        const events = allResults.flat();
        const result: EvidenceSubmission[] = [];
        for (const event of events) {
            if (event.args) {
                result.push({
                    evidenceURI: event.args._evidence!,
                    submittedBy: event.args._party!,
                    blockNumber: Number(event.blockNumber) // TODO: use bigint
                });
            }
        }
        return result;
    };

    const getPeriod = async (
        arbitratorId: number,
        externalDisputeId: BigNumber,
    ): Promise<DisputePeriodData> => {
        const contract = await getArbitrator(arbitratorId);
        const { period, lastPeriodChange } = await (contract as any).read.disputes([externalDisputeId.toString()]);
        return {
            period,
            lastPeriodChange: new Date(lastPeriodChange * 1000)
        };
    };

    const isRuled = async (
        arbitratorId: number,
        internalDisputeId: BigNumber,
    ): Promise<boolean> => {
        const contract = await getArbitrableProxy(arbitratorId);
        const { isRuled } = await (contract as any).read.disputes([internalDisputeId.toString()]);
        return isRuled;
    };

    const submitEvidence = async (
        arbitratorId: number,
        localDisputeId: BigNumber,
        evidenceURI: string
    ): Promise<any> => {
        const contract = await getArbitrableProxy(arbitratorId);
        return (contract as any).write.submitEvidence([localDisputeId.toString(), evidenceURI]);
    };

    const executeRuling = async (
        arbitratorId: number,
        externalDisputeId: BigNumber,
    ): Promise<any> => {
        const contract = await getArbitrator(arbitratorId);
        return (contract as any).write.executeRuling([externalDisputeId.toString()]);
    };

    return {
        listEvidences,
        getPeriod,
        submitEvidence,
        isRuled,
        getArbitrableProxy,
        getArbitrator,
        executeRuling
    };
};