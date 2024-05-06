import type { NextApiRequest, NextApiResponse } from 'next'
import { supportedChains } from '../../../../config'
import { Alchemy, Network, Nft, NftTokenType } from 'alchemy-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { graphManager } from '../../../../utils/thegraph'
import { nftProtectGraphs } from '../../../../config'

const MissingUriError = (chainId: any) => `The Graph URI not found for chainId: ${chainId}`
// Can't use hook here
const getToken = async (chainId: number, tokenId: BigNumber) => {
    const graphConfig = nftProtectGraphs.find(it => it.chainId === chainId);
    if (!graphConfig || !graphConfig.uri) {
        throw new Error(MissingUriError(chainId));
    }
    const graphURI = graphConfig.uri;

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
    `;
    const result = await graphManager.performQuery(graphURI, query, { tokenId: tokenId.toString() });
    const { data, errors } = result;
    if (errors && errors.length > 0) {
        errors.forEach((error: any) => {
            throw new Error(error.message);
        });
    }
    if (!data.token) {
        return undefined;
    }
    return {
        id: BigNumber.from(data.token.id),
        tokenId: BigNumber.from(data.token.tokenId),
        ownerAddress: data.token.ownerProtected.id,
        originalOwnerAddress: data.token.ownerOriginal.id,
        assetType: parseInt(data.token.assetType),
        contractAddress: data.token.contract,
        amount: BigNumber.from(data.token.amount),
        mintDate: new Date(parseInt(data.token.timestamp) * 1000),
        mintBlockNumber: parseInt(data.token.blocknumber),
        latestRequest: data.token.latestRequest ? {
            id: BigNumber.from(data.token.latestRequest.id),
            status: data.token.latestRequest.status,
            type: data.token.latestRequest.type,
            updateDate: new Date(parseInt(data.token.latestRequest.timestampChange) * 1000)
        } : null,
        burned: data.token.burned,
        nonce: BigNumber.from(data.token.nonce),
    };
};

type Data = {
    name: string
    description: string
    image: string
}

type Error = {
    message: string
}

enum NFTPTokenStandard {
    ERC721,
    ERC1155,
    ERC20
}

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const alchemys:any = {}
const createAlchemy = (alchemyChainId: Network): Alchemy => {
    let client = alchemys[alchemyChainId]
    if (!client) {
        const settings = {
            apiKey: apiKey, 
            network: alchemyChainId
        };
        client = new Alchemy(settings);
        alchemys[alchemyChainId] = client
    }
    return client
}

const tokenCache:any = {}
const protectionText = `Warning! This is a Protected NFT (pNFT)! 

Please contact the Original Owner via nftprotect.app to request the Original NFT. 

Check the validity of this pNFT on https://dev.nftprotect.app/validate

===============

`

const handler = async (req: NextApiRequest, res: NextApiResponse<any | Error>) => {
    const { tokenId, chainId } = req.query
    const currentChain = supportedChains.find(it => it.id.toString() === chainId)
    if (!currentChain) {
        res.status(400).json({ message: 'Wrong chainId' })
        return
    }

    // Trying to get from cache
    const cacheId = `${chainId}:${tokenId}`
    const cacheItem = tokenCache[cacheId]
    // TODO: make expire check
    if (cacheItem) {
        res.status(200).json(cacheItem.data)
        return
    }

    let data: Data | null = null

    try {
        const nftGraphData = await getToken(currentChain.id, BigNumber.from(tokenId))
        if (nftGraphData) {
            const alchemy = createAlchemy(currentChain.alchemyId)
            const tokenType = nftGraphData.assetType === NFTPTokenStandard.ERC1155 ?
                NftTokenType.ERC1155 :
                NFTPTokenStandard.ERC721 ?
                NftTokenType.ERC721 :
                NftTokenType.NO_SUPPORTED_NFT_STANDARD
            const originalMetadata = await alchemy.nft.getNftMetadata(
                nftGraphData.contractAddress, 
                nftGraphData.tokenId,
                {
                    tokenType
                }
            )

            const additionalData = {
                //protectionStandard: "EIPXXX",
                name: `🛡️Protected • ${originalMetadata.title}`,
                description: `${protectionText}${originalMetadata.description ? ` • ${originalMetadata.description}` : ''}`,
                originalToken: {
                    standard: NFTPTokenStandard[nftGraphData.assetType].toString(),
                    address: nftGraphData.contractAddress,
                    id: nftGraphData.tokenId,
                    amount: nftGraphData.amount.toString(),
                    uri: originalMetadata.tokenUri?.raw,
                    owner: nftGraphData.originalOwnerAddress
                }
            }
            const additionalProperties = {
                // originalOwner: {
                //     name: "Owner of original NFT",
                //     value: nftGraphData.ownerOriginal.id,
                //     display_value: formatAddress(nftGraphData.ownerOriginal.id, 4)
                // },
                // originalToken: {
                //     name: "Original token",
                //     value: generateTokenURL(nftGraphData.contract, nftGraphData.tokenId, currentChain.id)
                // },
                protectedByURI: {
                    name: "Protected by",
                    value: "https://dev.nftprotect.app"
                }
            }
            const data:any = { ...originalMetadata.rawMetadata, ...additionalData }
            data.properties = data.properties ? {...data.properties, ...additionalProperties} : additionalProperties

            tokenCache[cacheId] = {
                data,
                timestamp: new Date()
            }
            // TODO: add local cache expiry
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: 'Token not found' })
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default handler
