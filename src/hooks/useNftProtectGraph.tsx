import { useMemo } from "react";
import { BigNumber } from '@ethersproject/bignumber'
import { nftProtectGraphs } from "../config";
import { timestampToDate } from "../utils/helpers";
import { graphManager } from "../utils/thegraph";
import { NftTokenType } from "alchemy-sdk";
import NFT from "../classes/NFT";

export enum ReqType {
    OwnershipAdjustment,
    OwnershipRestore,
    Burn
}

export enum ReqStatus {
    Initial,
    Accepted,
    Rejected,
    Disputed
}

export enum AffiliateActionType {
    Register,
    Payment
}

export enum MetaEvidenceType {
    Adjustment, // used in askOwnershipAdjustmentArbitrate()
    Mistake, // used in askOwnershipRestoreArbitrate()
    Phishing, // used in askOwnershipRestoreArbitrate()
    ProtocolBreach // used in askOwnershipRestoreArbitrate()
}

export interface SystemData {
    id: string,
    arbitratorregistry: string,
    nftprotect: string,
    userregistry: string,
    sigatureVerifier: string,
    feeEntry: BigNumber,
    feeOpenCase: BigNumber,
    feeFetchRuling: BigNumber,
    burnOnAction: boolean,
    allowThirdPartyTransfers: boolean,
    base: string,
    affiliatePercent: number
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
    updateBlockNumber: number,
    metaEvidenceId: MetaEvidenceType
}

export interface TokenGraphData {
    id: BigNumber,
    tokenId: BigNumber,
    ownerAddress: string,
    originalOwnerAddress: string,
    assetType: number,
    contractAddress: string,
    amount: BigNumber,
    mintDate: Date,
    mintBlockNumber: number,
    latestRequest: RequestGraphMinimalData | null,
    burned: Boolean,
    nonce: BigNumber
}

export interface AffiliateActionData {
    id: string,
    type: AffiliateActionType,
    referral: `0x${string}`,
    referrer: `0x${string}`,
    amount: BigNumber,
    date: Date,
    blockNumber: number,
    txHash: string,
}

export interface PartnerData {
    id: string,
    discount: number,
    affiliatePercent: number,
    totalProtected: BigNumber
}

export interface UserData {
    id: string,
    referrer: string,
    totalReferrals: BigNumber,
    totalRewards: BigNumber,
    totalProtected: BigNumber,
    totalOwnedProtected: BigNumber,
}

const MissingUriError = (chainId: any) => `The Graph URI not found for chainId: ${chainId}`

