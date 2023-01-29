import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
    Card, 
    CardBody, 
    Text,
    Box,
    Spinner,
    Image,
} from '@chakra-ui/react'
import { useEvmNFTMetadata } from '@moralisweb3/next';
import { GetNFTMetadataRequest } from '@moralisweb3/common-evm-utils';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmChainish } from 'moralis/common-core';
import { EvmAddressish } from '@moralisweb3/common-evm-utils';
import { useState, useEffect } from 'react';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { deIpfsUrl } from '../../utils/helpers'
import SecureNFTButton from './SecureNFTButton';

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
    const [ fetchEnded, setFetchEnded ] = useState(true)

    useEffect(() => {
        if (!metadata && hasMetadata) {
            if (nft.tokenUri) {
                if (fetchEnded) {
                    setFetchEnded(false)
                    fetchMetadataUri(nft.tokenUri || '').then(({response, data}) => {
                        if (response.ok) {
                            setMetadata(data)
                        } else {
                            setHasMetadata(false)
                        }
                        setFetchEnded(true)
                    })
                }
            } else {
                setHasMetadata(false)
            }
        }
    })

    let result = <div />

    if (metadata) {
        // Metadata already loaded, showing it
        const img = deIpfsUrl(metadata?.image)
        result = <Image src={ img } height='12em'/>
    } else if (!fetchEnded) {
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
                    <Text>{ metadata?.name || nft.name }</Text>
                    <Box width="100%" />
                    <Text float="right">x{ nft.amount }</Text>
                    <SecureNFTButton nft={ nft } metadata={ metadata } />
                </Box>
            </CardBody>
        </Card>
    )
}

export default NFTCard