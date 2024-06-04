import { Contract } from "@ethersproject/contracts";
import React, { useEffect, useState } from 'react';
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
    useDisclosure
} from '@chakra-ui/react';
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleTransactionError } from '../../../utils/errorHandling';
import { Trans } from '@lingui/macro';
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import { getSigningData } from "../../../utils/signing";
import { usePublicClient, useSignTypedData } from 'wagmi';
import { ContractFunctionExecutionError, ContractFunctionRevertedError, decodeErrorResult } from 'viem';
import useNftProtect from "../../../hooks/useNftProtect";

const UnProtectNftDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const { account, currentChain, defaultChain } = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const [ nextStep, setNextStep ] = useState<number>(0)
    const { getDialog, setDialog } = useCallableDialogContext()
    const { signTypedDataAsync } = useSignTypedData()
    const { burn } = useNftProtect(currentChain?.id || defaultChain.id)
    const publicClient = usePublicClient()

    enum StepMapping {
        start,
        confirmTransaction,
        pendingTransaction,
        success,
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
        setNextStep(StepMapping.pendingTransaction);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash })
        if (receipt.status === 'success') {
            setNextStep(StepMapping.success)
            console.log("Transaction successful", hash);
        } else {
            handleTransactionFailed(receipt);
        }
    }

    const startButtonOnClick = async () => {
        const errorHandlings = {
            default: handleUnknownError,
            UserRejectedRequestError: handleRejected,
            // ContractFunctionRevertedError: (err: ContractFunctionRevertedError ) => {
            //     console.log('DCD1', err);
            //     Object.entries(err).forEach(([key, value]) => {
            //         console.log('DCD2', `${key}: ${value}`);
            //     });
            //     console.log('DCD3', err.signature && decodeErrorResult({abi: NFTProtectABI, data: err.signature}))

            //     debugger;
            // },
            // ContractFunctionExecutionError: (err: ContractFunctionExecutionError ) => {
            //     console.log('DCD4', err);
            //     Object.entries(err).forEach(([key, value]) => {
            //         console.log('DCD5', `${key}: ${value}`);
            //     });
            //     const cause = err.cause ?
            //         err.cause as ContractFunctionRevertedError :
            //         null
            //     const decodedError = cause?.signature && decodeErrorResult({abi: NFTProtectABI, data: cause.signature})
            //     console.log('DCD6', decodedError)
            //     debugger;
            // },
        }
        if (nft) {
            try {
                setNextStep(StepMapping.confirmTransaction);
                onOpen()
                const signingData = getSigningData(currentChain.id, nft.tokenId, account!, nft.originalData!.nonce!.toString(), currentChain.signatureVerifierContractAddress );
                const signature = await signTypedDataAsync(signingData as any);
                console.log('SIGNATURE', signingData, signature);
                let hash;
                try {
                    hash = await burn(nft.tokenId, account!, signature); // TODO: allow to choose where to extract
                } catch (error) {
                    handleTransactionError(error, errorHandlings);
                    return;
                }
                finalTransactionSent(hash);
            } catch (err: any) {
                handleUnknownError(err)
            }
        }
    }

    const dialogClose = () => {
        setNextStep(StepMapping.start)
        onClose()
    }

    useEffect(() => {
        setDialog('UnProtectNftDialog', {...disclosure, setNft})
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
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Restore your <br /> original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody mb={{base: "20px"}}>
                                    { nft && <NFTImage nft={nft} /> }
                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        <Trans>The pNFT will be burned and the original NFT will be sent to you</Trans>
                                    </Text>
                                    <Text textStyle="h3" textAlign="center">
                                        <Trans>Are you sure?</Trans>
                                    </Text>
                                </CardBody>
                                <CardFooter>
                                    <Box w={{base: "60%", sm: "40%"}}>
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant='darkOutline'
                                            my={2}
                                        >
                                            <Trans>Yes</Trans>
                                        </Button>
                                    </Box>
                                    <Box w={{base: "60%", sm: "40%"}}>
                                        <Button
                                            onClick={ onClose }
                                            variant="darkOutline"
                                            my={2}
                                        >
                                            <Trans>No</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside> 

                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Restore your <br /> original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Waiting for transaction confirmation */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Restore your <br /> original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>{"Wait for transaction to confirm…"}</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Restored succesfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>The original NFT restored succesfully!</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody my={{base: "20px"}}>
                                    <Box mb={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/confirm.png" alt="Success" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                        <Trans>You can protect your NFT again.</Trans>
                                    </Text>

                                </CardBody>
                                <CardFooter>
                                    <Box w={{base: "60%"}}>
                                        <Button
                                            variant={"darkOutline"}
                                            onClick={ () => {
                                                const dialog = getDialog('ProtectNftDialog')
                                                dialog.setNft(nft)
                                                dialog.onOpen()
                                            } }
                                        >
                                            <Trans>Protect NFT</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
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
                                        <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
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
                            <Card variant="stepContent">
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
                                    <Text textStyle="h3" textAlign="center">
                                        <Trans>Transaction failed.</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>{"Transaction is still in progress…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' mt={{base: "20px"}}></Spinner>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default UnProtectNftDialog