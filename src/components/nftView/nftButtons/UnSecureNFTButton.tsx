import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config';
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
    useDisclosure
} from '@chakra-ui/react';
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import SecureNFTButton from './SecureNFTButton';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { Trans } from '@lingui/macro';
import { AlertCircle } from '@web3uikit/icons'
import { defaultArbitrator } from '../../../utils/config';
import { useIPFSContext } from '../../../context/IPFSContextProvider';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    tokenContract: Contract
}

const UnSecureNFTButton = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract}: ButtonInitialData) => {

    const { nftProtectContract, account } = useAppContext()
    const { centralizeIpfsUrl } = useIPFSContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const name = metadata?.name || nft.name

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
            setNextStep(StepMapping.pendingTransaction);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setNextStep(StepMapping.success)
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
            setNextStep(StepMapping.confirmTransaction);
            onOpen()
            nftProtectContract.burn(nft.tokenId, 0, '', account, defaultArbitrator) // account used temporary: will be changed to a new wallet address
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
        setRefreshPaused(true)
    }

    function getNftImage() {
        let nftImage = <div />
        if (metadata) {
            const imgUrl = centralizeIpfsUrl(metadata.image)
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
        <Button onClick={ mainButtonOnClick } variant="dark-outline" w="100%">
            <Trans>Restore original</Trans>
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
                setRefreshPaused(false)
            }}
            closeOnOverlayClick={false}
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

                <ModalHeader  textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700"><Trans>Restore your <br /> original NFT</Trans></ModalHeader>
                <ModalBody>
                    <Wizard>
                        {/* Start */}
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
                                    <Trans>The pNFT will be burned and the original NFT will be sent to you</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>ARE YOU SURE?</Trans>
                                </Text>
                                <Flex
                                    flexWrap="nowrap"
                                    justifyContent="space-around"
                                    my={[4, 8]}
                                >
                                    <Box minW="40%">
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant='dark-outline'
                                            w="100%"
                                            my={2}
                                        >
                                            <Trans>Yes</Trans>
                                        </Button>
                                    </Box>
                                    
                                    <Box minW="40%">
                                        <Button
                                            onClick={ onClose }
                                            variant="dark-outline"
                                            my={2}
                                            w="100%"
                                        >
                                            <Trans>No</Trans>
                                        </Button>
                                    </Box>
                                </Flex>
                            </Flex>
                        </SwitchableOutside> 

                        {/* Confirm transaction */}
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

                        {/* Waiting for transaction confirmation */}
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

                        {/* Restored succesfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                <Trans>The original NFT restored succesfully!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>
                                <Box w="80%">
                                    <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                        <Trans values={{name}}>You can protect your NFT <b>{name}</b> again.</Trans>
                                    </Text>
                                    <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                        <Trans>We recomend always keep your assets secure</Trans>
                                    </Text>
                                    <SecureNFTButton 
                                        metadata={metadata} 
                                        nft={nft} 
                                        nftReFetch={nftReFetch}
                                        setRefreshPaused={setRefreshPaused}
                                        tokenContract={tokenContract} />
                                    <Button
                                        onClick={ onClose }
                                        my={2}
                                        w="100%"
                                        h={[8, 10]}
                                        variant="dark-outline"
                                    >
                                        <Trans>Cancel</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        {/* Canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    <Trans>Fail!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl"]} textAlign="center" my={[4]}>
                                <Trans>You cancelled a transaction</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        {/* Error */}
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

                        {/* Timeout */}
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

export default UnSecureNFTButton