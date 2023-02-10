import { Web3Provider } from '@ethersproject/providers'
import {
    Card, 
    CardBody, 
    Text,
    Box,
    Spinner,
    Image,
} from '@chakra-ui/react'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { useState, useEffect } from 'react';
import { deIpfsUrl } from '../../utils/helpers'
import SecureNFTButton from './SecureNFTButton';
import UnSecureNFTButton from './UnSecureNFTButton';
import ERC721ABI from '../../abi/ERC721ABI';
import ERC1155ABI from '../../abi/ERC1155ABI';
import { Contract } from '@ethersproject/contracts';

interface NFTInitialData {
    nft: EvmNft,
    nftReFetch: Function,
    library: Web3Provider | undefined,
    account: string | null | undefined,
    nftProtectContract: Contract
}

const NFTCard = ({ nft, nftReFetch, library, account, nftProtectContract }: NFTInitialData) => {

    const [ metadata, setMetadata ] = useState<any>(nft.metadata)
    const [ hasMetadata, setHasMetadata ] = useState(true)
    const [ fetchEnded, setFetchEnded ] = useState(false)
    const tokenContract = nft.contractType === 'ERC721' ?
        new Contract(nft.tokenAddress.format(), ERC721ABI, library?.getSigner()) :
        new Contract(nft.tokenAddress.format(), ERC1155ABI, library?.getSigner())
    const isWNFT = tokenContract.address === nftProtectContract.address

    async function fetchMetadataUri(uri: string) {  
        const response = await fetch(uri, {
            headers: {
                'Accept': 'application/json'
            }
        })
        const data = await response.json()
        return {response, data}
    }

    useEffect(() => {
        if (!metadata && hasMetadata) {
            if (nft.tokenUri) {
                    fetchMetadataUri(nft.tokenUri || '').then(({response, data}) => {
                        if (response.ok) {
                            setMetadata(data)
                        } else {
                            setHasMetadata(false)
                        }
                        setFetchEnded(true)
                    }).catch(() => setFetchEnded(true))
            } else {
                setHasMetadata(false)
                setFetchEnded(true)
            }
        }
    }, [])

    let result = <div />
    let buttons = <div />
    if (isWNFT) {
        buttons = <UnSecureNFTButton 
            nft={ nft } 
            metadata={ metadata } 
            nftReFetch={ nftReFetch } 
            account={ account }
            tokenContract={ tokenContract }
            nftProtectContract={ nftProtectContract }
        />
    } else {
        buttons = <SecureNFTButton 
            nft={ nft } 
            metadata={ metadata }
            nftReFetch={ nftReFetch }
            account={ account }
            tokenContract={ tokenContract }
            nftProtectContract={ nftProtectContract }
        />
    }
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
                    { buttons }
                </Box>
            </CardBody>
        </Card>
    )
}

export default NFTCard