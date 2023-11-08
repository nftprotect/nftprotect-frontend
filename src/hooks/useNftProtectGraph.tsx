import { useContext, useMemo } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../config";
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
    Disputed,
    DisputeAccepted,
    DisputeRejected
}

export interface RequestGraphMinimalData {
    id: BigNumber,
    status: ReqStatus,
    type: ReqType,
    updateDate: Date
}

export interface RequestGraphData extends RequestGraphMinimalData {
    entityIds: BigNumber[],
    oldOwnerAddress: string,
    newOwnerAddress: string,
    createDate: Date,
    createBlockNumber: number,
    updateBlockNumber: number
}

export interface UserGraphData {
    id: BigNumber,
    referrer: string,
    successor: string,
    coupons: BigNumber
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

export interface ProtectorGraphData {
    id: BigNumber
    address: string
    originalAddress: string
}

export interface EntityGraphData {
    id: BigNumber
    protection: number // TokenGraphData.securityLevel
    ownerOriginalAddress: string // TokenGraphData.originalOwnerAddress
    ownerWrappedAddress: string // TokenGraphData.ownerAddress
    protector: ProtectorGraphData
    createDate: Date // TokenGraphData.mintDate
    createBlockNumber: number // TokenGraphData.mintBlockNumber
    latestRequest: RequestGraphMinimalData | null
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
                        coupons,
                        core,
                        userregistry,
                        requesthub,
                        feeBasic,
                        feeUltra,
                        burnOnAction,
                        scoreThreshold,
                        affiliatePercent,
                        technicalOwner: Bytes,
                        allowAnonymous: Boolean
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
                        entities {
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
                entityIds: request.entities.map((it:any) => BigNumber.from(it.id)),
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

    const getEntity = async (entityId: BigNumber):Promise<EntityGraphData|undefined> => {
        if (graphURI) {
            const query = `
                query getEntity($entityId: Bytes!) {
                    myEntity(id: $entityId) {
                        id,
                        protection,
                        ownerWrapped {
                            id
                        },
                        ownerOriginal {
                            id
                        },
                        protector {
                            id
                            address
                            original
                        }
                        timestamp,
                        blocknumber,
                        latestRequest,
                        burned
                    }
                }
            `
            const result = await performQuery(graphURI, query, { tokenId: entityId.toString() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.myEntity ? {
                id: BigNumber.from(data.myEntity.id),
                protection: parseInt(data.myEntity.protection),
                ownerWrappedAddress: data.myEntity.ownerProtected.id,
                ownerOriginalAddress: data.myEntity.ownerOriginal.id,
                protector: {
                    id: data.myEntity.protector.id,
                    address: data.myEntity.protector.address,
                    originalAddress: data.myEntity.protector.original
                },
                createDate: timestampToDate(parseInt(data.myEntity.timestamp)),
                createBlockNumber: parseInt(data.myEntity.blocknumber),
                latestRequest: (data.myEntity.latestRequest && data.myEntity.latestRequest.length > 0) ? {
                    id: BigNumber.from(data.myEntity.latestRequest[0].id),
                    status: ReqStatus[data.myEntity.latestRequest[0].status as keyof typeof ReqStatus],
                    type: ReqType[data.myEntity.latestRequest[0].type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(data.myEntity.latestRequest[0].timestampChange))
                } : null,
                burned: data.myEntity.burned
            } : undefined
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const getUser = async (address: string):Promise<UserGraphData|undefined>  => {
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
            return data ? {
                ...data.user,
                id: BigNumber.from(data.user.id),
                coupons: BigNumber.from(data.user.coupons),
            } : undefined

        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const listRequests = async (params: {
        status: ReqStatus,
        oldOwner?: string,
        newOwner?: string,
    }):Promise<RequestGraphData[]> => {
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
                        entities: {
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
            return data.requests.map((request: any) => ({
                id: BigNumber.from(request.id),
                type: ReqType[request.type as keyof typeof ReqType],
                status: ReqStatus[request.status as keyof typeof ReqStatus],
                entityIds: request.entities.map((it:any) => BigNumber.from(it.id)),
                oldOwnerAddress: request.oldowner.id,
                newOwnerAddress: request.newowner.id,
                createDate: timestampToDate(parseInt(request.timestamp)),
                createBlockNumber: parseInt(request.blocknumber),
                updateDate: timestampToDate(parseInt(request.timestampChange)),
                updateBlockNumber: parseInt(request.blocknumberChange),
            }))
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    // Returns list of entities that are not owned by original owner
    const listEntitiesTransfered = async (originalOwner: string, burned?: boolean): Promise<EntityGraphData[]> => {
        if (graphURI) {
            const query = `
                query listEntitiesTransfered($originalOwner: Bytes!, $burned: Boolean) {
                    myEntities(where: { 
                        ownerOriginal: { 
                            id: $originalOwner 
                        },
                        ownerWrapped: { 
                            id_not: $originalOwner 
                        },
                        burned: $burned
                    }) {
                        id,
                        protection,
                        ownerWrapped {
                            id
                        },
                        ownerOriginal {
                            id
                        },
                        protector {
                            id
                            address
                            original
                        },
                        timestamp,
                        blocknumber,
                        latestRequest,
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
            return data ? data.myEntities.map((it: any) => { return {
                id: BigNumber.from(it.id),
                protection: parseInt(it.protection),
                ownerWrappedAddress: it.ownerWrapped.id,
                ownerOriginalAddress: it.ownerOriginal.id,
                protector: {
                    id: it.protector.id,
                    address: it.protector.address,
                    originalAddress: it.protector.original
                },
                createDate: timestampToDate(parseInt(it.timestamp)),
                createBlockNumber: parseInt(it.blocknumber),
                latestRequest: (it.latestRequest && it.latestRequest.length > 0) ? {
                    id: BigNumber.from(it.latestRequest[0].id),
                    status: ReqStatus[it.latestRequest[0].status as keyof typeof ReqStatus],
                    type: ReqType[it.latestRequest[0].type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(it.latestRequest[0].timestampChange))
                } : null,
                burned: it.burned
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    // Returns list of entities with originals not owned by pNFT owner
    const listEntitiesReceived = async (owner: string, burned?: boolean): Promise<EntityGraphData[]> => {
        if (graphURI) {
            const query = `
                query listEntitiesReceived($owner: Bytes!) {
                    myEntities(where: { 
                        ownerOriginal: { 
                            id_not: $owner 
                        }, 
                        ownerWrapped: { 
                            id: $owner 
                        },
                        burned: $burned
                    }) {
                        id,
                        protection,
                        ownerWrapped {
                            id
                        },
                        ownerOriginal {
                            id
                        },
                        protector {
                            id
                            address
                            original
                        },
                        timestamp,
                        blocknumber,
                        latestRequest,
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
            return data ? data.myEntities.map((it: any) => { return {
                id: BigNumber.from(it.id),
                protection: parseInt(it.protection),
                ownerWrappedAddress: it.ownerWrapped.id,
                ownerOriginalAddress: it.ownerOriginal.id,
                protector: {
                    id: it.protector.id,
                    address: it.protector.address,
                    originalAddress: it.protector.original
                },
                createDate: timestampToDate(parseInt(it.timestamp)),
                createBlockNumber: parseInt(it.blocknumber),
                latestRequest: (it.latestRequest && it.latestRequest.length > 0) ? {
                    id: BigNumber.from(it.latestRequest[0].id),
                    status: ReqStatus[it.latestRequest[0].status as keyof typeof ReqStatus],
                    type: ReqType[it.latestRequest[0].type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(it.latestRequest[0].timestampChange))
                } : null,
                burned: it.burned
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    // Returns list of entities that are owned by original owner
    const listEntitiesOwn = async (originalOwner: string, burned?: boolean): Promise<EntityGraphData[]> => {
        if (graphURI) {
            const query = `
                query listEntitiesOwn($originalOwner: Bytes!) {
                    myEntities(where: { 
                        ownerOriginal: { 
                            id: $originalOwner 
                        },
                        burned: $burned
                    }) {
                        id,
                        protection,
                        ownerWrapped {
                            id
                        },
                        ownerOriginal {
                            id
                        },
                        protector {
                            id
                            address
                            original
                        },
                        timestamp,
                        blocknumber,
                        latestRequest,
                        burned
                    }
                }
            `
            const result = await performQuery(graphURI, query, { originalOwner: originalOwner.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.myEntities.map((it: any) => { return {
                id: BigNumber.from(it.id),
                protection: parseInt(it.protection),
                ownerWrappedAddress: it.ownerWrapped.id,
                ownerOriginalAddress: it.ownerOriginal.id,
                protector: {
                    id: it.protector.id,
                    address: it.protector.address,
                    originalAddress: it.protector.original
                },
                createDate: timestampToDate(parseInt(it.timestamp)),
                createBlockNumber: parseInt(it.blocknumber),
                latestRequest: (it.latestRequest && it.latestRequest.length > 0) ? {
                    id: BigNumber.from(it.latestRequest[0].id),
                    status: ReqStatus[it.latestRequest[0].status as keyof typeof ReqStatus],
                    type: ReqType[it.latestRequest[0].type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(it.latestRequest[0].timestampChange))
                } : null,
                burned: it.burned
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    const listAllProtectors = async (): Promise<ProtectorGraphData[]> => {
        if (graphURI) {
            const query = `
                query {
                    protectors {
                        id,
                        address,
                        original
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
            return data ? data.protectors.map((it: any) => { return {
                id: it.id,
                address: it.address,
                originalAddress: it.original
            }}) : []
        } else {
            throw Error(MissingUriError(currentChain.chainId))
        }
    }

    return {
        getSystem,
        getRequest,
        getEntity,
        getUser,
        listRequests,
        listEntitiesTransfered,
        listEntitiesReceived,
        listEntitiesOwn,
        listAllProtectors
    }
        
}