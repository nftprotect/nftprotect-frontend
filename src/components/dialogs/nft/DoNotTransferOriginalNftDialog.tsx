import { useEffect, useState } from 'react';
import {
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
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Spinner,
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
import { dialogsTimeout } from '../../../utils/config';
import { Contract } from '@ethersproject/contracts';
import { handleContractError } from '../../../utils/errorHandling';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';

interface ButtonInitialData {
    nftReFetch: Function, // function to update nft list
}

const DoNotTransferOriginalNftDialog = ({ nftReFetch }: ButtonInitialData) => {

    const [ nft, setNft ] = useState<NFT>()
    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()

    enum StepMapping {
        confirmTransaction,
        waitForTransactionConfirmation,
        finalCompleted,
        canceled,
        error,
        timeout
    }

    function getNftImage() {
        return nft && <Flex
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

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(StepMapping.error)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(onClose, dialogsTimeout)
    }

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(StepMapping.waitForTransactionConfirmation);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setNextStep(StepMapping.finalCompleted)
                    console.log("Transaction successful", tx.hash);
                    nftReFetch();
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const startTransaction = () => {
        try {
            if (nft && nft.pendingRequest) {
                console.log('ANSWER ADJUSTMENT REJECT')
                nftProtectContract.answerOwnershipAdjustment(nft.pendingRequest, false, '')
                    .then( finalTransactionSent(
                        nft.loadedContract,
                    ))
                    .catch(
                        handleContractError({
                            'ACTION_REJECTED': handleRejected,
                            default: handleUnknownError
                        })
                    )
            }
        } catch (err: any) {
            handleUnknownError(err)
        }
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
            onClose={() => {
                setNextStep(StepMapping.confirmTransaction)
                onClose()
            }}
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
                        bgColor: 'accent.light',
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
                                        <Trans>Transfer the <br/>original NFT to <br/> the new owner</Trans>{"?"}
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                    <Text textStyle="paragraph" textTransform="uppercase">
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
                                        <Trans>Transfer the <br/>original NFT to <br/> the new owner</Trans>{"?"}
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                        <Text textStyle="paragraph" textTransform="uppercase">
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
                                            <Trans>The original NFT <br/> remains in your <br/> wallet</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody mb={{base: "20px"}}>
                                        { getNftImage() }
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>
                                                The pNFT is at user 1234...1234
                                            </Trans>
                                        </Text>
                                        <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="danger" borderRadius="16px" bgColor="rgba(255, 96, 96, 0.2)">
                                            <Box color="danger" mr={[2]} >
                                                <Info fontSize='32px' />
                                            </Box>
                                            <Flex flexDirection="column">
                                                <Text textStyle="paragraph">
                                                    <Trans>This is a controversial issue, we recommend that you either transfer the original nft or burn the pNFT {"("}by opening the dispute{")"}</Trans>
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
                                                    variant={"dark-outline"}
                                                    onClick={ () => {
                                                        const dialog = getDialog('TransferOriginalNftDialog')
                                                        dialog.setNft(nft)
                                                        dialog.onOpen()
                                                    } }
                                                >
                                                    <Trans>Transfer original</Trans>
                                                </Button>
                                            </Box>
                                            <Box w={{base: "100%", sm: "45%"}}>
                                                <Button
                                                    variant={"dark-outline"}
                                                    onClick={ () => {
                                                        const dialog = getDialog('LostPNftDialog')
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