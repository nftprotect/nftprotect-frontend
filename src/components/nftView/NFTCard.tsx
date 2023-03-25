import { Web3Provider } from '@ethersproject/providers'
import {
    Heading,
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
import { useIPFSContext } from '../../context/IPFSContextProvider';
import { useNotificationContext } from '../../context/NotificationContextProvider';
import { Trans } from '@lingui/macro';
import { formatAddress } from '../../utils/helpers';

interface NFTInitialData {
    nft: EvmNft,
    nftReFetch: Function,
    setRefreshPaused: Function
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

const NFTCard = ({ nft, nftReFetch, setRefreshPaused }: NFTInitialData ) => {
    const { account, library, nftProtectContract, currentBlock } = useAppContext()
    const { centralizeIpfsUrl } = useIPFSContext()
    const {
        addNotifications, 
        notificationsCount
    } = useNotificationContext()
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
                    const newOwnerAddressFormatted = formatAddress(request.newowner, 4)
                    // Temporarily workaround
                    if (isWNFT && isOnAnotherAddress && originalNFTData && 
                        (originalNFTData.owner.toLowerCase() !== account?.toLowerCase()) &&
                        nft.ownerOf && (nft.ownerOf.format().toLowerCase() !== account?.toLowerCase())) {
                            return
                        }
                    return // temporary disable notification creating
                    if (isOnAnotherAddress) {
                        addNotifications([
                            {
                                id:'request-'+requestId,
                                image: metadata && {
                                    url: centralizeIpfsUrl(metadata.image),
                                    text: metadata.name || nft.name
                                },
                                callback: () => {alert('Pressed!')},
                                children:
                                    <div>
                                        <Heading 
                                            fontSize={{base: "0.875rem"}}
                                            mb={{base: "0.625rem"}}
                                        >
                                            <Trans values={{newOwnerAddressFormatted}}>User {newOwnerAddressFormatted} is requesting the original NFT.</Trans>
                                        </Heading>
                                        <Text
                                            fontSize={{base: "0.625rem"}}
                                        > 
                                            <Trans>Do you want to transfer the original to them?</Trans>
                                        </Text>
                                    </div>, 
                                severity: 0,
                                dateCreated: new Date()
                            }
                        ])
                    }
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
                buttons = 
                    <Box mb={[2]}>
                        <UnSecureNFTButton 
                            nft={ nft } 
                            metadata={ metadata } 
                            nftReFetch={ nftReFetch }
                            setRefreshPaused = { setRefreshPaused }
                            tokenContract={ tokenContract }
                            variant={"dark-outline"}
                        />
                    </Box>
            } else if (!isOnAnotherAddress && (originalNFTData.owner.toLowerCase() !== account?.toLowerCase())) {
                // This pNFT belongs to user but original is not
                if (!pendingRequest) {
                    // If no request pending then we can sent it, so showing the button
                    buttons = 
                        <Box mb={[2]}>
                            <RequestOriginalNFTButton
                                nft={ nft } 
                                metadata={ metadata } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                tokenContract={ tokenContract }
                                originalOwner={ originalOwner || '' }
                            />
                        </Box>
                } else {
                    // If request is timed out or rejected we can create a court
                    if (requestTimedOut || pendingRequest.status === RequestStatus.Rejected) {
                        buttons = 
                            <Box mb={[2]}>
                                <ArbitrateOwnershipAdjustmentButton
                                    nft={ nft } 
                                    metadata={ metadata } 
                                    nftReFetch={ nftReFetch }
                                    setRefreshPaused = { setRefreshPaused }
                                    pendingRequest={ pendingRequest }
                                    originalOwner={ originalOwner || '' }
                                    loadPendingRequest={ loadPendingRequest }
                                />
                            </Box>
                    // Otherwise we can only wait
                    } else if (pendingRequest.status === RequestStatus.Initial) {
                        buttons = <Text><Trans>{"Pending request…"}</Trans></Text>
                    } else if (pendingRequest.status === RequestStatus.Disputed) {
                        buttons = <Text>{`Under dispute ${pendingRequest.disputeId}…`}</Text>
                    }
                }
            }
            else if (isOnAnotherAddress) {
                // Original NFT belongs to user, but this pNFT is not
                buttons = (<>
                    <Box mb={[2]}>
                        <LostPNFTButton 
                            nft={ nft } 
                            metadata={ metadata }
                            nftReFetch={ nftReFetch }
                            setRefreshPaused = { setRefreshPaused }
                            tokenContract={ tokenContract }
                        />
                    </Box>
                    <Box mb={[2]}>
                        <ReleaseOriginalNFTButton
                        nft={ nft } 
                        metadata={ metadata } 
                        nftReFetch={ nftReFetch }
                        setRefreshPaused = { setRefreshPaused }
                        tokenContract={ tokenContract }
                        pendingRequest={ pendingRequest?.id }
                    />
                    </Box>
                </>)
            } 
        }
    } else {
        buttons = (
            <Box mb={[2]}>
                <LostPNFTButton 
                    nft={ nft } 
                    metadata={ metadata }
                    nftReFetch={ nftReFetch }
                    setRefreshPaused = { setRefreshPaused }
                    tokenContract={ tokenContract }
                />
            </Box>
        )
    }
    if (metadata) {
        // Metadata already loaded, showing it
        const img = centralizeIpfsUrl(metadata?.image)
        result = <Image
                    src={ img }
                    position="absolute"
                    borderRadius="1rem"
                    h="100%"
                    w="100%"
                />
    } else if (!fetchEnded) {
        // Metadata is still loading, showing loading
        result = <Spinner size='xl' mt={4} />
    } else {
        // No metadata, showing the plug
        result = <Image src={'./images/noImage.png'} 
                    position="absolute"
                    borderRadius="1rem"
                    h="100%"
                    w="100%"
                />
    }

    // Temporarily workaround
    if (isWNFT && isOnAnotherAddress && originalNFTData && 
        (originalNFTData.owner.toLowerCase() !== account?.toLowerCase()) &&
        nft.ownerOf && (nft.ownerOf.format().toLowerCase() !== account?.toLowerCase())) {
            return <></>
        }

    return (
        <Card 
            mb={[2, 4]}
            border="2px solid #000000"
            borderRadius="1rem"
        >
            <CardBody
                px={{base: "0.5rem"}}
                py={{base: "0.625rem"}}
                borderRadius="1rem"
            >
                <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    h="100%"
                >
                    <Flex
                        flexDirection="column"
                        justifyContent="space-between"
                    >
                        <Flex
                            position="relative"
                            pb="100%"
                            overflow="hidden"
                            mb={{base: "1.25rem"}}
                            justifyContent="center"
                        >
                            { result }
                        </Flex>

                        <Text 
                            fontWeight="700"
                            fontSize={{base: "0.875rem"}}
                            lineHeight={{base: "1.125rem"}}
                            textTransform="uppercase"
                            mb={{base: "0.625rem"}}
                        >
                            { metadata?.name || nft.name }
                        </Text>

                        <Text
                            fontWeight="400"
                            fontSize={{base: "0.625rem"}}
                            lineHeight={{base: "0.75rem"}}
                            mb={{base: "1.25rem"}}
                        >
                            { nft.name }
                        </Text>
                    </Flex>

                    <Box>
                        { buttons }
                    </Box>
                </Flex>
            </CardBody>
        </Card>
    )
}

export default NFTCard