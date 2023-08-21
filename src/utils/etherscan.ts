import { BigNumber } from '@ethersproject/bignumber'
import { supportedChains } from './config'

export const generateBlockURL = (blockNumber: string | number, chainId: number) => {
    const decimalBlockNumber = blockNumber.toString().startsWith('0x') ?
        BigNumber.from(blockNumber).toString() :
        blockNumber.toString()
    return `https://goerli.etherscan.io/block/${decimalBlockNumber}`
}

export const generateTxURL = (txHash: string, chainId: number) => {
    const chain = supportedChains.find(it => it.id === chainId)
    if (!chain) {
        throw new Error(`Invalid chainId: ${chainId}`)
    }
    return `${chain.explorerUrl}/tx/${txHash}`
}

export const generateAddressURL = (address: string, chainId: number) => {
    return `https://goerli.etherscan.io/address/${address}`
}

export const generateTokenURL = (contractAddress: string, tokenId: string, chainId: number) => {
    return `https://goerli.etherscan.io/nft/${contractAddress}/${tokenId}`
}