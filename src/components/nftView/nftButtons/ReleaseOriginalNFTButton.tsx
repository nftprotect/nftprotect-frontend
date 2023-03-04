import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Twitter } from '@web3uikit/icons';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { deIpfsUrl } from '../../../utils/helpers';
import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
import {
    Button,
    Box,
    Image,
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
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import {AlertCircle} from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function // function to update nft list
    tokenContract: Contract,
    pendingRequest: number | undefined
}

const ReleaseOriginalNFTButton = ({nft, metadata, nftReFetch, tokenContract, pendingRequest}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    enum StepMapping {
        startReleaseOriginal,
        startAnswerReleaseOriginal,
        waitingForAllow,
        waitingForFinal,
        waitingForConfirm,
        waitingForFinalSent,
        waitingForFinalRejected,
        finalCompletedSent,
        finalCompletedRejected,
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
        pendingRequest ?
            setNextStep(StepMapping.startAnswerReleaseOriginal) :
            setNextStep(StepMapping.startReleaseOriginal)
        onOpen()
    }

    const startButtonOnClick = () => {
        try {
            console.log('ADJUST')
            nftProtectContract.adjustOwnership(nft.tokenId, '')
                .then( finalTransactionSent(
                    tokenContract,
                    StepMapping.waitingForFinalSent,
                    StepMapping.finalCompletedSent
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
                StepMapping.waitingForFinalSent,
                StepMapping.finalCompletedSent
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
                StepMapping.waitingForFinalRejected,
                StepMapping.finalCompletedRejected
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
        if (metadata) {
            let imgUrl = deIpfsUrl(metadata.image)
            return (<Image 
                    src={ imgUrl } 
                    alt="NFT image" 
                    w="100%"
                />)
        }
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant="primary-solid"
            w="100%"
        >
            <Trans>Transfer original</Trans>
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(
                    pendingRequest ? 
                        StepMapping.startReleaseOriginal :
                        StepMapping.startAnswerReleaseOriginal
                )
                onClose()
            }}
        >
            <ModalOverlay 
                bg='blackAlpha.700' 
                backdropFilter='blur(10px)' 
            />
            <ModalContent
                w={["15rem", "20rem", "25rem"]}
                bg="#FFF"
                border="2px solid #000"
                borderRadius="30px"
                py={[4, 8]}
            >
                <ModalHeader textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700"><Trans> Transfer the original NFT to a new owner?</Trans></ModalHeader>
                <ModalBody>
                    <Wizard>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                <Trans>Press button to send original NFT to pNFT owner.</Trans>
                                </Text>
                                <Box w="50%">
                                    <Button 
                                        onClick={ startButtonOnClick }
                                        variant='primary-solid'
                                        my={2}
                                    >
                                        <Trans>Start</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep} >
                            <Flex flexDirection="column">
                                <Box
                                    my={[4]}
                                    border="1px solid rgba(255, 255, 255, 0.5)"
                                    borderRadius={["20px"]}
                                    w="50%" 
                                    overflow="hidden"
                                    alignSelf="center"
                                >  
                                    { getNftImage() }
                                </Box>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Are you sure want to transfer original nft to 0x12...3456?</Trans>
                                </Text>
                                <Text id='newOwnerAddressHolder' fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    { formatAddress(nft.ownerOf?.format() || '', 4) }
                                    <CopyIcon onClick={ copyNewOwnerToClipboard } />
                                </Text>
                                <Flex
                                    flexWrap="nowrap"
                                    justifyContent="space-around"
                                    my={[4, 8]}
                                >
                                    <Box minW="40%">
                                        <Button 
                                            onClick={ sendButtonOnClick }
                                            variant='primary-solid'
                                            w="100%"
                                            my={2}
                                        >
                                            Yes
                                        </Button>
                                    </Box>
                                    
                                    <Box minW="40%">
                                        <Button
                                            onClick={ rejectButtonOnClick }
                                            variant="monochrome-transparent"
                                            my={2}
                                            w="100%"
                                        >
                                            No
                                        </Button>
                                    </Box>
                                </Flex>
                                <Flex flexWrap="nowrap" alignItems="center" border="1px solid red" borderRadius={["20px"]} p={[2, 4]}>
                                    <Box color="red" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <AlertCircle />
                                    </Box>
                                    <Flex flexDirection="column">
                                            <Heading textTransform="uppercase" fontSize={["md", "lg", "xl"]} mb={[2, 4]}>
                                                <Trans>Warning!</Trans>
                                            </Heading>
                                            <Text fontSize={["sm", "md", "lg"]}>
                                                <Trans>Transferring the original NFT to a new owner will burn the pNFT, and you will lose control of the NFT. This action is irreversible!</Trans>
                                            </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>
                        
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Please, allow access and transfer of your NFT</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside> 
                        
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Wait for transaction to confirm...</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>


                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Confirm the transaction in the wallet</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Wait for transaction to confirm...</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Waiting for transaction to complete. After transaction complete request to transfer your NFT will be rejected.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                    <Trans>The original NFT was transfered to new owner</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}/>
                                <Box w="50%" my={[2, 4]}>
                                    <Button 
                                        onClick={onClose}
                                        variant="monochrome-transparent"
                                        w="100%"
                                    >
                                        <Trans>Close</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    <Trans>Fail!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    <Trans>You canceled the transaction in your wallet.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]} fontWeight="500">
                                    <Trans>Some error occured</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                    <Trans>Transaction failed.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                    <Trans>Transaction is still in progress...</Trans>
                                </Text>
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                            </Flex>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ReleaseOriginalNFTButton