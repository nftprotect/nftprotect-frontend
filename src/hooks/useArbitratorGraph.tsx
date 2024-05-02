import { BigNumber } from '@ethersproject/bignumber'
import { arbitratorGraphs } from "../config";
import { capitalize, timestampToDate } from "../utils/helpers";
import { graphManager } from "../utils/thegraph";

export enum Period {
    Evidence,
    Commit,
    Vote, 
    Appeal,
    Execution
}

export interface DisputeGraphData {
    id: string,
    // arbitrable: {
    //     id
    // },
    // creator: {
    //     id
    // },
    // subcourtID: {
    //     id,
    //     subcourtID
    // },
    numberOfChoices: BigNumber,
    period: Period,
    startTime: Date,
    lastPeriodChange: Date,
    numberOfRounds: BigNumber,
    numberOfVotes: BigNumber,
    numberOfCoherentVotes: BigNumber,
    coherency: BigNumber,
    appealed: Boolean,
    ruled: Boolean,
    currentRulling: number,
    metaevidence: string,
    txid: string
}

export const useArbitratorGraph = (chainId: number, arbitratorId: number) => {
    const { arbitrators } = arbitratorGraphs.find( it => it.chainId === chainId ) || { arbitrators: [] }
    const { uri: graphURI } = arbitrators.find( it => it.arbitratorId === arbitratorId ) || { uri: undefined }

    const checkURI = () => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId, arbitratorId: ${chainId}, ${arbitratorId}`
            );
        }
    }

    const getDispute = async (disputeId: BigNumber): Promise<DisputeGraphData|undefined> => {
        checkURI()
        if (graphURI) {
            const query = `
                query getDispute($disputeId: BigInt!) {
                    dispute(id: $disputeId) {
                        id,
                        disputeID,
                        arbitrable {
                            id
                        },
                        creator {
                            id
                        },
                        subcourtID {
                            id,
                            subcourtID
                        },
                        numberOfChoices,
                        period,
                        startTime,
                        lastPeriodChange,
                        numberOfRounds,
                        numberOfVotes,
                        numberOfCoherentVotes,
                        coherency,
                        appealed,
                        ruled,
                        currentRulling,
                        metaevidence,
                        txid
                    }
                }
            `
            const { data, errors } = await graphManager.performQuery(graphURI, query, { disputeId: disputeId.toString() })
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            const { dispute } = data
            return {
                ...dispute,
                period: dispute.period ? Period[capitalize(dispute.period) as keyof typeof Period] : undefined,
                startTime: timestampToDate(dispute.startTime),
                lastPeriodChange: timestampToDate(dispute.lastPeriodChange),
                numberOfChoices: BigNumber.from(dispute.numberOfChoices),
                numberOfRounds: BigNumber.from(dispute.numberOfRounds),
                numberOfVotes: BigNumber.from(dispute.numberOfVotes),
                numberOfCoherentVotes: BigNumber.from(dispute.numberOfCoherentVotes),
                coherency: BigNumber.from(dispute.coherency),
                currentRulling: parseInt(dispute.currentRulling)
            }
        }
    }

    const listDisputes = async (creator: string): Promise<DisputeGraphData[]|undefined> => {
        checkURI()
        if (graphURI) {
            const query = `
                query listDisputes($creator: Bytes!) {
                    disputes(where: {
                        creator: { id: $creator }
                    }) {
                        id,
                        arbitrable {
                            id
                        },
                        creator {
                            id
                        },
                        subcourtID {
                            id,
                            subcourtID
                        },
                        numberOfChoices,
                        period,
                        startTime,
                        lastPeriodChange,
                        numberOfRounds,
                        numberOfVotes,
                        numberOfCoherentVotes,
                        coherency,
                        appealed,
                        ruled,
                        currentRulling,
                        metaevidence,
                        txid
                    }
                }
            `
            const { data, errors } = await graphManager.performQuery(graphURI, query, { creator })
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            const result = data.disputes.map((dispute: any) => {
                return {
                    ...dispute,
                    period: dispute.period ? Period[capitalize(dispute.period) as keyof typeof Period] : undefined,
                    startTime: timestampToDate(dispute.startTime),
                    lastPeriodChange: timestampToDate(dispute.lastPeriodChange),
                    numberOfChoices: BigNumber.from(dispute.numberOfChoices),
                    numberOfRounds: BigNumber.from(dispute.numberOfRounds),
                    numberOfVotes: BigNumber.from(dispute.numberOfVotes),
                    numberOfCoherentVotes: BigNumber.from(dispute.numberOfCoherentVotes),
                    coherency: BigNumber.from(dispute.coherency),
                    currentRulling: parseInt(dispute.currentRulling)
                }
            })
            return result
        }
    }

    return {
        getDispute,
        listDisputes
    }
        
}