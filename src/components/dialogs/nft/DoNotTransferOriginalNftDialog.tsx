import { useEffect, useState } from 'react';
import {
    Button,
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
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Spinner,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { Info } from '@web3uikit/icons'
import { Trans, t } from '@lingui/macro';
import CancelledStepContent from '../../steps/CancelledStepContent'
import TimeoutStepContent from '../../steps/TimeoutStepContent'
import ErrorStepContent from '../../steps/ErrorStepContent'
import NFT from "../../../classes/NFT";
import { handleTransactionError } from '../../../utils/errorHandling';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import { copyTextToClipboard } from '../../../utils/helpers';
import { CopyIcon } from '@chakra-ui/icons'
import AddressDisplay from '../../AddressDisplay';
import useNftProtect from '../../../hooks/useNftProtect';
import { usePublicClient } from 'wagmi';

const DoNotTransferOriginalNftDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const { currentChain, defaultChain } = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const { getRequestByTokenId, answerOwnershipAdjustment } = useNftProtect(currentChain?.id || defaultChain.id)
    const [ nextStep, setNextStep ] = useState<number>(0)
    const publicClient = usePublicClient()    

    enum StepMapping {
        confirmTransaction,
        waitForTransactionConfirmation,
        finalCompleted,
        canceled,
        error,
        timeout
    }

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(StepMapping.error)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
    }

    const finalTransactionSent = async (hash: `0x${string}`) => {
            setNextStep(StepMapping.waitForTransactionConfirmation);
            const receipt = await publicClient!.waitForTransactionReceipt({ hash });
            if (receipt.status === 'success') {
                setNextStep(StepMapping.finalCompleted);
                console.log("Transaction successful", hash);
                //     nft!.pendingRequest = await getRequestByTokenId(nft!.tokenId) || undefined
                //     setNft(nft)
            } else {
                handleTransactionFailed(receipt);
            }
    }

    const startTransaction = async () => {
        const errorHandlings = {
            default: handleUnknownError,
            UserRejectedRequestError: handleRejected
        };
        try {
            if (nft && nft.pendingRequest) {
                console.log('ANSWER ADJUSTMENT REJECT');
                let hash;
                try {
                    hash = await answerOwnershipAdjustment(nft.pendingRequest.id, false, '');
                } catch (error) {
                    handleTransactionError(error, errorHandlings);
                    return;
                }
                finalTransactionSent(hash!);
            }
        } catch (error) {
            handleUnknownError(error);
        }
    }

    const copyPNftOwnerToClipboard = () => {
        copyTextToClipboard(nft?.ownerAddress || '', '#pNftOwnerAddressHolder')
    }

    const dialogClose = () => {
        setNextStep(StepMapping.confirmTransaction)
        onClose()
    }

    useEffect(() => {
        setDialog('DoNotTransferOriginalNftDialog', {...disclosure, setNft})
    }, [])

    useEffect(() => {
        isOpen && startTransaction()
    }, [isOpen])

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
                    <Wizard>
                        {/* confirmTransaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Do not transfer the original NFT <br/>to the new owner</Trans>{"?"}
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                    <Text textStyle="paragraph">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Waiting for transaction confirmation */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Do not transfer the original NFT <br/>to the new owner</Trans>{"?"}
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                        <Text textStyle="paragraph">
                                            <Trans>{"Wait for transaction to confirm…"}</Trans>
                                        </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Dispute sent succesfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "360px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>The original NFT <br/>remains in your wallet</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody mb={{base: "20px"}}>
                                        { nft && <NFTImage nft={nft} /> }
                                        <Popover placement='top'>
                                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                                <Trans>The pNFT is at user</Trans>
                                                <chakra.span id='pNftOwnerAddressHolder'>
                                                    { " " } <AddressDisplay address={nft?.ownerAddress||''}/>
                                                </chakra.span>
                                                <PopoverTrigger>
                                                    <CopyIcon onClick={ copyPNftOwnerToClipboard } cursor="pointer" ml={{base: "2px"}} fontSize="18px" />
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
                                        <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="danger" borderRadius="16px" bgColor="rgba(255, 96, 96, 0.2)">
                                            <Box color="danger" mr={[2]} >
                                                <Info fontSize='32px' />
                                            </Box>
                                            <Flex flexDirection="column">
                                                <Text textStyle="paragraph">
                                                    <Trans>{"This is a controversial issue! We recommend you transfer the original if everything is OK or raise a dispute in decentralized court if unsure."}</Trans>
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </CardBody>

                                    <CardFooter>
                                        <Flex 
                                            flexWrap={{base: "wrap", sm: "nowrap"}}
                                            alignSelf="flex-start"
                                            justifyContent="space-around"
                                            w="100%"
                                            mb={{base: "20px"}}
                                        >
                                            <Box w={{base: "100%", sm: "45%"}}>
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
                                                    <Trans>Transfer NFT</Trans>
                                                </Button>
                                            </Box>
                                            <Box w={{base: "100%", sm: "45%"}}>
                                                <Button
                                                    variant={"darkOutline"}
                                                    onClick={ () => {
                                                        const dialog = getDialog('LostPNftDialog')
                                                        onClose()
                                                        dialog.setNft(nft)
                                                        dialog.onOpen()
                                                    } }
                                                >
                                                    <Trans>Open dispute</Trans>
                                                </Button>
                                            </Box>
                                        </Flex>
                                </CardFooter>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <CancelledStepContent />
                        </SwitchableOutside>

                        {/* Error */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <ErrorStepContent />
                        </SwitchableOutside>

                        {/* Timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <TimeoutStepContent />
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default DoNotTransferOriginalNftDialog