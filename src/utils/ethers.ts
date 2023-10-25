import { 
    type PublicClient, 
    getPublicClient, 
    type WalletClient, 
    getWalletClient 
} from '@wagmi/core'
import { FallbackProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { type HttpTransport } from 'viem'

export function publicClientToProvider(publicClient: PublicClient) {
    const { chain, transport } = publicClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    if (transport.type === 'fallback') {
        const providers = (transport.transports as ReturnType<HttpTransport>[]).map(
            ({ value }) => new JsonRpcProvider(value?.url, network),
        )
        if (providers.length === 1) {
            return providers[0]
        }
        return new FallbackProvider(providers)
    }
    return new JsonRpcProvider(transport.url, network)
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getPublicProvider({ chainId }: { chainId?: number } = {}) {
    const publicClient = getPublicClient({ chainId })
    return publicClientToProvider(publicClient)
}

export function walletClientToProvider(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new Web3Provider(transport, 'any')
    return provider
  }
   
  /** Action to convert a viem Wallet Client to an ethers.js Provider. */
  export async function getWalletProvider({ chainId }: { chainId?: number } = {}) {
    const walletClient = await getWalletClient({ chainId })
    if (!walletClient) return undefined
    return walletClientToProvider(walletClient)
  }

export function clientToProvider(client: WalletClient|PublicClient) {
    if (client.type === 'publicClient') {
        return publicClientToProvider(client as PublicClient)
    } else {
        return walletClientToProvider(client as WalletClient)
    }
}