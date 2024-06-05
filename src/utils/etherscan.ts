import { supportedChains } from '../config'

export const generateBlockURL = (blockNumber: string | number | bigint, chainId: number) => {
    const decimalBlockNumber = blockNumber.toString().startsWith('0x') ?
        BigInt(blockNumber).toString() :
        blockNumber.toString()
    return `https://goerli.etherscan.io/block/${decimalBlockNumber}`
}

const getChain = (chainId: number) => {
    const chain = supportedChains.find(it => it.id === chainId)
    if (!chain) {
        throw new Error(`Invalid chainId: ${chainId}`)
    }
    return chain
}

export const generateTxURL = (txHash: string, chainId: number) => {
    const chain = getChain(chainId)
    return `${chain.explorerUrl}/tx/${txHash}`
}

export const generateAddressURL = (address: string, chainId: number) => {
    const chain = getChain(chainId)
    return `${chain.explorerUrl}/address/${address}`
}

export const generateTokenURL = (contractAddress: string, tokenId: string, chainId: number) => {
    const chain = getChain(chainId)
    return `${chain.explorerUrl}/nft/${contractAddress}/${tokenId}`
}