export const useNftProtectGraph = (chainId: number) => {
    const { uri: graphURI } = useMemo(() => { 
        return nftProtectGraphs.find( it => it.chainId === chainId ) || { uri: undefined }
    }, [chainId])
    
    const getSystem = async (): Promise<SystemData> => {
        if (graphURI) {
            const query = `
                query getSystem($id: Int) {
                    system(id: $id) {
                        id,
                        arbitratorregistry,
                        nftprotect,
                        userregistry,
                        sigatureVerifier,
                        feeEntry,
                        feeOpenCase,
                        feeFetchRuling,
                        burnOnAction,
                        allowThirdPartyTransfers,
                        base,
                        affiliatePercent
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, {id: 0});
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return {
                id: data.system.id,
                arbitratorregistry: data.system.arbitratorregistry,
                nftprotect: data.system.nftprotect,
                userregistry: data.system.userregistry,
                sigatureVerifier: data.system.sigatureVerifier,
                feeEntry: BigNumber.from(data.system.feeEntry),
                feeOpenCase: BigNumber.from(data.system.feeOpenCase),
                feeFetchRuling: BigNumber.from(data.system.feeFetchRuling),
                burnOnAction: data.system.burnOnAction,
                allowThirdPartyTransfers: data.system.allowThirdPartyTransfers,
                base: data.system.base,
                affiliatePercent: data.system.affiliatePercent
            }
        } else {
            throw Error(MissingUriError(chainId))
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
                        metaEvidenceId,
                        timestamp,
                        blocknumber,
                        timestampChange,
                        blocknumberChange
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { requestId: requestId.toString() })
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
                metaEvidenceId: parseInt(request.metaEvidenceId) as MetaEvidenceType,
                createDate: timestampToDate(parseInt(request.timestamp)),
                createBlockNumber: parseInt(request.blocknumber),
                updateDate: timestampToDate(parseInt(request.timestampChange)),
                updateBlockNumber: parseInt(request.blocknumberChange),
            } : null
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    const getToken = async (tokenId: BigNumber):Promise<TokenGraphData|undefined> => {
        if (graphURI) {
            const query = `
                query getToken($tokenId: Bytes!) {
                    token(id: $tokenId) {
                        id,
                        ownerProtected {
                            id
                        },
                        ownerOriginal {
                            id
                        },
                        latestRequest {
                            id
                            status
                            type
                            timestampChange
                        },
                        assetType,
                        contract,
                        tokenId,
                        amount,
                        timestamp,
                        blocknumber,
                        burned,
                        nonce
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { tokenId: tokenId.toString() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.token ? {
                id: BigNumber.from(data.token.id),
                tokenId: BigNumber.from(data.token.tokenId),
                ownerAddress: data.token.ownerProtected.id,
                originalOwnerAddress: data.token.ownerOriginal.id,
                assetType: parseInt(data.token.assetType),
                contractAddress: data.token.contract,
                amount: BigNumber.from(data.token.amount),
                mintDate: timestampToDate(parseInt(data.token.timestamp)),
                mintBlockNumber: parseInt(data.token.blocknumber),
                latestRequest: data.token.latestRequest ? {
                    id: BigNumber.from(data.token.latestRequest.id),
                    status: ReqStatus[data.token.latestRequest.status as keyof typeof ReqStatus],
                    type: ReqType[data.token.latestRequest.type as keyof typeof ReqType],
                    updateDate: timestampToDate(parseInt(data.token.latestRequest.timestampChange))
                } : null,
                burned: data.token.burned,
                nonce: BigNumber.from(data.token.nonce),
            } : undefined
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    const getUser = async (address: string): Promise<UserData | null> => {
        if (graphURI) {
            const query = `
                query getUser($address: Bytes!) {
                    user(id: $address) {
                        id,
                        referrer,
                        totalReferrals,
                        totalRewards,
                        totalProtected,
                        totalOwnedProtected
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { address: address.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data.user ? {
                id: data.user.id,
                referrer: data.user.referrer,
                totalProtected: BigNumber.from(data.user.totalProtected),
                totalOwnedProtected: BigNumber.from(data.user.totalOwnedProtected),
                totalReferrals: BigNumber.from(data.user.totalReferrals),
                totalRewards: BigNumber.from(data.user.totalRewards)
            } : null
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    const getPartner = async (address: string): Promise<PartnerData|null> => {
        if (graphURI) {
            const query = `
                query getUserWithOptionalPartner($address: Bytes!) {
                    partner(id: $address) {
                        id,
                        discount,
                        affiliatePercent,
                        totalProtected
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { address: address.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            if (data.partner) {
                return {
                    id: data.partner.id,
                    discount: data.partner.discount,
                    affiliatePercent: data.partner.affiliatePercent,
                    totalProtected: BigNumber.from(data.partner.totalProtected)
                }
            }
            return null;
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    const listRequests = async (params: {
        status: ReqStatus,
        oldOwner?: string,
        newOwner?: string,
    }): Promise<RequestGraphData[]> => {
        const { oldOwner, newOwner } = params;
        if (!oldOwner && !newOwner) {
            throw Error('oldOwner or newOwner must be specified');
        }
        if (graphURI) {
            const query = `
                query listRequests(${oldOwner ? '$oldOwner: Bytes!, ' : ''}${newOwner ? '$newOwner: Bytes!, ' : ''}$status: ReqStatus!) {
                    requests(where: {
                        ${oldOwner ? 'oldowner: {id: $oldOwner},' : ''}
                        ${newOwner ? 'newowner: {id: $newOwner},' : ''}
                        status: $status
                    }) {
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
                        metaEvidenceId,
                        timestamp,
                        blocknumber,
                        timestampChange,
                        blocknumberChange
                    }
                }
            `;
            const result = await graphManager.performQuery(graphURI, query, params);
            const { data, errors } = result;
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message);
                });
            }
            return data.requests.map((request: any) => ({
                id: BigNumber.from(request.id),
                type: ReqType[request.type as keyof typeof ReqType],
                status: ReqStatus[request.status as keyof typeof ReqStatus],
                tokenId: BigNumber.from(request.token.id),
                oldOwnerAddress: request.oldowner.id,
                newOwnerAddress: request.newowner.id,
                metaEvidenceId: parseInt(request.metaEvidenceId) as MetaEvidenceType,
                createDate: timestampToDate(parseInt(request.timestamp)),
                createBlockNumber: parseInt(request.blocknumber),
                updateDate: timestampToDate(parseInt(request.timestampChange)),
                updateBlockNumber: parseInt(request.blocknumberChange),
            }));
        } else {
            throw Error(MissingUriError(chainId));
        }
    };

    // Returns list of pNFTs that are not owned by original owner
    const listTokensTransfered = async (originalOwner: string, aliveOnly: boolean = true): Promise<TokenGraphData[]> => {
        if (graphURI) {
            const query = `
                query listTokensTransfered($originalOwner: Bytes!, $burned: Boolean) {
                    tokens(where: { 
                        ownerOriginal_: { 
                            id: $originalOwner 
                        },
                        ownerProtected_: { 
                            id_not: $originalOwner 
                        },
                        ${aliveOnly ? 'burned: $burned' : ''}
                    }) {
                        id
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
                        nonce
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { originalOwner: originalOwner.toLowerCase(), burned: false })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                tokenId: BigNumber.from(it.tokenId),
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
                burned: it.burned, 
                nonce: BigNumber.from(it.nonce),
            }}) : []
        } else {
            throw Error(MissingUriError(chainId))
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
                        nonce
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { owner: owner.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                tokenId: BigNumber.from(it.tokenId),
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
                burned: it.burned,
                nonce: BigNumber.from(it.nonce),
            }}) : []
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    // Returns list of all pNFTs owned by owner (own and received)
    const listTokensOwned = async (owner: string, aliveOnly: boolean = true): Promise<TokenGraphData[]> => {
        if (graphURI) {
            const query = `
                query listTokensOwned($owner: Bytes!, $burned: Boolean) {
                    tokens(where: { 
                        ownerProtected_: { 
                            id: $owner 
                        },
                        ${aliveOnly ? 'burned: $burned' : ''}
                    }) {
                        id
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
                        nonce
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { owner: owner.toLowerCase(), burned: false })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.tokens.map((it: any) => { return {
                id: BigNumber.from(it.id),
                tokenId: BigNumber.from(it.tokenId),
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
                burned: it.burned,
                nonce: BigNumber.from(it.nonce),
            }}) : []
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    // Returns lis of affilate payments made to user's address
    const listAffiliateActions = async (referrerAddress: `0x${string}`): Promise<AffiliateActionData[]> => {
        if (graphURI) {
            const query = `
                query listAffiliateActions($referrerAddress: Bytes!) {
                    affiliateActions(
                        where: { referrer: $referrerAddress },
                        orderBy: id, 
                        orderDirection: desc
                    ) {
                        id,
                        type,
                        referral,
                        referrer,
                        amount,
                        timestamp,
                        blocknumber,
                        txHash
                    }
                }
            `
            const result = await graphManager.performQuery(graphURI, query, { referrerAddress: referrerAddress.toLowerCase() })
            const { data, errors } = result
            if (errors && errors.length > 0) {
                errors.forEach((error: any) => {
                    throw new Error(error.message)
                })
            }
            return data ? data.affiliateActions.map((action: any) => ({
                id: action.id,
                type: AffiliateActionType[action.type as keyof typeof AffiliateActionType],
                referral: action.referral,
                referrer: action.referrer,
                amount: BigNumber.from(action.amount),
                date: timestampToDate(parseInt(action.timestamp)),
                blockNumber: parseInt(action.blocknumber),
                txHash: action.txHash
            })) : []
        } else {
            throw Error(MissingUriError(chainId))
        }
    }

    return {
        getSystem,
        getRequest,
        getToken,
        getUser,
        getPartner,
        listRequests,
        listTokensTransfered,
        listTokensOwned,
        listTokensReceived,
        listAffiliateActions
    }
        
}

// Function to convert graph data to partial NFT interface object
export const convertTokenGraphData = (tokenData: TokenGraphData): Partial<NFT> => {
    let assetType: NftTokenType;
    if (tokenData.assetType === 0) {
        assetType = NftTokenType.ERC721
    } else if (tokenData.assetType === 1) {
        assetType = NftTokenType.ERC1155
    } else {
        assetType = NftTokenType.UNKNOWN
    }
    return {
        ownerAddress: tokenData.ownerAddress,
        originalData: {
            ownerAddress: tokenData.originalOwnerAddress,
            tokenId: tokenData.tokenId.toString(),
            contractAddress: tokenData.contractAddress,
            tokenType: assetType,
            amount: tokenData.amount.toNumber(), 
            nonce: tokenData.nonce.toNumber()
        }
    };
};