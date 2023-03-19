import { EvmNft } from '@moralisweb3/common-evm-utils';
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
    ModalHeader,
    Spinner,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import {AlertCircle} from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons'
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'
import { defaultArbitrator } from '../../../utils/config';
import { useIPFSContext } from '../../../context/IPFSContextProvider';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract,
    originalOwner: string // Owner address of original NFT
}

const RequestOriginalNFTButton = ({nft, metadata, nftReFetch, tokenContract, originalOwner}: ButtonInitialData) => {

    const { nftProtectContract, account } = useAppContext()
    const { centalizeIpfsUrl } = useIPFSContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        waitingForAllow,
        waitingForFinal,
        waitingForConfirm,
        waitingForFinalSent,
        finalCompleted,
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

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForFinal);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setNextStep(StepMapping.finalCompleted)
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
        setNextStep(StepMapping.start);
        onOpen()
    }

    const startButtonOnClick = () => {
        try {
            nftProtectContract.askOwnershipAdjustment(nft.tokenId, account, defaultArbitrator) // account used temporary: will be changed to a new wallet address
                .then( finalTransactionSent(tokenContract) )
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

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder').then(() => alert('Copied!'))
    }

    function getNftImage() {
        if (metadata) {
            let imgUrl = centalizeIpfsUrl(metadata.image)
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
            my={2}
            w="100%"
        >
            <Trans>Request original</Trans>
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(StepMapping.start)
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
                <ModalHeader textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700">
                    <Trans>Request the <br/>original NFT?</Trans>
                </ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                <Trans>To obtain the original NFT, send a request to the owner</Trans>
                                </Text>
                                <Text id='originalOwnerAddressHolder' fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    { formatAddress(originalOwner, 4) }
                                    <CopyIcon onClick={ copyOriginalOwnerToClipboard } />
                                </Text>
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
                                <Box w="100%">
                                    <Button 
                                        onClick={ startButtonOnClick }
                                        variant="primary-solid"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans>Request original</Trans>
                                    </Button>
                                </Box>
                                <Flex flexWrap="nowrap" alignItems="center" border="1px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]} mt={[4, 8]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <AlertCircle />
                                    </Box>
                                    <Flex flexDirection="column">
                                            <Text fontSize={["sm", "md", "lg"]}>
                                            <Trans>Please note that when you receive the original nft, pnft will be burned.</Trans>
                                            </Text>
                                    </Flex>
                                </Flex>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    w="100%"
                                    mt={[4, 8]}
                                >
                                   <Trans>Close</Trans>
                                </Button>
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
                                    <Trans>{"Wait for transaction to confirm…"}</Trans>
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
                                    <Trans>{"Wait for transaction to confirm…"}</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                    <Trans>Request sent!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}/>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Request sent to the original NFT owner. Please wait for the transfer of rights.</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>If the original NFT is not handed over, you can open a dispute in the Kleros decentralized court. The button to open a dispute will appear on the DApp's main page</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>{"The button to open a dispute will appear on the DApp's main page"}</Trans>
                                </Text>
                                <Flex flexWrap="nowrap" alignItems="center" border="1px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <a href="https://kleros.io/" target="_blank" rel="noreferrer" color="#2D7BD6"><Image src='/images/kleros_logo.png' alt="Kleros logo" w="150px"/></a>
                                    </Box>
                                    <Flex flexDirection="column">
                                        <Text fontSize={["sm", "md", "lg"]}>
                                            <a href="https://kleros.io/" target="_blank" rel="noreferrer" color="#2D7BD6">Kleros</a> <Trans>is an open source online dispute resolution protocolthat uses blockchain and crowdsourcing to resolve disputes fairly.</Trans>
                                        </Text>
                                    </Flex>
                                </Flex>
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
                                    <Trans>{"Transaction is still in progress…"}</Trans>
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

export default RequestOriginalNFTButton