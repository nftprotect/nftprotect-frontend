import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Twitter } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
import {
    Button,
    Box,
    Card, 
    CardBody,
    Flex,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { BigNumber } from 'moralis/common-core';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function // function to update nft list
    tokenContract: Contract,
    pendingRequest: number | undefined
}

const ReleaseOriginalNFTButton = ({nft, metadata, nftReFetch, tokenContract, pendingRequest}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    const stepMapping = {
        requestReleaseOriginal: 0,
        requestAnswerReleaseOriginal: 1,
        waitingForFinalSent: 2,
        waitingForFinalRejected: 3,
        finalCompletedSent: 4,
        finalCompletedRejected: 5,
        canceled: 6,
        error: 7,
        timeout: 8
    }

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(stepMapping.error)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(stepMapping.canceled)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(stepMapping.error)
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
        pendingRequest ?
            setNextStep(stepMapping.requestAnswerReleaseOriginal) :
            setNextStep(stepMapping.requestReleaseOriginal)
        onOpen()
    }

    const startButtonOnClick = () => {
        try {
            console.log('ADJUST')
            nftProtectContract.adjustOwnership(nft.tokenId, '')
                .then( finalTransactionSent(
                    tokenContract,
                    stepMapping.waitingForFinalSent,
                    stepMapping.finalCompletedSent
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

    const sendButtonOnClick = () => {
        try {
            console.log('ANSWER ADJUSTMENT OK')
            nftProtectContract.answerOwnershipAdjustment(pendingRequest, true, 0)
            .then( finalTransactionSent(
                tokenContract,
                stepMapping.waitingForFinalSent,
                stepMapping.finalCompletedSent
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
            nftProtectContract.answerOwnershipAdjustment(pendingRequest, false, 0)
            .then( finalTransactionSent(
                tokenContract,
                stepMapping.waitingForFinalRejected,
                stepMapping.finalCompletedRejected
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

    return (<>
        <Button
            type='button'
            onClick={ mainButtonOnClick }
            my={2}
            justifyContent="flex-start"
            leftIcon={<Twitter fontSize='20px'/>}
            w="100%"
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="12px"
            fontSize={['xs', 'sm', 'md', 'lg']}
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
        >Release original
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalHeader>Transfer original NFT</ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Press button to send original NFT {metadata?.name || nft.name} to wNFT owner.
                                <Button type='button' onClick={ startButtonOnClick }>
                                    Start
                                </Button>
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Press "Send" button to send original NFT {metadata?.name || nft.name} to wNFT owner or "Reject" button to reject a request.
                                <Button type='button' onClick={ sendButtonOnClick }>
                                    Send
                                </Button>
                                <Button type='button' onClick={ rejectButtonOnClick }>
                                    Reject
                                </Button>
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Waiting for transaction to complete. After transaction complete your NFT will be trnasfered to new owner.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Waiting for transaction to complete. After transaction complete request to transfer your NFT will be rejected.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction complete! You sent {metadata?.name || nft.name} to a new owner.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction complete! You successfully rejected transfer of your NFT.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                You canceled the transaction in your wallet.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Some error occured. Transaction failed.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction is still in progress.
                            </Box>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ReleaseOriginalNFTButton