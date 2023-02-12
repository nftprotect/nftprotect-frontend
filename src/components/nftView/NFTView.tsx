import {
    SimpleGrid,
    Heading,
    Container,
} from '@chakra-ui/react'
import { useEvmWalletNFTs, useEvmNFTMetadata } from '@moralisweb3/next';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import NFTCard from './NFTCard'
import { nftpContractAddress } from '../../utils/config'
import { useAppContext } from '../../context/AppContextProvider';

const NFTView = () => {

    const { currentChain, account, active, library, nftProtectContract } = useAppContext()

    const { data, fetch, cursor, page, pageSize, total} = useEvmWalletNFTs({
        chain: currentChain.id,
        address: account || '0x0'
    })

    const nftIsWNFT = (nft: EvmNft) => nft.tokenAddress.format().toLowerCase() === nftpContractAddress.toLowerCase()

    const renderNFT = (nft: EvmNft) => {
        console.log('NFT: ', nft.name, nft)
        return <NFTCard
            key={nft.tokenHash}
            nft={nft}
            nftReFetch={fetch}
        />
    }
    const {data: dummyOriginalNFT} = useEvmNFTMetadata({ 
        chain: currentChain.id,
        address: nftpContractAddress,
        tokenId: '1'
    })

    const ownNfts = data?.filter(nft => !nftIsWNFT(nft) )
    const wNfts = data?.filter(nft => nftIsWNFT(nft) )
    const ownNftElements = ownNfts?.map(renderNFT)
    const wNftElements = wNfts?.map(renderNFT)
    const transferedWNftElements = [ dummyOriginalNFT && renderNFT(dummyOriginalNFT) ]

    return (
        <>
            <Heading>My NFTs:</Heading>
            <SimpleGrid 
                minChildWidth={['8em', '10em', '12em']}
                spacing='1em'
            >
                { ownNftElements }
            </SimpleGrid>

            <Heading>My wNFTs:</Heading>
            <SimpleGrid minChildWidth='12em' spacing='1em' width="100%">
                { wNftElements }
            </SimpleGrid>

            <Heading>My wNFTs at another adresses:</Heading>
            <SimpleGrid minChildWidth='12em' spacing='1em' width="100%">
                { transferedWNftElements }
            </SimpleGrid>
        </>
)}

export default NFTView