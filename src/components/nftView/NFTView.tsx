import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
    Container,
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

const NFTView = () => {

    const { chainId, account, active, library} = useWeb3React<Web3Provider>()

    const nfts = useEvmWalletNFTs({
        chain: chainId,
        address: account || '0x0'
    })
    const data = nfts.data || []

    console.log(nfts)
    let nftElements = data.map(nft => {
        console.log('NFT: ', nft)
        return <Box>NFT {nft.name }</Box>
    })

    return (
        <Box>
            { nftElements }
        </Box>
    )
}

export default NFTView