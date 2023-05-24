import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useEffect, useState } from 'react';
import {
    chakra,
    Button,
    Box,
    Image,
    Flex,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Spinner,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow ,
    PopoverCloseButton,
    PopoverBody,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle, Info } from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'
import { defaultArbitrator } from '../../../utils/config';
import { t } from '@lingui/macro';
import CancelledStepContent from '../../steps/CancelledStepContent'
import ErrorStepContent from '../../steps/ErrorStepContent'
import TimeoutStepContent from '../../steps/TimeoutStepContent'
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';

interface DialogInitialData {
    nftReFetch: Function, // function to update nft list
}

const TransferOriginalNftDialog = ({ nftReFetch }: DialogInitialData) => {
    
    const [ nft, setNft ] = useState<NFT>()
    const { nftProtectContract } = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    enum StepMapping {
        confirmTransaction,
        pendingTransaction,
        transferredSuccessfully,
        canceled,
        error,
        timeout
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

    const finalTransactionSent = (tokenContract: Contract, waitingStep: number, completeStep: number) => {
        return (tx: any) => {
            setNextStep(waitingStep);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    setNextStep(completeStep)
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
                console.log('ANSWER ADJUSTMENT OK')
                onOpen()
                const performAnswer = () => {
                    if (nft.pendingRequest) {
                        return nftProtectContract.answerOwnershipAdjustment(nft.pendingRequest, true, '')
                    } else {
                        return nftProtectContract.adjustOwnership(nft.tokenId, defaultArbitrator, '')
                    }
                }
                performAnswer().then( finalTransactionSent(
                    nft.loadedContract,
                    StepMapping.pendingTransaction,
                    StepMapping.transferredSuccessfully
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
        setDialog('TransferOriginalNftDialog', {...disclosure, setNft})
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
                setNextStep( StepMapping.confirmTransaction )
                onClose()
            }}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "450px"}}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Confirm the transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <Flex flexDirection="column">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Transfer <br />the original NFT <br />to a new owner{"?"}</Trans>
                                        </Text>
                                    </CardHeader>
                                    <CardBody>
                                        <Flex my={{base: "20px"}}>
                                            <Spinner variant="primary" speed='0.65s'></Spinner>
                                        </Flex>
                                        <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
                                            <Trans>Confirm the transaction in the wallet</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Pending transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <Flex flexDirection="column">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Transfer <br />the original NFT <br />to a new owner{"?"}</Trans>
                                        </Text>
                                    </CardHeader>
                                    <CardBody>
                                        <Flex my={{base: "20px"}}>
                                            <Spinner variant="primary" speed='0.65s'></Spinner>
                                        </Flex>
                                        <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
                                            <Trans>{"Wait for transaction to confirm…"}</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* NFT transfered successfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>The original NFT <br/> was transferred <br/> to new owner</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Box mt={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                        </Image>
                                    </Box>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Fail!</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" textAlign="center">
                                        <Trans>You cancelled a transaction</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
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

export default TransferOriginalNftDialog