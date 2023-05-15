import {
    Heading,
    Card, 
    CardBody, 
    Text,
    Box,
    Spinner,
    Image,
    Flex,
    Button,
    propNames,
    Link,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import SecureNFTButton from './nftButtons/SecureNFTButton';
import UnSecureNFTButton from './nftButtons/UnSecureNFTButton';
import RequestOriginalNFTButton from './nftButtons/RequestOriginalNFTButton';
import TransferOriginalNFTButton from './nftButtons/TransferOriginalNFTButton';
import LostPNFTButton from './nftButtons/LostPNFTButton';
import { useAppContext } from '../../context/AppContextProvider';
import ArbitrateOwnershipAdjustmentButton from './nftButtons/ArbitrateOwnershipAdjustmentButton';
import { useNotificationContext } from '../../context/NotificationContextProvider';
import { Trans } from '@lingui/macro';
import NFT from '../../classes/NFT';
import { OriginalNFTData, ActionRequest, NFTEvents, RequestStatus } from '../../classes/NFT';
import KlerosCaseDialog from '../dialogs/klerosCase/KlerosCaseDialog'
import OriginalNFTRequestedButton from './nftButtons/OriginalNFTRequestedButton';
import { useCallableDialogContext } from '../../context/CallableDialogContextProvider';
import { createDisputeLink } from '../../utils/kleros';

interface NFTInitialData {
    nft: NFT,
    nftReFetch: Function,
    setRefreshPaused: Function
}

const NFTCard = ({ nft: _nft, nftReFetch, setRefreshPaused }: NFTInitialData ) => {
    const { account, library, nftProtectContract, currentBlock } = useAppContext()
    const {
        addNotifications, 
        notificationsCount
    } = useNotificationContext()
    // Stores the metadata of NFT
    //const [ metadata, setMetadata ] = useState<any>(nft.metadata)
    // Becomes false if metadata is unawailable for some reason
    //const [ hasMetadata, setHasMetadata ] = useState(true)
    // In case of external metadata fetching it marks if fetch is ended
    //const [ fetchEnded, setFetchEnded ] = useState(false)
    const [ nft, setNft ] = useState<NFT>(_nft)
    // If our NFT is pNFT it stores the info about original NFT
    const [ originalNFTData, setOriginalNFTData ] = useState<OriginalNFTData>()
    // Stores pending request data if available
    const [ pendingRequest, setPendingRequest ] = useState<ActionRequest>()
    // Marks if request is timed out (if exists)
    const [ requestTimedOut, setRequestTimedOut] = useState(false)

    const [components, setComponents] = useState(["Sample Component"]); 
    const { getDialog } = useCallableDialogContext()

    // Fetching metadata if it's unawailable by default
    // const fetchMetadataUri = async (uri: string) => {  
    //     const response = await fetch(uri, {
    //         headers: {
    //             'Accept': 'application/json'
    //         }
    //     })
    //     const data = await response.json()
    //     return {response, data}
    // }

    useEffect(() => {
        // If no metadata preloaded trying to load it by tokenUri
        // if (!metadata && hasMetadata) {
        //     if (nft.tokenUri) {
        //         fetchMetadataUri(nft.tokenUri || '').then(({response, data}) => {
        //             if (response.ok) {
        //                 setMetadata(data)
        //             } else {
        //                 setHasMetadata(false)
        //             }
        //             setFetchEnded(true)
        //         }).catch(() => setFetchEnded(true))
        //     } else {
        //         setHasMetadata(false)
        //         setFetchEnded(true)
        //     }
        // }

        // Load all secondary NFT data
        nft.loadAnotherData()
        const originalNFTDataLoadedListener = () => {
            console.log('ORIGINAL NFT DATA:', nft.originalData)
            setOriginalNFTData(nft.originalData)
        }
        const pendingRequestLoadedListener = () => {
            console.log('PENDING REQUEST:', nft.tokenId, nft.pendingRequest)
            setPendingRequest(nft.pendingRequest)
        }
        if (nft.isPNFT()) {
            nft.addEventListener(NFTEvents.OriginalNFTDataLoaded, originalNFTDataLoadedListener)
            nft.addEventListener(NFTEvents.PendingRequestLoaded, pendingRequestLoadedListener)
        }
        return () => {
            if (nft.isPNFT()) {
                nft.removeEventListener(NFTEvents.OriginalNFTDataLoaded, originalNFTDataLoadedListener)
                nft.removeEventListener(NFTEvents.PendingRequestLoaded, pendingRequestLoadedListener)
            }
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
    if (nft.isPNFT()) {
        // We can't show buttons for pNFT before we have info about original NFT
        if (originalNFTData !== undefined) {
            if (!nft.isOnAnotherAddress() && nft.isOriginalOwnedByAccount()) {
                // Original NFT and pNFT are both belong to user
                buttons = 
                    <Box mb={[2]}>
                        <UnSecureNFTButton 
                            nft={ nft } 
                            nftReFetch={ nftReFetch }
                            setRefreshPaused = { setRefreshPaused }
                            tokenContract={ nft.loadedContract }
                            variant={"dark-outline"}
                        />
                    </Box>
            } else if (!nft.isOnAnotherAddress() && !nft.isOriginalOwnedByAccount()) {
                // This pNFT belongs to user but original is not
                if (!pendingRequest) {
                    // If no request pending then we can sent it, so showing the button
                    buttons = 
                        <Box mb={[2]}>
                            <RequestOriginalNFTButton
                                nft={ nft } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                tokenContract={ nft.loadedContract }
                                originalOwner={ originalNFTData.ownerAddress }
                                variant={"primary-solid"}
                            />
                        </Box>
                } else {
                    // If request is timed out or rejected we can create a court
                    if (requestTimedOut || pendingRequest.status === RequestStatus.Rejected) {
                        buttons = 
                            <Box mb={[2]}>
                                <ArbitrateOwnershipAdjustmentButton
                                    nft={ nft } 
                                    nftReFetch={ nftReFetch }
                                    setRefreshPaused = { setRefreshPaused }
                                    pendingRequest={ pendingRequest }
                                    variant={"primary-solid"}
                                    requestTimedOut={ requestTimedOut }
                                />
                            </Box>
                    // Otherwise we can only wait
                    } else if (pendingRequest.status === RequestStatus.Initial) {
                        buttons =   <Flex 
                                        mb={[2]} 
                                        alignItems="center" 
                                        justifyContent="center" 
                                        fontWeight="600" 
                                        minH="2.25rem"
                                        px="16px"
                                        py="8px"
                                        borderRadius="16px"
                                        bgGradient="linear(315deg, accent.dark 0%, accent.light 100%)"
                                        color="#FFF"
                                        filter="drop-shadow(-4px 4px 10px rgba(0, 0, 0, 0.25))"
                                    >
                                        <Spinner borderWidth='2px' h={{base: "20px"}} w={{base: "20px"}} speed='0.65s' mr={{base: "10px"}} color="#FFF"></Spinner>
                                        <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
                                            <Trans>{"Pending..."}</Trans>
                                        </Text>
                                    </Flex>
                        
                    } else if (pendingRequest.status === RequestStatus.Disputed) {
                        buttons =   <Flex 
                                        mb={[2]} 
                                        alignItems="center" 
                                        justifyContent="center" 
                                        fontWeight="600" 
                                        minH="2.25rem"
                                        px="16px"
                                        py="8px"
                                        borderRadius="16px"
                                        bgGradient="linear(315deg, accent.dark 0%, accent.light 100%)"
                                        color="#FFF"
                                        filter="drop-shadow(-4px 4px 10px rgba(0, 0, 0, 0.25))"
                                    >
                                        <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
                                            <Link
                                                isExternal 
                                                rel="noreferrer"
                                                href={createDisputeLink(pendingRequest.externalDisputeId)}
                                            >
                                                <Trans>Under dispute</Trans>
                                            </Link>
                                        </Text>
                                    </Flex>
                    }
                }
            } else if (nft.isOnAnotherAddress()) {
                // Original NFT belongs to user, but this pNFT is not
                if (!pendingRequest) {
                    // If there's no pending request then we can Release NFT or Dispute NFT
                    buttons = (<>
                        <Box mb={[2]}>
                            <LostPNFTButton
                                buttonTitle={"Lost pNFT"}
                                nft={ nft } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                originalOwner={ originalNFTData.ownerAddress }
                                variant={ "primary-solid" }
                            />
                        </Box>
                        <Box mb={[2]}>
                            <TransferOriginalNFTButton
                                nft={ nft } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                pendingRequest={ undefined }
                                variant={"primary-solid"}
                            /> 
                        </Box>
                    </>)
                } else if (pendingRequest.status === RequestStatus.Initial) {
                    // If there's an initial request then we can only answer this request
                    buttons = (<>
                        <Box mb={[2]}>
                            <OriginalNFTRequestedButton
                                nft={ nft } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                originalOwner = { originalNFTData.ownerAddress }
                                pendingRequest={ pendingRequest?.id }
                                variant={"primary-solid"}
                            />
                        </Box>
                    </>)
                } else if (requestTimedOut || pendingRequest.status === RequestStatus.Rejected) {
                    // If there's an rejected request then we can only dispute this request
                    buttons = (<>
                        <Box mb={[2]}>
                            <LostPNFTButton
                                buttonTitle={"Lost pNFT"}
                                nft={ nft } 
                                nftReFetch={ nftReFetch }
                                setRefreshPaused = { setRefreshPaused }
                                originalOwner={ originalNFTData.ownerAddress }
                                variant={ "primary-solid" }
                            />
                        </Box>
                    </>)
                } else if (pendingRequest.status === RequestStatus.Disputed) {
                    buttons =   <Flex 
                                    mb={[2]} 
                                    alignItems="center" 
                                    justifyContent="center" 
                                    fontWeight="600" 
                                    minH="2.25rem"
                                    px="16px"
                                    py="8px"
                                    borderRadius="16px"
                                    bgGradient="linear(315deg, accent.dark 0%, accent.light 100%)"
                                    color="#FFF"
                                    filter="drop-shadow(-4px 4px 10px rgba(0, 0, 0, 0.25))"
                                >
                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
                                        <Link
                                            isExternal 
                                            rel="noreferrer"
                                            href={createDisputeLink(pendingRequest.externalDisputeId)}
                                        >
                                            <Trans>Under dispute</Trans>
                                        </Link>
                                    </Text>
                                </Flex>
                }
            } 
        }
    } else {
        buttons = (
            <>
            <Box mb={[2]}>
                <SecureNFTButton 
                    nft={ nft } 
                    nftReFetch={ nftReFetch }
                    setRefreshPaused={ setRefreshPaused }
                    variant={"primary-solid"}
                />
            </Box>
            {
                (process.env.NODE_ENV !== 'production') && <Box mb={[2]}>
                    <Button
                        onClick={ () => { 
                            const dialog = getDialog('KlerosCaseDialog')
                            dialog.setCaseData({
                                nft: nft,
                                metaEvidenceId: 4,
                                claimantAddress: '0xVictim', 
                                defendantAddress: '0xScammer', 
                                caseDescription: 'I put some text here',
                                evidences: []
                            })
                            dialog.onOpen() 
                        } }
                        variant={ "primary-solid" }
                        w="100%"
                    >
                        <Trans>Open Kleros Case</Trans>
                    </Button>
                </Box>
            }
            </>
        )
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
                            <Image
                                src={ nft.thumbnail }
                                position="absolute"
                                borderRadius="1rem"
                                h="100%"
                                w="100%"
                            />
                        </Flex>

                        <Text 
                            fontWeight="700"
                            fontSize={{base: "0.875rem"}}
                            lineHeight={{base: "1.125rem"}}
                            textTransform="uppercase"
                            mb={{base: "0.625rem"}}
                        >
                            { nft.title }
                        </Text>

                        <Text
                            fontWeight="400"
                            fontSize={{base: "0.625rem"}}
                            lineHeight={{base: "0.75rem"}}
                            mb={{base: "1.25rem"}}
                        >
                            { nft.contract.name }
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