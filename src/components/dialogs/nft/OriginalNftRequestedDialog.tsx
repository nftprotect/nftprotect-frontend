import { useEffect, useState } from 'react';
import {
    chakra,
    Button,
    Box,
    Flex,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Divider,
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
    useDisclosure
} from '@chakra-ui/react'
import { useAppContext } from '../../../context/AppContextProvider';
import { copyTextToClipboard } from '../../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import NFT from "../../../classes/NFT";
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import AddressDisplay from '../../AddressDisplay';

interface DialogInitialData {
    nftReFetch: Function, // function to update nft list
}

const OriginalNftRequestedDialog = ({ nftReFetch }: DialogInitialData) => {

    const [ nft, setNft ] = useState<NFT>()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const originalOwner = nft?.originalData?.ownerAddress

    enum StepMapping {
        start,
    }

    const copyPNftOwnerToClipboard = () => {
        copyTextToClipboard(nft?.ownerAddress || '', '#pNftOwnerAddressHolder')
    }

    const dialogClose = () => {
        setNextStep(StepMapping.start)
        onClose()
    }

    useEffect(() => {
        setDialog('OriginalNftRequestedDialog', {...disclosure, setNft})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={dialogClose}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "450px"}}
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
                    <Card variant="stepContent" borderRadius="0" pb="0" >
                        <CardHeader>
                            <Text as="h3" textStyle="h3">
                                <Trans>Transfer the original NFT<br /> to the new owner?</Trans>
                            </Text>
                        </CardHeader>
                        <CardBody>

                            { nft && <NFTImage nft={nft} /> }
                            <Popover placement='top'>
                                <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                    <Trans>If you transferred the pNFT to user</Trans>
                                    <chakra.span id='pNftOwnerAddressHolder'>
                                        { " " }<AddressDisplay address={nft?.ownerAddress||''}/>
                                    </chakra.span>
                                    <PopoverTrigger>
                                        <CopyIcon onClick={ copyPNftOwnerToClipboard } cursor="pointer" fontSize="18px" ml={{base: "2px"}} />
                                    </PopoverTrigger>
                                    {" "}
                                    <chakra.span>
                                        <Trans>confirm the transmission of the original NFT</Trans>
                                    </chakra.span>
                                </Text>
                                <PopoverContent w="150px">
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody >
                                        <Trans>Copied{"!"}</Trans>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center" mb={{base: "20px"}}>
                            <Box w={{base: "60%", sm: "50%"}}>
                                <Button
                                    variant={"darkOutline"}
                                    onClick={ () => {
                                        const dialog = getDialog('TransferOriginalNftDialog')
                                        onClose()
                                        dialog.setStartWithDialog(false)
                                        dialog.setNft(nft)
                                        dialog.onOpen()
                                    } }
                                >
                                    <Trans>Transfer original</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                    <Divider orientation='horizontal' borderBottom="1px solid #000"/>

                    <Card variant="stepContent" borderRadius="0" bgColor="rgba(255, 96, 96, 0.2)" py={{base: "10px"}}>
                        <CardBody mt={{base: "10px"}}>
                            <Popover placement='top'>
                                <Text textStyle="paragraph" textAlign="center" letterSpacing="0.04em" mb={{base: "10px"}}>
                                    <Trans>If you did not transfer the pNFT to</Trans>
                                    <chakra.span id='pNftOwnerAddressHolder'>
                                        { " " }<AddressDisplay address={nft?.ownerAddress||''}/>
                                    </chakra.span>
                                    <PopoverTrigger>
                                        <CopyIcon onClick={ copyPNftOwnerToClipboard } cursor="pointer" fontSize="18px" ml={{base: "2px"}} />
                                    </PopoverTrigger>
                                </Text>
                                <PopoverContent w="150px">
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody >
                                        <Trans>Copied{"!"}</Trans>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                            <Text textStyle="paragraph" fontWeight="700" mb={{base: "10px"}} textAlign="center" letterSpacing="0.04em" color="danger">
                                <Trans>YOUR ASSET MAY HAVE BEEN STOLEN!</Trans>
                            </Text>
                            <Text textStyle="paragraph" textAlign="center" letterSpacing="0.04em" mb={{base: "20px"}}>
                                <Trans>We recommend refuse to give the owner of the pNFT the original NFT and on next step opening a dispute in the Kleros decentralized court to burn the pNFT in the attacker{'\u0027'}s wallet.</Trans>
                            </Text>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%"}} mb={{base: "20px"}} >
                                <Button
                                    variant={"darkOutline"}
                                    onClick={ () => {
                                        const dialog = getDialog('DoNotTransferOriginalNftDialog')
                                        onClose()
                                        dialog.setNft(nft)
                                        dialog.onOpen()
                                    } }
                                >
                                    <Trans>Do not transfer original</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>

                    <Divider orientation='horizontal' borderTop="1px solid #000" />

                    <Card variant="stepContent" borderRadius="0">
                        <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="brand.light" borderRadius="16px">
                            <Box color="#2D7BD6" mr={[2]} >
                                <Info fontSize='32px' />
                            </Box>
                            <Flex flexDirection="column">
                                <Text textStyle="paragraph" color="text.muted">
                                    <Trans>Please note that refusing to hand over the original NFT to its rightful owner may result in legal action against you in the Kleros decentralized court.</Trans>
                                </Text>
                            </Flex>
                        </Flex>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default OriginalNftRequestedDialog