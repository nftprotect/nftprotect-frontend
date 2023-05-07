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

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
}

const ClaimantLostDialog = ({nft, nftReFetch, setRefreshPaused, originalOwner }: ButtonInitialData) => {

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
        setDialog('ClaimantLostDialog', disclosure)
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
                                <Trans>The court{'\u0027'}s decision<br/>is now in effect</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody>
                            { getNftImage() }
                            <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                <Popover placement='top'>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                        <Trans>User</Trans>
                                        {" "}
                                        <PopoverTrigger>
                                            <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" fontSize="18px" />
                                        </PopoverTrigger>
                                        {/* TODO add pNFT owner address if the pNFT owner win */}
                                        {/* 
                                        <chakra.span id='originalOwnerAddressHolder'>
                                            { " " + formatAddress(pNFTOwner, 4) + " " }
                                        </chakra.span>
                                        TODO add condition that claimant lost the court and pNFT remains at pNFT owner
                                        <Trans>is still the owner of the pNFT. He can now sue you for Ownership Adjustment in dispute of Bona Fide Transfer.</Trans> 
                                        */}
                                        
                                        {/* TODO add condition original NFT owner win */}
                                        <chakra.span id='originalOwnerAddressHolder'>
                                            { " " + formatAddress(originalOwner, 4) + " " }
                                        </chakra.span>
                                        <Trans>is still the owner of the orginal NFT. He can now sue you for Ownership restoration in dispute of loss of the pNFT.</Trans>
                                    </Text>
                                    <PopoverContent w="150px">
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody >
                                            <Trans>Copied{"!"}</Trans>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>

                                <Text>
                                    <Trans>Check out the details<br/> </Trans>
                                    <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer" color="#2D7BD6" textTransform="uppercase">
                                        <Trans>dispute N1234</Trans>
                                    </Link>
                                </Text>
                            </Flex>
                        </CardBody>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ClaimantLostDialog