import { Web3Provider } from '@ethersproject/providers'
import {
    Card, 
    CardBody, 
    Text,
    Box,
    Spinner,
    Image,
    Flex,
} from '@chakra-ui/react'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { useState, useEffect } from 'react';
import { deIpfsUrl } from '../../utils/helpers'
import SecureNFTButton from './nftButtons/SecureNFTButton';
import UnSecureNFTButton from './nftButtons/UnSecureNFTButton';
import ERC721ABI from '../../abi/ERC721ABI';
import ERC1155ABI from '../../abi/ERC1155ABI';
import { Contract } from '@ethersproject/contracts';
import RequestOriginalNFTButton from './nftButtons/RequestOriginalNFTButton';
import ReleaseOriginalNFTButton from './nftButtons/ReleaseOriginalNFTButton';
import LostPNFTButton from './nftButtons/LostPNFTButton';
import { BigNumber } from 'moralis/common-core';
import { useAppContext } from '../../context/AppContextProvider';
import ArbitrateOwnershipAdjustmentButton from './nftButtons/ArbitrateOwnershipAdjustmentButton';

interface NFTInitialData {
    nft: EvmNft,
    nftReFetch: Function
}

interface OriginalNFTData {
    standard: string,
    contractAddress: string,
    tokenId: number,
    amount: number,
    owner: string,
    securityLevel: number
}

export interface ActionRequest {
    id: number,
    reqtype: number,
    tokenId: number,
    newowner: string,
    timeout: number,
    status: RequestStatus,
    arbitrator: string,
    disputeId: number
}

export enum RequestStatus {
    Initial,
    Accepted,
    Rejected,
    Disputed
}

