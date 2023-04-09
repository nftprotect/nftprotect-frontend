import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Twitter } from '@web3uikit/icons';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
import {
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

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    tokenContract: Contract,
    pendingRequest: number | undefined,
    variant: any
}

const ReleaseOriginalNFTButton = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract, pendingRequest, variant}: ButtonInitialData) => {

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
            nftProtectContract.answerOwnershipAdjustment(pendingRequest, true, 0, '')
            .then( finalTransactionSent(
                tokenContract,
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
            nftProtectContract.answerOwnershipAdjustment(pendingRequest, false, 0, '')
            .then( finalTransactionSent(
                tokenContract,
                StepMapping.pendingTransaction,
                StepMapping.canceled
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

    const copyNewOwnerToClipboard = () => {
        copyTextToClipboard(nft.ownerOf?.format() || '', '#newOwnerAddressHolder').then(() => alert('Copied!'))
    }

    function getNftImage() {
        let nftImage = <div />
        let imgUrl = ''
        // If image available in metadata, use this image, else use "no-image" plug
        if (metadata) {
            imgUrl = centralizeIpfsUrl(metadata.image)
        } else {
            imgUrl = './images/noImage.png'
        }
            nftImage = <Flex
                            borderRadius={{base: "16px"}}
                            filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
                            overflow="hidden"
                            my={{base: "20px"}}
                            justifyContent="center"
                            h="150px"
                            w="150px"
                        >
                            <Image 
                                src={ imgUrl }
                                alt={t`NFT image`}
                                borderRadius="1rem"
                            />
                        </Flex>
        return nftImage
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
                                        <span>
                                            <Trans>Are you sure want to transfer original NFT to</Trans>
                                        </span>
                                    </Text>

                                    <Text textStyle="paragraph" letterSpacing="0.04em" mb={{base: "20px"}} textAlign="center">
                                        <CopyIcon onClick={ copyNewOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                        <span id='newOwnerAddressHolder'>
                                            { formatAddress(nft.ownerOf?.format() || '', 4) }
                                        </span>
                                        {'\u003F'}
                                    </Text>

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
                                </CardBody>
                                <CardFooter flexDirection="column">
                                    <Flex 
                                        flexWrap={{base: "wrap", sm: "nowrap"}}
                                        alignSelf="flex-start"
                                        justifyContent="space-around"
                                        w="100%"
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