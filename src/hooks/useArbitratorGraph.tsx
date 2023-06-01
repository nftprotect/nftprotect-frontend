import { useContext } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { arbitratorGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";
import { TheGraphContext } from "../context/TheGraphContextProvider";

enum Period {
    evidence,
    commit,
    vote, 
    appeal,
    execution
}

export const useArbitratorGraph = (chainId: number, arbitratorId: number) => {
    const currentContext = useContext(TheGraphContext);
    if (!currentContext) {
        throw new Error(
            "useArbitratorGraph has to be used within <TheGraphContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const { arbitrators } = arbitratorGraphs.find( it => it.chainId === chainId ) || { arbitrators: [] }
    const { uri: graphURI } = arbitrators.find( it => it.arbitratorId === arbitratorId ) || { uri: undefined }

    const checkURI = () => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId, arbitratorId: ${chainId}, ${arbitratorId}`
            );
        }
    }

    const getDispute = async (disputeId: BigNumber) => {
        checkURI()
        if (graphURI) {
            const query = `
                query getDispute($disputeId: BigInt!) {
                    dispute(disputeID: $disputeId) {
                        id,
                        disputeID,
                        arbitrable: {
                            id
                        },
                        creator: {
                            id
                        },
                        subcourtID: {
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
            const result = await performQuery(graphURI, query, { disputeId })
            return result
        }
    }

    const listDisputes = async (creator: string) => {
        checkURI()
        if (graphURI) {
            const query = `
                query listDisputes($creator: Bytes!) {
                    disputes(where: {
                        creator: { id: $creator }
                    }) {
                        id,
                        disputeID,
                        arbitrable: {
                            id
                        },
                        creator: {
                            id
                        },
                        subcourtID: {
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
            const result = await performQuery(graphURI, query, { creator })
            return result
        }
    }

    return {
        getDispute,
        listDisputes
    }
        
}