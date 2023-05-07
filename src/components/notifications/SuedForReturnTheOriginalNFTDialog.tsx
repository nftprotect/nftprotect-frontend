import { useEffect } from "react"
import {
    chakra,
    Box,
    Flex,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    Card,
    CardHeader,
    CardBody,
    useDisclosure
} from '@chakra-ui/react'

import { formatAddress, copyTextToClipboard } from '../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import NFT from '../../classes/NFT';
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"

interface DialogInitialData {
    nft: NFT,
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
}

const SuedForReturnTheOriginalNFTDialog = ({nft, setRefreshPaused, originalOwner }: DialogInitialData) => {

    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    function getNftImage() {
        return <Flex
            borderRadius={{base: "16px"}}
            filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
            overflow="hidden"
            my={{base: "20px"}}
            justifyContent="center"
            h="150px"
            w="150px"
        >
            <Image 
                src={ nft.thumbnail }
                alt={ nft.title || t`NFT image`}
                borderRadius="1rem"
            />
        </Flex>
    }

    useEffect(() => {
        setDialog('SuedForReturnTheOriginalNFTDialog', disclosure)
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
            onClose={() => {
                onClose()
                setRefreshPaused(false)
            }}
        >
            <ModalOverlay />
            <ModalContent
                maxW={{base: "450px"}}
                sx={{
                    "::-webkit-scrollbar": {
                        w: "5px",
                    },
                    "::-webkit-scrollbar-track": {
                        my: '16px',
                        overflowY: "hidden"
                    },
                    "::-webkit-scrollbar-thumb": {
                        bgColor: 'accent.light',
                    }

                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3">
                                <Trans>You{'\u0027'}re being sued</Trans>
                            </Text>
                        </CardHeader>
                        <CardBody>

                            { getNftImage() }

                            <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                    <Trans>The owner of the pNFT</Trans>
                                    {" "}
                                    <Popover placement='top'>
                                        <PopoverTrigger>
                                            <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                        </PopoverTrigger>
                                        <PopoverContent w="150px">
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverBody >
                                                <Trans>Copied{"!"}</Trans>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    
                                    <span id='originalOwnerAddressHolder'>
                                        { " (" + formatAddress(originalOwner, 4) + ") " }
                                    </span>
                                    <Trans>has initiated a dispute in the Kleros decentralized court, in order to obtain</Trans>
                                </Text>

                                <Text mb={{base: "20px"}}>
                                    <Trans>Check out the details<br/> </Trans>
                                    <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer" color="#2D7BD6">
                                        <Trans>dispute N1234</Trans>
                                    </Link>
                                </Text>

                                <Text>
                                    <Trans>You can add more evidence to your dispute using the provided link within the <chakra.span color="danger">next</chakra.span> 48 hours while the evidence collection phase is still ongoing.</Trans>
                                </Text>
                            </Flex>

                            <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid #2D7BD6" borderRadius="16px">
                                <Box color="#2D7BD6" mr={[2]}>
                                    <Info fontSize='32px' />
                                </Box>
                                <Flex flexDirection="column">
                                    <Text textStyle="paragraph" color="muted">
                                        <Trans>Kleros is an open source online dispute resolution protocol that uses blockchain and crowdsourcing 
                                        to resolve disputes fairly.</Trans>
                                    </Text>
                                    <Text>
                                        <Link href='https://kleros.io/' isExternal rel="noreferrer" color="#2D7BD6" textStyle="paragraph" textDecoration="underline">
                                            <Trans> To learn more</Trans>
                                            <ArrowForwardIcon ml={{base: '2px'}} />
                                        </Link>
                                    </Text>
                                </Flex>
                            </Flex>
                        </CardBody>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default SuedForReturnTheOriginalNFTDialog