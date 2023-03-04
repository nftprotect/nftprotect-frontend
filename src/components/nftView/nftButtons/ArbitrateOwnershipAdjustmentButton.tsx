import { EvmNft } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
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
import { CopyIcon } from '@chakra-ui/icons'
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { RequestStatus, ActionRequest } from '../NFTCard';
import { generateArbitratorExtraData, KlerosCourts } from '../../../utils/kleros';
import { Trans } from '@lingui/macro'

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    pendingRequest: ActionRequest,
    originalOwner: string // Owner address of original NFT,
    loadPendingRequest: Function // Function to reload a pending request
}

const ArbitrateOwnershipAdjustmentButton = ({nft, metadata, nftReFetch, originalOwner, pendingRequest, loadPendingRequest}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const subcourtID = KlerosCourts.General
    const numberOfVotes = 3

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        klerosInfo,
        waitingForFinal,
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

    const finalTransactionSent = () => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForFinal);
            nftProtectContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    loadPendingRequest()
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
            nftProtectContract.askOwnershipAdjustmentArbitrate(pendingRequest.id, generateArbitratorExtraData(
                subcourtID.toString(), numberOfVotes.toString()
            ))
                .then( finalTransactionSent() )
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
        >Open dispute
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
                <ModalHeader textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700"><Trans>Open case in Kleros</Trans></ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    {`Original NFT owner ${pendingRequest.status == RequestStatus.Rejected ? 'refused' : 'unresponsive'}`}
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
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    { pendingRequest.status == RequestStatus.Rejected ?
                                        "Don't agree? Initiate a dispute in the Kleros decentralized court." :
                                        'Want to initiate a dispute in the Kleros decentralized court?' }
                                    <br></br>
                                    {'(Paid separately)'}
                                </Text>
                                <Box w="100%">
                                    <Button 
                                        onClick={ () => setNextStep(StepMapping.klerosInfo) }
                                        variant="primary-solid"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans>Initiate a dispute</Trans>
                                    </Button>
                                </Box>
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
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>
                                        Welcome to Kleros,
                                        <br></br>
                                        where you can resolve disputes fairly and transparently. 
                                        <br></br>
                                        To ensure a fair review by our expert arbitrators, be sure to provide evidence on the next screen. 
                                        <br></br>
                                        The more detail you provide, including text, images, or other documentation, the better the review. 
                                        <br></br>
                                        Test network is free, 
                                        <br></br>
                                        main network costs money.
                                    </Trans>
                                </Text>
                                
                                <Box w="100%">
                                    <Button 
                                        onClick={ startButtonOnClick }
                                        variant="primary-solid"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans>Initiate a dispute</Trans>
                                    </Button>
                                </Box>
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
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl"]}  fontWeight="500">
                                    <Trans>Your case sent to Kleros</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}/>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>If you want to attach any additional evidence, you can do it int the next 48 hours by this link:</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>case {pendingRequest.disputeId}</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Follow the status of the case through our app or at the Kleros website.</Trans>
                                </Text>
                                <Box w="50%" my={[8]}>
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

export default ArbitrateOwnershipAdjustmentButton