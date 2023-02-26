import { EvmNft } from '@moralisweb3/common-evm-utils';
import { SpeedyNode } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
import { deIpfsUrl } from '../../../utils/helpers';
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

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract,
    originalOwner: string // Owner address of original NFT
}

const RequestOriginalNFTButton = ({nft, metadata, nftReFetch, tokenContract, originalOwner}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
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
            nftProtectContract.askOwnershipAdjustment(nft.tokenId)
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
            my={2}
            w="100%"
        >Request original
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
                <ModalHeader textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700">Request the <br />original NFT</ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    To obtain the original NFT, please send a request to the owner
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
                                    >Request original
                                    </Button>
                                </Box>
                                <Flex flexWrap="nowrap" alignItems="center" border="1px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]} mt={[4, 8]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <AlertCircle />
                                    </Box>
                                    <Flex flexDirection="column">
                                            <Text fontSize={["sm", "md", "lg"]}>
                                                Please note that when you receive the original NFT, the pNFT will be <b>burnt</b>
                                            </Text>
                                    </Flex>
                                </Flex>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    w="100%"
                                    mt={[4, 8]}
                                >Close
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
                                    Please allow access and transfer of your NFT
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
                                    Wait for transaction to confirm
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
                                    Confirm the transaction in the wallet
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
                                    Waiting for transaction to complete.
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    After transaction complete the owner of the original NFT will be notified.
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                    Request sent!
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}/>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    Request sent to original NFT owner. Please wait for the transfer of rights.
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    If the original NFT is not handed over, you can open a dispute in the Kleros decentralized court.
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    {"The button to open a dispute will appear on the DApp's main page"}
                                </Text>
                                <Box w="50%" my={[8]}>
                                    <Button
                                        onClick={onClose}
                                        variant="monochrome-transparent"
                                        w="100%"
                                    >Close
                                    </Button>
                                </Box>
                                <Flex flexWrap="nowrap" alignItems="center" border="1px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <a href="https://kleros.io/" target="_blank" rel="noreferrer" color="#2D7BD6"><Image src='/images/kleros_logo.png' alt="Kleros logo" w="150px"/></a>
                                    </Box>
                                    <Flex flexDirection="column">
                                        <Text fontSize={["sm", "md", "lg"]}>
                                            <a href="https://kleros.io/" target="_blank" rel="noreferrer" color="#2D7BD6">Kleros</a> is an open source online dispute resolution protocolthat uses blockchain and crowdsourcing to resolve disputes fairly.
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    Fail!
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    You canceled the transaction in your wallet.
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]} fontWeight="500">
                                    Some error occured
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                    Transaction failed.
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                    Transaction is still in progress...
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