const NFTCard = ({ nft, nftReFetch }: NFTInitialData) => {
    const { account, library, nftProtectContract, currentBlock } = useAppContext()
    // Stores the metadata of NFT
    const [ metadata, setMetadata ] = useState<any>(nft.metadata)
    // Becomes false if metadata is unawailable for some reason
    const [ hasMetadata, setHasMetadata ] = useState(true)
    // In case of external metadata fetching it marks if fetch is ended
    const [ fetchEnded, setFetchEnded ] = useState(false)
    // If our NFT is pNFT it stores the info about original NFT
    const [ originalNFTData, setOriginalNFTData ] = useState<OriginalNFTData>()
    // Stores pending request data if available
    const [ pendingRequest, setPendingRequest ] = useState<ActionRequest>()
    // Marks if request is timed out (if exists)
    const [ requestTimedOut, setRequestTimedOut] = useState(false)
    // Stores original NFT's owner address
    const [ originalOwner, setOriginalOwner ] = useState<string>()
    // Contract of the NFT
    const tokenContract = nft.contractType === 'ERC721' ?
        new Contract(nft.tokenAddress.format(), ERC721ABI, library?.getSigner()) :
        new Contract(nft.tokenAddress.format(), ERC1155ABI, library?.getSigner())
    // Marks if our NFT is pNFT
    const isWNFT = tokenContract.address.toLowerCase() === nftProtectContract.address.toLowerCase()
    // Marks if this is our pNFT on other address
    const isOnAnotherAddress = isWNFT ? 
        nft.ownerOf?.format().toLowerCase() !== account?.toLowerCase() :
        false

    // Fetching metadata if it's unawailable by default
    const fetchMetadataUri = async (uri: string) => {  
        const response = await fetch(uri, {
            headers: {
                'Accept': 'application/json'
            }
        })
        const data = await response.json()
        return {response, data}
    }

    // If our NFT is pNFT we have to know about the original NFT
    const loadOriginalNFTData = () => {
        const isNotNullAddress = (address: string) => address !== '0x0000000000000000000000000000000000000000'
        nftProtectContract.tokens(nft.tokenId).then(([ 
            standardId, 
            contractAddress721, 
            contractAddress1155,
            contractAddress20,
            tokenId,
            amount,
            owner,
            securityLevel
        ]:any[]) => {
            const otherParams = {
                tokenId: tokenId,
                amount: amount,
                owner: owner,
                securityLevel: securityLevel
            }
            if (isNotNullAddress(contractAddress721)) {
                setOriginalNFTData({
                    standard: 'ERC721',
                    contractAddress: contractAddress721,
                    ...otherParams
                })
            } else if (isNotNullAddress(contractAddress1155)) {
                setOriginalNFTData({
                    standard: 'ERC1155',
                    contractAddress: contractAddress1155,
                    ...otherParams
                })
            } else if (isNotNullAddress(contractAddress20)) {
                setOriginalNFTData({
                    standard: 'ERC20',
                    contractAddress: contractAddress20,
                    ...otherParams
                })
            }
        })
    }

    // Checks if pNFT has request to transfer
    const loadPendingRequest = () => {
        nftProtectContract.tokenToRequest(nft.tokenId).then((requestId: number) => {
            if (requestId.toString() !== '0') {
                nftProtectContract.requests(requestId).then((request: any) => {
                    setPendingRequest({id: requestId, ...request})
                })
            }
        })
    }

    // Checks if pNFT has request to transfer
    const loadOriginalOwner = () => {
        nftProtectContract.originalOwnerOf(nft.tokenId).then((address: string) => {
            setOriginalOwner(address)
        })
    }

    useEffect(() => {
        // If no metadata preloaded trying to load it by tokenUri
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
        if (isWNFT) {
            // Load info about original NFT
            loadOriginalNFTData()
            // Load original owner address
            loadOriginalOwner()
            // We have to check if there's a request to transfer
            loadPendingRequest()
        }
    }, [])

    // Check request timeout on every block
    useEffect(() => {
        if (pendingRequest && (pendingRequest.status === RequestStatus.Initial) && !requestTimedOut) {
            library.getBlock(currentBlock).then((blockData: any) => {
                if (blockData.timestamp >= pendingRequest.timeout) {
                    setRequestTimedOut(true)
                }
            })
        }
    }, [currentBlock])

    let result = <div />
    let buttons = <div />
    if (isWNFT) {
        // We can't show buttons for pNFT before we have info about original NFT
        if (originalNFTData) {
            console.log('ORIGINAL NFT DATA:', originalNFTData)
            console.log('PENDING REQUEST:', nft.tokenId, pendingRequest)
            if (!isOnAnotherAddress && (originalNFTData.owner.toLowerCase() === account?.toLowerCase())) {
                // Original NFT and pNFT are both belong to user
                buttons = <UnSecureNFTButton 
                    nft={ nft } 
                    metadata={ metadata } 
                    nftReFetch={ nftReFetch } 
                    tokenContract={ tokenContract }
                />
            } else if (!isOnAnotherAddress && (originalNFTData.owner.toLowerCase() !== account?.toLowerCase())) {
                // This pNFT belongs to user but original is not
                if (!pendingRequest) {
                    // If no request pending then we can sent it, so showing the button
                    buttons = <RequestOriginalNFTButton
                        nft={ nft } 
                        metadata={ metadata } 
                        nftReFetch={ nftReFetch } 
                        tokenContract={ tokenContract }
                        originalOwner={ originalOwner || '' }
                    />
                } else {
                    // If request is timed out or rejected we can create a court
                    if (requestTimedOut || pendingRequest.status === RequestStatus.Rejected) {
                        buttons = <ArbitrateOwnershipAdjustmentButton
                            nft={ nft } 
                            metadata={ metadata } 
                            nftReFetch={ nftReFetch } 
                            pendingRequest={ pendingRequest }
                            originalOwner={ originalOwner || '' }
                            loadPendingRequest={ loadPendingRequest }
                        />
                    // Otherwise we can only wait
                    } else if (pendingRequest.status === RequestStatus.Initial) {
                        buttons = <Text>Pending request...</Text>
                    } else if (pendingRequest.status === RequestStatus.Disputed) {
                        buttons = <Text>Uder dispute {pendingRequest.disputeId}...</Text>
                    }
                }
            }
            else if (isOnAnotherAddress) {
                // Original NFT belongs to user, but this pNFT is not
                buttons = <ReleaseOriginalNFTButton
                    nft={ nft } 
                    metadata={ metadata } 
                    nftReFetch={ nftReFetch } 
                    tokenContract={ tokenContract }
                    pendingRequest={ pendingRequest?.id }
                />
            } 
        }
    } else {
        buttons = <SecureNFTButton 
            nft={ nft } 
            metadata={ metadata }
            nftReFetch={ nftReFetch }
            tokenContract={ tokenContract }
        />
    }
    if (metadata) {
        // Metadata already loaded, showing it
        const img = deIpfsUrl(metadata?.image)
        result = <Image 
                    src={ img } 
                    minH={ {base: "6em", sm: "10em", md: "9em", lg: "13em", xl: "15em"} }
                />
    } else if (!fetchEnded) {
        // Metadata is still loading, showing loading
        result = <Spinner size='xl' mt={4} />
    } else {
        // No metadata, showing the plug
        result = <Image src={'/download.png'} height='12em'/>
    }
    return (
        <Card 
            variant='elevated'
            mb={[2, 4]}
        >
            <CardBody
                p={[2, 5]}
            >
                <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    h="100%"
                >
                    <Flex
                        flexDirection="column"
                    >
                        <Box alignSelf="center" >{ result }</Box>

                        <Text my={[2, 4]} fontSize={['xs', 'sm', 'md', 'lg']}>
                            { metadata?.name || nft.name }
                        </Text>

                        <Text fontSize={['2xs', 'sm', 'md']} >
                            { nft.name }
                        </Text>
                    </Flex>

                    <Box>
                        { buttons }
                        {/* <LostPNFTButton 
                            nft={ nft } 
                            metadata={ metadata }
                            nftReFetch={ nftReFetch }
                            tokenContract={ tokenContract }
                        /> */}
                    </Box>
                </Flex>
            </CardBody>
        </Card>
    )
}

export default NFTCard