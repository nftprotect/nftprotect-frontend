import { useContext, useMemo } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../utils/config";
import { useTheGraph } from "./useTheGraph";
import { TheGraphContext } from "../context/TheGraphContextProvider";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { timestampToDate } from "../utils/helpers";

export enum ReqType
{
    OwnershipAdjustment,
    OwnershipRestore,
    Burn
}

export enum ReqStatus
{
    Initial,
    Accepted,
    Rejected,
    Disputed
}

export interface RequestGraphMinimalData {
    id: BigNumber,
    status: ReqStatus,
    type: ReqType,
    updateDate: Date
}

export interface RequestGraphData extends RequestGraphMinimalData {
    tokenId: BigNumber,
    oldOwnerAddress: string,
    newOwnerAddress: string,
    createDate: Date,
    createBlockNumber: number,
    updateBlockNumber: number
}

export interface TokenGraphData {
    id: BigNumber,
    tokenId: BigNumber,
    securityLevel: number,
    ownerAddress: string,
    originalOwnerAddress: string,
    assetType: number,
    contractAddress: string,
    amount: BigNumber,
    mintDate: Date,
    mintBlockNumber: number,
    latestRequest: RequestGraphMinimalData | null,
    burned: Boolean
}

const MissingUriError = (chainId: any) => `The Graph URI not found for chainId: ${chainId}`

export const useNftProtectGraph = () => {
    const appContext = useContext(AppContext)
    const graphContext = useContext(TheGraphContext)

    if (!graphContext && !appContext) {
        throw new Error(
            "useNftProtectGraph has to be used within <TheGraphContext.Provider> and <AppContextProvider.Provider>"
        );
    }
    const { performQuery } = useTheGraph()
    const { currentChain } = useAppContext()
    const { uri: graphURI } = useMemo(() => { 
        return nftProtectGraphs.find( it => it.chainId === currentChain?.id ) || { uri: undefined }
    }, [currentChain])

    const getSystem = async () => {
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
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.system
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const getRequest = async (requestId: BigNumber): Promise<RequestGraphData|null> => {
        if (graphURI) {
            const query = `
                query getRequest($requestId: Bytes!) {
                    request(id: $requestId) {
                        id,
                        type,
                        status,
                        token {
                            id
                        },
                        oldowner {
                            id
                        },
                        newowner {
                            id
                        },
                        timestamp,
                        blocknumber,
                        timestampChange,
                        blocknumberChange
                    }
                }
            `
            const result = await performQuery(graphURI, query, { requestId: requestId.toString() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            const { request } = data
            return request ? {
                id: BigNumber.from(request.id),
                type: ReqType[request.type as keyof typeof ReqType],
                status: ReqStatus[request.status as keyof typeof ReqStatus],
                tokenId: BigNumber.from(request.token.id),
                oldOwnerAddress: request.oldowner.id,
                newOwnerAddress: request.newowner.id,
                createDate: timestampToDate(parseInt(request.timestamp)),
                createBlockNumber: parseInt(request.blocknumber),
                updateDate: timestampToDate(parseInt(request.timestampChange)),
                updateBlockNumber: parseInt(request.blocknumberChange),
            } : null
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const getToken = async (tokenId: BigNumber) => {
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
                        blocknumber,
                        burned
                    }
                }
            `
            const result = await performQuery(graphURI, query, { tokenId })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.token
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const getUser = async (address: string) => {
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
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.user
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const listRequests = async (params: {
        status: ReqStatus,
        oldOwner?: string,
        newOwner?: string,
    }) => {
        const { oldOwner, newOwner } = params
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
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.requests
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    // Returns list of pNFTs that are not owned by original owner
    const listTokensTransfered = async (originalOwner: string): Promise<TokenGraphData[]> => {
        if (graphURI) {
            const query = `
                query listTokensTransfered($originalOwner: Bytes!) {
                    tokens(where: { 
                        ownerOriginal_: { 
                            id: $originalOwner 
                        },
                        ownerProtected_: { 
                            id_not: $originalOwner 
                        } 
                    }) {
                        id
                        securityLevel
                        ownerProtected {
                          id
                        }
                        ownerOriginal {
                          id
                        }
                        assetType
                        contract
                        tokenId
                        amount
                        timestamp
                        blocknumber
                        latestRequest {
                            id
                            status
                            type
                            timestampChange
                        }
                        burned
                    }
                }
            `
            const result = await performQuery(graphURI, query, { originalOwner: originalOwner.toLocaleLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                tokenId: BigNumber.from(it.tokenId),
                securityLevel: parseInt(it.securityLevel),
                ownerAddress: it.ownerProtected.id,
                originalOwnerAddress: it.ownerOriginal.id,
                assetType: parseInt(it.assetType),
                contractAddress: it.contract,
                amount: BigNumber.from(it.amount),
                mintDate: timestampToDate(parseInt(it.timestamp)),
                mintBlockNumber: parseInt(it.blocknumber),
                latestRequest: it.latestRequest ? {
                    id: BigNumber.from(it.latestRequest.id),
                    status: ReqStatus[it.latestRequest.status as keyof typeof ReqStatus],
                    type: ReqType[it.latestRequest.type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(it.latestRequest.timestampChange))
                } : null,
                burned: it.burned
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    // Returns list of pNFTs with originals not owned by pNFT owner
    const listTokensReceived = async (owner: string): Promise<TokenGraphData[]> => {
        if (graphURI) {
            const query = `
                query listTokensReceived($owner: Bytes!) {
                    tokens(where: { 
                        ownerOriginal_: { 
                            id_not: $owner 
                        }, 
                        ownerProtected_: { 
                            id: $owner 
                        } 
                    }) {
                        id
                        securityLevel
                        ownerProtected {
                          id
                        }
                        ownerOriginal {
                          id
                        }
                        assetType
                        contract
                        tokenId
                        amount
                        timestamp
                        blocknumber
                        latestRequest {
                            id
                            status
                            type
                            timestampChange
                        }
                        burned
                    }
                }
            `
            const result = await performQuery(graphURI, query, { owner: owner.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                tokenId: BigNumber.from(it.tokenId),
                securityLevel: parseInt(it.securityLevel),
                ownerAddress: it.ownerProtected.id,
                originalOwnerAddress: it.ownerOriginal.id,
                assetType: parseInt(it.assetType),
                contractAddress: it.contract,
                amount: BigNumber.from(it.amount),
                mintDate: timestampToDate(parseInt(it.timestamp)),
                mintBlockNumber: parseInt(it.blocknumber),
                latestRequest: it.latestRequest ? {
                    id: BigNumber.from(it.latestRequest.id),
                    status: ReqStatus[it.latestRequest.status as keyof typeof ReqStatus],
                    type: ReqType[it.latestRequest.type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(it.latestRequest.timestampChange))
                } : null,
                burned: it.burned
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    return {
        getSystem,
        getRequest,
        getToken,
        getUser,
        listRequests,
        listTokensTransfered,
        listTokensReceived
    }
        
}