import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
    SimpleGrid,
    Heading
} from '@chakra-ui/react'
import { useEvmWalletNFTs } from '@moralisweb3/next';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import NFTCard from './NFTCard'
import { nftpContractAddress } from '../../utils/config'

const renderNFT = (nft: EvmNft) => {
    console.log('NFT: ', nft.name, nft)
    return <NFTCard
        nft={nft}
    />
}

const NFTView = () => {

    const { chainId, account, active, library} = useWeb3React<Web3Provider>()

    const { data, cursor, page, pageSize, total} = useEvmWalletNFTs({
        chain: chainId,
        address: account || '0x0'
    })

    console.log(data)
    const ownNfts = data?.filter(nft => nft.tokenAddress.format().toLowerCase() !== nftpContractAddress.toLowerCase() )
    const wNfts = data?.filter(nft => nft.tokenAddress.format().toLowerCase() === nftpContractAddress.toLowerCase() )
    const ownNftElements = ownNfts?.map(renderNFT)
    const wNftElements = wNfts?.map(renderNFT)

    return ( <>
        <Heading>NFT в кошельке:</Heading>
        <SimpleGrid minChildWidth='12em' spacing='1em' width="100%">
            { ownNftElements }
        </SimpleGrid>
        <Heading>wNFT:</Heading>
        <SimpleGrid minChildWidth='12em' spacing='1em' width="100%">
            { wNftElements }
        </SimpleGrid>
    </> )
}

export default NFTView