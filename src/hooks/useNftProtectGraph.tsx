import { useContext } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";
import { TheGraphContext } from "../context/TheGraphContextProvider";

enum ReqType
{
    OwnershipAdjustment,
    OwnershipRestore,
    Burn
}

enum ReqStatus
{
    Initial,
    Accepted,
    Rejected,
    Disputed
}

export const useNftProtectGraph = (chainId: number) => {
    const currentContext = useContext(TheGraphContext);
    if (!currentContext) {
        throw new Error(
            "useNftProtectGraph has to be used within <TheGraphContext.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const { uri: graphURI } = nftProtectGraphs.find( it => it.chainId === chainId ) || { uri: undefined }

    const checkURI = () => {
        if (!graphURI) {
            throw new Error(
                `The Graph URI not found for chainId: ${chainId}`
            );
        }
    }

    const getSystem = async () => {
        checkURI()
        if (graphURI) {
            const query = `
                query getSystem() {
                    system {
                        id,
                        arbitratorregistry,
                        nftpcoupons,
                        nftprotect,
                        userregistry,
                        feeBasic,
                        feeUltra,
                        burnOnAction,
                        base,
                        scoreThreshold,
                        affiliatePercent
                    }
                }
            `
            const result = await performQuery(graphURI, query)
            return result
        }
    }

    const getRequest = async (requestId: BigNumber) => {
        checkURI()
        if (graphURI) {
            const query = `
                query getRequest($requestId: Bytes!) {
                    request(id: $requestId) {
                        id,
                        type,
                        status,
                        token: {
                            id
                        },
                        oldowner: {
                            id
                        },
                        newowner: {
                            id
                        },
                        timestamp,
                        blocknumber,
                        timestampChange,
                        blocknumberChange
                    }
                }
            `
            const result = await performQuery(graphURI, query, { requestId })
            return result
        }
    }

    const getToken = async (tokenId: BigNumber) => {
        checkURI()
        if (graphURI) {
            const query = `
                query getToken($tokenId: Bytes!) {
                    token(id: $tokenId) {
                        id,
                        securityLevel,
                        ownerProtected: {
                            id
                        },
                        ownerOriginal: {
                            id
                        },
                        assetType,
                        contract,
                        tokenId,
                        amount,
                        timestamp,
                        blocknumber
                    }
                }
            `
            const result = await performQuery(graphURI, query, { tokenId })
            return result
        }
    }

    const getUser = async (address: string) => {
        checkURI()
        if (graphURI) {
            const query = `
                query getUser($address: Bytes!) {
                    user(id: $address}) {
                        id,
                        referrer,
                        successor,
                        coupons
                    }
                }
            `
            const result = await performQuery(graphURI, query, { address })
            return result
        }
    }

    const listRequests = async (params: {
        status: ReqStatus,
        oldOwner?: string,
        newOwner?: string,
    }) => {
        const { oldOwner, newOwner } = params
        checkURI()
        if (!oldOwner && !newOwner) {
            throw Error('oldOwner or newOwner must be specified')
        }
        if (graphURI) {
            const query = `
                query listRequests(${oldOwner && '$oldOwner: Bytes!, '}${newOwner && '$newOwner: Bytes!, '}$status: ReqStatus!) {
                    requests(where: {
                        ${oldOwner && 'oldowner: {id: $oldOwner},'}
                        ${newOwner && 'newowner: {id: $newOwner},'}
                        status: $status
                    }) {
                        id,
                        type,
                        status,
                        token: {
                            id
                        },
                        oldowner: {
                            id
                        },
                        newowner: {
                            id
                        },
                        timestamp,
                        blocknumber,
                        timestampChange,
                        blocknumberChange
                    }
                }
            `
            const result = await performQuery(graphURI, query, params)
            return result
        }
    }

    return {
        getSystem,
        getRequest,
        getToken,
        getUser,
        listRequests
    }
        
}