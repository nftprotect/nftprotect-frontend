import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
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
import {AlertCircle} from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'
import { defaultArbitrator } from '../../../utils/config';
import { centralizeIpfsUrl } from '../../../utils/ipfs';
import { t } from '@lingui/macro';
import CancelledStepContent from './steps/CancelledStepContent'
import ErrorStepContent from './steps/ErrorStepContent'
import TimeoutStepContent from './steps/TimeoutStepContent'
import NFT from '../../../classes/NFT';

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    pendingRequest: number | undefined,
    variant: any
}

const ReleaseOriginalNFTButton = ({nft, nftReFetch, setRefreshPaused, pendingRequest, variant}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    enum StepMapping {
        startAnswerReleaseOriginal,
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
                    // after mined fire wrap
                    setNextStep(completeStep)
                    console.log("Transaction successful", tx.hash);
                    nftReFetch();
                    setTimeout(onClose, dialogsTimeout)
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const mainButtonOnClick = () => {
            setNextStep(StepMapping.startAnswerReleaseOriginal)
        onOpen()
        setRefreshPaused(true)
    }

    const sendButtonOnClick = () => {
        try {
            console.log('ANSWER ADJUSTMENT OK')
            setNextStep(StepMapping.confirmTransaction)
            const performAnswer = () => {
                if (pendingRequest) {
                    return nftProtectContract.answerOwnershipAdjustment(pendingRequest, true, '')
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
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    const rejectButtonOnClick = () => {
        try {
            console.log('ANSWER ADJUSTMENT REJECT')
            // setNextStep(StepMapping.confirmTransaction)
            if (pendingRequest) {
                nftProtectContract.answerOwnershipAdjustment(pendingRequest, false, '')
                .then( finalTransactionSent(
                    nft.loadedContract,
                    StepMapping.pendingTransaction,
                    StepMapping.canceled
                ))
                .catch(
                    handleContractError({
                        'ACTION_REJECTED': handleRejected,
                        default: handleUnknownError
                    })
                )
            } else {
                onClose()
            }
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    const copyNewOwnerToClipboard = () => {
        copyTextToClipboard(nft.ownerAddress || '', '#newOwnerAddressHolder')
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

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>Transfer original</Trans>
        </Button>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(
                    StepMapping.startAnswerReleaseOriginal
                )
                onClose()
                setRefreshPaused(false)
            }}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "450px"}}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start answering for request to release original */}
                        <SwitchableOutside nextStepNumber={nextStep} >
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Transfer <br />the original NFT <br />to a new owner{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody mb={{base: "20px"}}>
                                    { getNftImage() }
                                    <Text textStyle="paragraph" letterSpacing="0.04em" mb={{base: "8px"}} textAlign="center">
                                        <chakra.span>
                                            <Trans>Are you sure want to transfer original NFT to</Trans>
                                        </chakra.span>
                                        
                                        <Text id='newOwnerAddressHolder' whiteSpace="nowrap">
                                            <Popover placement='top'>
                                                <PopoverTrigger>
                                                    <CopyIcon onClick={ copyNewOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                                </PopoverTrigger>
                                                <PopoverContent w="150px">
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody >
                                                        <Trans>Copied{"!"}</Trans>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Popover>
                                            { formatAddress(nft.ownerAddress || '', 4) }{'\u003F'}
                                        </Text>
                                    </Text>
                                </CardBody>
                                <CardFooter flexDirection="column" alignItems="center">
                                    <Flex 
                                        flexWrap={{base: "wrap", sm: "nowrap"}}
                                        alignSelf="flex-start"
                                        justifyContent="space-around"
                                        w="100%"
                                        mb={{base: "20px"}}
                                    >
                                        <Box mb={{base: "20px", sm: "0"}} w={{base: "40%"}}>
                                            <Button 
                                                onClick={ sendButtonOnClick }
                                                variant='dark-outline'
                                            >
                                                <Trans>Yes</Trans>
                                            </Button>
                                        </Box>

                                        <Box w={{base: "40%"}}>
                                            <Button
                                                onClick={ rejectButtonOnClick }
                                                variant="dark-outline"
                                            >
                                                <Trans>No</Trans>
                                            </Button>
                                        </Box>
                                    </Flex>
                                    <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="danger" borderRadius="16px">
                                        <Flex color="danger" mr={{base: "20px"}} bg="#FFF" >
                                            <AlertCircle fontSize="36px" />
                                        </Flex>
                                        <Flex flexDirection="column">
                                            <Text textStyle="paragraph" textTransform="uppercase" fontWeight="700" color="danger">
                                                <Trans>Warning!</Trans>
                                            </Text>
                                            <Text textStyle="paragraph">
                                                {"Transferring the original NFT to a new owner will burn the pNFT, and you will lose control of the NFT. This action is irreversible!"}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

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

export default ReleaseOriginalNFTButton