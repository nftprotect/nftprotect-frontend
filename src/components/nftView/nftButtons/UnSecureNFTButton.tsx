import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config'
import { deIpfsUrl } from '../../../utils/helpers'
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
    ModalCloseButton,
    Spinner,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import SecureNFTButton from './SecureNFTButton'
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle } from '@web3uikit/icons'

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function // function to update nft list
    tokenContract: Contract
}

const UnSecureNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    enum StepMapping {
        start,
        checkPermission,
        requestUnwrap,
        waitingForAllow,
        waitingForFinal,
        finalCompleted,
        success,
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

    const startButtonOnClick = () => {
        try {
            setNextStep(StepMapping.requestUnwrap);
            onOpen()
            nftProtectContract.burn(nft.tokenId, 0)
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

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.start)
        onOpen()
    }

    function getNftImage() {
        let nftImage = <div />
        if (metadata) {
            const imgUrl = deIpfsUrl(metadata.image)
            nftImage = <Image 
                        src={ imgUrl } 
                        my={[4]}
                        border="1px solid rgba(255, 255, 255, 0.5)"
                        borderRadius={["20px"]}
                        h="auto"
                        w="60%" 
                    />
            }
        return nftImage
    }

    return (<>
        <Button onClick={ mainButtonOnClick } variant="primary-solid" w="100%">
            Unsecure
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
            }}        >
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

                <ModalHeader  textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700">Unpack <br /> your original NFT</ModalHeader>
                <ModalCloseButton size={["sm", "md"]} border="2px solid #000" borderRadius="15px" top={[3, 4]} right={[3, 4]} />
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
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
                                    pNFT will be burned and original NFT will be sent to your wallet
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    are you sure?
                                </Text>
                                <Flex
                                    flexWrap="nowrap"
                                    justifyContent="space-around"
                                    my={[4, 8]}
                                >
                                    <Box minW="40%">
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant='primary-solid'
                                            w="100%"
                                            my={2}
                                        >Yes
                                        </Button>
                                    </Box>
                                    
                                    <Box minW="40%">
                                        <Button
                                            onClick={ onClose }
                                            variant="monochrome-transparent"
                                            my={2}
                                            w="100%"
                                        >No
                                        </Button>
                                    </Box>
                                </Flex>
                            </Flex>
                        </SwitchableOutside> 

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                    Checking permission to transfer token...
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
                                <Text fontSize={["md", "lg", "xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    Waiting for transaction to complete.
                                </Text>

                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    After it will be completed, your will receive original NFT <b>{metadata?.name || nft.name}</b> to your wallet.
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                    Original NFT restored in your wallet
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>
                                <Box w="80%">
                                    <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                        You can protect your NFT <b>{metadata?.name || nft.name}</b> again.
                                    </Text>
                                    <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                        We recomend always keeping your assets in a secure place.
                                    </Text>
                                    <SecureNFTButton metadata={metadata} nft={nft} nftReFetch={nftReFetch} tokenContract={tokenContract} />
                                    <Button
                                        onClick={ onClose }
                                        my={2}
                                        w="100%"
                                        h={[8, 10]}
                                        variant="monochrome-transparent"
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    Fail!
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                    You cancelled a transaction
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

export default UnSecureNFTButton