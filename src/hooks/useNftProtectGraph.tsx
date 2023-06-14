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

export interface RequestGraphData {
    id: BigNumber,
    type: string
    status: ReqStatus,
    tokenId: BigNumber,
    oldOwnerAddress: string,
    newOwnerAddress: string,
    createDate: Date,
    createBlockNumber: number,
    updateDate: Date,
    updateBlockNumber: number
}

export interface TokenGraphData {
    id: BigNumber,
    //tokenId: BigNumber,
    securityLevel: number,
    ownerAddress: string,
    originalOwnerAddress: string,
    assetType: number,
    contractAddress: string,
    amount: BigNumber,
    mintDate: Date,
    mintBlockNumber: number
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
        return nftProtectGraphs.find( it => it.chainId === currentChain.id ) || { uri: undefined }
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
            return result
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const getRequest = async (requestId: BigNumber): Promise<RequestGraphData> => {
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
            const { data } = await performQuery(graphURI, query, { requestId: requestId.toString() })
            const { request } = data
            return {
                id: BigNumber.from(request.id),
                type: request.type,
                status: ReqStatus[request.status as keyof typeof ReqStatus],
                tokenId: BigNumber.from(request.token.id),
                oldOwnerAddress: request.oldowner.id,
                newOwnerAddress: request.newowner.id,
                createDate: timestampToDate(parseInt(request.timestamp)),
                createBlockNumber: parseInt(request.blocknumber),
                updateDate: timestampToDate(parseInt(request.timestampChange)),
                updateBlockNumber: parseInt(request.blocknumberChange),
            }
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
                        blocknumber
                    }
                }
            `
            const result = await performQuery(graphURI, query, { tokenId })
            return result
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
            return result
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
            return result
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
                    }
                }
            `
            const { data } = await performQuery(graphURI, query, { originalOwner: originalOwner.toLocaleLowerCase() })
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                //tokenId: BigNumber.from(it.tokeinId),
                securityLevel: parseInt(it.securityLevel),
                ownerAddress: it.ownerProtected.id,
                originalOwnerAddress: it.ownerOriginal.id,
                assetType: parseInt(it.assetType),
                contractAddress: it.contract,
                amount: BigNumber.from(it.amount),
                mintDate: timestampToDate(parseInt(it.timestamp)),
                mintBlockNumber: parseInt(it.blocknumber)
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
                    }
                }
            `
            const { data } = await performQuery(graphURI, query, { owner: owner.toLowerCase() })
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                //tokenId: BigNumber.from(it.tokeinId),
                securityLevel: parseInt(it.securityLevel),
                ownerAddress: it.ownerProtected.id,
                originalOwnerAddress: it.ownerOriginal.id,
                assetType: parseInt(it.assetType),
                contractAddress: it.contract,
                amount: BigNumber.from(it.amount),
                mintDate: timestampToDate(parseInt(it.timestamp)),
                mintBlockNumber: parseInt(it.blocknumber)
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