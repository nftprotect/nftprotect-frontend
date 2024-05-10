import { useEffect, useState } from "react"
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
    CardFooter,
    Button,
    useDisclosure
} from '@chakra-ui/react'

import { copyTextToClipboard } from '../../../utils/helpers';
import { CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { Trans } from '@lingui/macro';
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import NFTImage from "../../nftView/NFTImage";
import AddressDisplay from "../../AddressDisplay";

const OriginalNftReceivedDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog, getDialog } = useCallableDialogContext()
    const [ previousOriginalOwner, setPreviousOriginalOwner ] = useState<string>()

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(previousOriginalOwner || '', '#originalOwnerAddressHolder')
    }

    useEffect(() => {
        setDialog('OriginalNftReceivedDialog', {...disclosure, setNft, setPreviousOriginalOwner})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={() => {
                onClose()
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
                        bgColor: 'brand.light',
                    }

                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3">
                                <Trans>Congrats!</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody mb={{base: "20px"}} >
                            <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                <Popover placement='top'>
                                    <br/>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "0px"}}>
                                        <chakra.span id='originalOwnerAddressHolder'>
                                            { " " } { previousOriginalOwner && <AddressDisplay address={previousOriginalOwner}/> } { " " }
                                        </chakra.span>
                                        <PopoverTrigger>
                                            <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" ml={{base: "2px"}} fontSize="18px" />
                                        </PopoverTrigger>
                                        { " " }
                                        <Trans>has<br/>transferred the original NFT to you.</Trans>
                                    </Text>
                                    <PopoverContent w="150px">
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody >
                                            <Trans>Copied{"!"}</Trans>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            </Text>
                            { nft && <NFTImage nft={nft} /> }
                        </CardBody>

                        <CardFooter w="100%" flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}}>
                                <Button 
                                    onClick={ () => {
                                        onClose()
                                        const dialog = getDialog('ProtectNftDialog')
                                        dialog.setNft(nft)
                                        dialog.onOpen()
                                    } }
                                    variant="darkOutline"
                                >
                                    <Trans>Protect NFT</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default OriginalNftReceivedDialog