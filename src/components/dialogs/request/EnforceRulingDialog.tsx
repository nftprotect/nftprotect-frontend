import React, { useEffect, useState } from 'react';
import {
    Box,
    Image,
    Flex,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    Spinner,
    ModalCloseButton,
    Card,
    CardHeader,
    CardBody,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { Trans } from '@lingui/macro'
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import { useArbitrableProxy } from '../../../hooks/useArbitrableProxy';

interface EnforceRulingData {
    nft: NFT,
    isRuled: boolean,
}

const EnforceRulingDialog = ({onSubmitted}: {onSubmitted: Function|undefined}) => {

    const [ data, setData ] = useState<EnforceRulingData>()
    const { nft, isRuled } = data || {}
    const { nftProtectContract, currentChain, defaultChain } = useAppContext()
    const isTestnet: boolean = currentChain?.wagmiId?.testnet;
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const { executeRuling } = useArbitrableProxy(currentChain?.id || defaultChain.id)

    const disputeId = nft?.pendingRequest?.externalDisputeId

    // Naming of wizard step numbers
    enum StepMapping {
        confirmTransaction,
        waitingForTransaction,
        rulingEnforced,
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

    const finalTransactionSent = async (tx: any) => {
        setNextStep(StepMapping.waitingForTransaction);
        try {
            const receipt = await nftProtectContract.provider.waitForTransaction(tx.hash);
            if (receipt.status === 1) {
                setNextStep(StepMapping.rulingEnforced);
                console.log("Transaction successful", tx.hash);
                onSubmitted && onSubmitted();
                return true;
            } else {
                handleTransactionFailed(tx);
            }
        } catch (error) {
            handleUnknownError(error);
        }
        return false;
    }

    const arbitratorTransactionSent = async (tx: any) => {
        setNextStep(StepMapping.waitingForTransaction);
        try {
            const receipt = await nftProtectContract.provider.waitForTransaction(tx.hash);
            if (receipt.status === 1) {
                setNextStep(StepMapping.confirmTransaction);
                console.log("Transaction successful", tx.hash);
                return true;
            } else {
                handleTransactionFailed(tx);
            }
        } catch (error) {
            handleUnknownError(error);
        }
        return false;
    }

    const enforceRuling = async () => {
        try {
            if (nft?.pendingRequest) {
                // In testnet we have to call executeRuling on arbitrator contract
                if (isTestnet && !isRuled && disputeId) {
                    const tx = await executeRuling(currentChain.defaultArbitrator, disputeId);
                    await arbitratorTransactionSent(tx);
                }
                const tx = await nftProtectContract.fetchRuling(nft.pendingRequest.id);
                finalTransactionSent(tx);
            }
        } catch (error: any) {
            handleContractError({
                'ACTION_REJECTED': handleRejected,
                default: handleUnknownError
            })(error);
        }
    }

    const dialogClose = () => {
        setNextStep(StepMapping.confirmTransaction)
        onClose()
    }

    useEffect(() => {
        if (isOpen) {
            setNextStep(StepMapping.confirmTransaction)
            enforceRuling()
        }
    }, [isOpen])

    useEffect(() => {
        setDialog('EnforceRulingDialog', {...disclosure, setData})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={dialogClose}
        >
            <ModalOverlay 
                bg='blackAlpha.700' 
                backdropFilter='blur(10px)' 
            />
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
                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Enforce the ruling</Trans>
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

                        {/* Waiting for transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" textAlign="center" fontWeight="700">
                                        <Trans>Enforce the ruling</Trans>
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

                        {/* Evidence submitted successfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "360px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Enforce the ruling</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody>
                                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                            <Image src="/images/icons-status/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>{`The Ruling on dispute #${nft?.pendingRequest?.externalDisputeId} is now enforced!`}</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Transaction canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Fail!</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                        <Trans>You cancelled a transaction</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Error occured */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Some error occured</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                        <Trans>Transaction failed.</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Transaction timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>{"Transaction is still in progress…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default EnforceRulingDialog