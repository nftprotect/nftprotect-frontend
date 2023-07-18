import type { NextApiRequest, NextApiResponse } from 'next'
import { nftProtectGraphs, supportedChains } from '../../../../utils/config'
import { ApolloClient, gql, InMemoryCache } from "@apollo/client"
import { defaultOptions } from '../../../../context/TheGraphContextProvider'
import { Alchemy, Network, Nft } from 'alchemy-sdk'

type Data = {
  name: string
  description: string
  image: string
  // здесь вы можете добавить любые другие данные, которые вам нужны
}

type Error = {
  message: string
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
      const originalMetadata = await alchemy.nft.getNftMetadata(nftGraphData.contract, nftGraphData.tokenId)
  
      const data = { ...originalMetadata.rawMetadata }
      data.description = "This NFT is a copy of original NFT protected by NFTProtect."

      tokenCache[cacheId] = {
        data,
        timestamp: new Date()
      }
      res.status(200).json(data)
    } else {
      res.status(404).json({ message: 'Token not found' })
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export default handler
