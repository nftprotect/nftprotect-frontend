import { Web3Provider } from '@ethersproject/providers'
import type { Account, Chain, Client, Transport } from 'viem'

export function clientToProvider(client: Client) {
    const { chain, transport } = client
    const network = chain ? {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    } : 'any'
    const provider = new Web3Provider(transport, 'any')//network)
    return provider
}