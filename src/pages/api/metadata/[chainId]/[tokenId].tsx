import type { NextApiRequest, NextApiResponse } from 'next'
import { supportedChains } from '../../../../config'
import { Alchemy, Network, Nft, NftTokenType } from 'alchemy-sdk'
import { useNftProtectGraph } from '../../../../hooks/useNftProtectGraph'
import { BigNumber } from '@ethersproject/bignumber'

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
    const { getToken } = useNftProtectGraph(currentChain.id);

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
        const nftGraphData = await getToken(BigNumber.from(tokenId))
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
