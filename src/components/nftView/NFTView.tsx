import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
    Container,
    SimpleGrid,
    Button,
    Card, 
    CardBody, 
    Text,
    ButtonGroup,
    Divider,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { useEvmWalletNFTs } from '@moralisweb3/next';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import NFTCard from './NFTCard'

const NFTView = () => {

    const { chainId, account, active, library} = useWeb3React<Web3Provider>()

    const { data, cursor, page, pageSize, total} = useEvmWalletNFTs({
        chain: chainId,
        address: account || '0x0'
    })

    console.log(data)
    let nftElements = data?.map(nft => {
        console.log('NFT: ', nft.name, nft)
        return <NFTCard
            nft={nft}
        />
    })

    return (
        <SimpleGrid minChildWidth='12em' spacing='1em' width="100%">
            { nftElements }
        </SimpleGrid>
    )
}

export default NFTView