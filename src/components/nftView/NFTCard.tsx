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
    Spinner,
    Image,
} from '@chakra-ui/react'
import { useEvmNFTMetadata } from '@moralisweb3/next';
import { GetNFTMetadataRequest } from '@moralisweb3/common-evm-utils';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmChainish } from 'moralis/common-core';
import { EvmAddressish } from '@moralisweb3/common-evm-utils';
import { NftCard } from '@web3uikit/core';
import { JsxElement } from 'typescript';
import { useState, useEffect } from 'react';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { deIpfsUrl } from '../../utils/helpers'

interface NFTInitialData {
    nft: EvmNft,
}

async function fetchMetadataUri(uri: string) {  
    const response = await fetch(uri, {
        headers: {
            'Accept': 'application/json'
        }
    })
    const data = await response.json()
    return {response, data}
}

const NFTCard = (props: NFTInitialData) => {

    const nft = props.nft
    const [ metadata, setMetadata ] = useState<any>(nft.metadata)
    const [ hasMetadata, setHasMetadata ] = useState(true)
    
    let fetchEnded = true

    useEffect(() => {
        if (!metadata) {
            if (nft.metadata) {
                setMetadata(nft.metadata)
                setHasMetadata(true)
            } else if (nft.tokenUri) {
                if (fetchEnded) {
                    fetchEnded = false
                    fetchMetadataUri(nft.tokenUri || '').then(({response, data}) => {
                        if (response.ok) {
                            setMetadata(data)
                            setHasMetadata(true)
                        } else {
                            setHasMetadata(false)
                        }
                        fetchEnded = true
                    })
                }
            } else {
                setHasMetadata(false)
            }
        }
    })

    let result = <div />

    if (hasMetadata && metadata) {
        // Metadata already loaded, showing it
        const img = deIpfsUrl(metadata?.image)
        result = <Image src={ img } height='12em'/>
    } else if (hasMetadata && !metadata) {
        // Metadata is still loading, showing loading
        result = <Spinner size='xl' />
    } else {
        // No metadata, showing the plug
        result = <Image src={'/download.png'} height='12em'/>
    }
    return (
        <Card 
            variant='elevated' 
            width='14em'
            align="center"
        >
            <CardBody alignItems="center">
                <Box>{ result }</Box>
                <Box display="flex">
                    <Text>{ metadata.name }</Text>
                    <Box width="100%" />
                    <Text float="right">x{ nft.amount }</Text>
                </Box>
            </CardBody>
        </Card>
    )
}

export default NFTCard