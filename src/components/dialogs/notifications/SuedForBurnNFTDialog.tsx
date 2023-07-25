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
    useDisclosure
} from '@chakra-ui/react'

import { formatAddress, copyTextToClipboard, generateRequestLink } from '../../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { Trans } from '@lingui/macro';
import NFT, { ActionRequest } from '../../../classes/NFT';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import NFTImage from "../../nftView/NFTImage";
import { useAppContext } from "../../../context/AppContextProvider";

const SuedForBurnNFTDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const [ request, setRequest ] = useState<ActionRequest>()
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog } = useCallableDialogContext()
    const { currentChain } = useAppContext()
    const originalOwner = nft?.originalData?.ownerAddress

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    useEffect(() => {
        setDialog('SuedForBurnNFTDialog', {...disclosure, setNft, setRequest})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
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
                                <Trans>You{'\u0027'}re being sued</Trans>
                            </Text>
                        </CardHeader>
                        <CardBody>

                            { nft && <NFTImage nft={nft} /> }

                            <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                <Popover placement='top'>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                        <Trans>The owner of the original NFT</Trans>
                                        {" "}
                                        <chakra.span id='originalOwnerAddressHolder'>
                                            { originalOwner && (" " + formatAddress(originalOwner, 4)) }
                                        </chakra.span>
                                        <PopoverTrigger>
                                            <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" fontSize="18px" ml={{base: "2px"}} />
                                        </PopoverTrigger>
                                        
                                        <Trans>has initiated a dispute in the Kleros decentralized court, in order to burn your pNFT.</Trans>
                                    </Text>
                                    <PopoverContent w="150px">
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody >
                                            <Trans>Copied{"!"}</Trans>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>

                                <Text mb={{base: "20px"}}>
                                    <Trans>Check out the details<br/> </Trans>
                                    {request && <Link href={ generateRequestLink(request, currentChain.id) } isExternal rel="noreferrer" textDecoration="underline" cursor="pointer" color="#2D7BD6">
                                        <Trans>{`dispute #${request?.externalDisputeId}`}</Trans>
                                    </Link>}
                                </Text>

                                <Text>
                                    <Trans>You can add more evidence to your dispute using the provided link within the next 48 hours while the evidence collection phase is still ongoing.</Trans>
                                </Text>
                            </Flex>

                            <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid #2D7BD6" borderRadius="16px">
                                <Box color="#2D7BD6" mr={[2]}>
                                    <Info fontSize='32px' />
                                </Box>
                                <Flex flexDirection="column">
                                    <Text textStyle="paragraph" color="text.muted">
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

export default SuedForBurnNFTDialog