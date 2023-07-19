import type { NextApiRequest, NextApiResponse } from 'next'
import { nftProtectGraphs, supportedChains } from '../../../../utils/config'
import { ApolloClient, gql, InMemoryCache } from "@apollo/client"
import { defaultOptions } from '../../../../context/TheGraphContextProvider'
import { Alchemy, Network, Nft, NftTokenType } from 'alchemy-sdk'
import { formatAddress } from '../../../../utils/helpers'
import { generateTokenURL } from '../../../../utils/etherscan'

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

const graphs:any = {}
const createGraph = (graphURI: string) => {
    let client = graphs[graphURI]
    if (!client) {
        client = new ApolloClient({
            uri: graphURI,
            cache: new InMemoryCache(),
            defaultOptions: defaultOptions
        })
        graphs[graphURI] = client
    }
    return client
}

const apiKey = process.env.ALCHEMY_API_KEY
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

const getNft = async (tokenId: string, client: ApolloClient<InMemoryCache>): Promise<any> => {
    const query = `
        query getToken($tokenId: Bytes!) {
            token(id: $tokenId) {
                id,
                securityLevel,
                ownerProtected {
                    id
                },
                ownerOriginal {
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
    const { data } = await client.query({
        query: gql(query),
        variables: {tokenId}
    })
    return data?.token
}

const tokenCache:any = {}
const protectionText = "Warning! This is a Protected NFT (pNFT). Please contact the Owner via nftprotect.app (https://nftprotect.app/) to request the Original NFT"

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

    const graphConfig = nftProtectGraphs.find(it => it.chainId === currentChain.id)
    if (!graphConfig) {
        res.status(500).json({ message: 'Internal error' })
        return
    }
    let data: Data | null = null

    try {
        const graphClient = createGraph(graphConfig.uri)
        const nftGraphData = await getNft(tokenId as string, graphClient)
        if (nftGraphData) {
            const alchemy = createAlchemy(currentChain.alchemyId)
            const tokenType = nftGraphData.assetType === NFTPTokenStandard.ERC1155 ?
                NftTokenType.ERC1155 :
                NFTPTokenStandard.ERC721 ?
                NftTokenType.ERC721 :
                NftTokenType.NO_SUPPORTED_NFT_STANDARD
            const originalMetadata = await alchemy.nft.getNftMetadata(
                nftGraphData.contract, 
                nftGraphData.tokenId,
                {
                    tokenType
                }
            )
            const additionalData = {
                //protectionStandard: "EIPXXX",
                protectionDescription: protectionText,
                originalToken: {
                    standard: NFTPTokenStandard[parseInt(nftGraphData.assetType)].toString(),
                    address: nftGraphData.contract,
                    id: nftGraphData.tokenId,
                    amount: nftGraphData.amount.toString(),
                    uri: originalMetadata.tokenUri?.raw,
                    owner: nftGraphData.ownerOriginal.id
                }
            }
            const additionalProperties = {
                protectedNFTDescription: {
                    name: "Description of pNFT",
                    value: protectionText
                },
                originalOwner: {
                    name: "Owner of original NFT",
                    value: nftGraphData.ownerOriginal.id,
                    display_value: formatAddress(nftGraphData.ownerOriginal.id, 4)
                },
                originalToken: {
                    name: "Original token",
                    value: generateTokenURL(nftGraphData.contract, nftGraphData.tokenId, currentChain.id)
                },
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
