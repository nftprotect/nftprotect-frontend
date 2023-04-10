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
    ModalCloseButton,
    Spinner,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Link,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import {AlertCircle, Info} from '@web3uikit/icons'
import { CopyIcon, ArrowForwardIcon } from '@chakra-ui/icons'
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
    originalOwner: string, // Owner address of original NFT
    variant: any // Button apearance variant from theme
}

const RequestOriginalNFTButton = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract, originalOwner, variant}: ButtonInitialData) => {

    const { nftProtectContract, account } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        confirmTransaction,
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
        setRefreshPaused(true)
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
            variant={variant}
        >
            <Trans>Request original</Trans>
        </Button>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
                setRefreshPaused(false)
            }}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "400px"}}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Request <br/> the original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody mb={{base: "20px"}} >
                                    <Text textStyle="paragraph" letterSpacing="0.04em" mt={{base: "20px"}} mb={{base: "8px"}} textAlign="center" textTransform="uppercase">
                                        <span>
                                            <Trans>To obtain the original NFT, send a request to the owner</Trans>
                                        </span>
                                    </Text>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center">
                                        <CopyIcon onClick={ copyOriginalOwnerToClipboard  } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                        <span id='originalOwnerAddressHolder'>
                                            { formatAddress(originalOwner, 4) }
                                        </span>
                                    </Text>

                                    { getNftImage() }

                                </CardBody>

                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%"}} mb={{base: "20px"}}>
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant="dark-outline"
                                        >
                                            <Trans>Request original</Trans>
                                        </Button>
                                    </Box>
                                    <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="accent.light" borderRadius="16px">
                                        <Flex color="accent.light" mr={{base: "20px"}} bg="#FFF" >
                                            <AlertCircle fontSize="36px" />
                                        </Flex>
                                        <Flex flexDirection="column">
                                            <Text textStyle="paragraph" color="muted">
                                                <Trans>Please note that when you receive the original NFT, pNFT will be burned.</Trans>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside> 

                        {/* confirmTransaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Request <br/> the original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                    <Text textStyle="paragraph" textTransform="uppercase">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* waitingForFinal */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" textTransform="uppercase" textAlign="center" fontWeight="700">
                                        <Trans>Request <br/> the original NFT{"?"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                        <Text textStyle="paragraph" textTransform="uppercase">
                                            <Trans>{"Wait for transaction to confirm…"}</Trans>
                                        </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                        
                        {/* finalCompleted */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Request sent!</Trans>
                                    </Text>
                                </CardHeader>
                                
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                        </Image>
                                    </Box>

                                    <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}}>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>Request sent to the original NFT owner. Please wait for the transfer of rights.</Trans>
                                        </Text>
                                        <Text textStyle="paragraph" textAlign="center">
                                            {"If the original NFT is not handed over, you can open a dispute in the Kleros decentralized court. The button to open a dispute will appear on the DApp's main page"}
                                        </Text>
                                    </Flex>
                                </CardBody>
                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "50%"}} mb={{base: "20px"}}>
                                        <Button 
                                            onClick={ onClose}
                                            variant="dark-outline"
                                        >
                                            <Trans>Close</Trans>
                                        </Button>
                                    </Box>
                                    <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="accent.light" borderRadius="16px">
                                        <Image src="./images/kleros_logo.png" alt="Kleros logo" w="24px" mr={{base: "20px"}} />
                                        <Flex flexDirection="column">
                                            <Text textStyle="paragraph" color="muted">
                                                <Trans>Kleros is an open source online dispute resolution protocol that uses blockchain and crowdsourcing 
                                                to resolve disputes fairly.</Trans>
                                            </Text>
                                            <Text>
                                                <Link href='https://kleros.io/' isExternal rel="noreferrer" color="#2D7BD6" textStyle="paragraph" textDecoration="underline">
                                                    <Trans> To learn more</Trans>
                                                    <ArrowForwardIcon ml={{base: '2px'}} />
                                                </Link>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <Flex flexDirection="column" alignItems="center">
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
                                        <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                            <Trans>You cancelled a transaction</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                                <CardFooter>
                                    <Box w={{base: "100%", xs: "50%"}}>
                                        <Button 
                                            onClick={ onClose}
                                            variant="light-outline"
                                        >
                                            <Trans>Close</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* error */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <ErrorStepContent />
                        </SwitchableOutside>

                        {/* timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <TimeoutStepContent/>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default RequestOriginalNFTButton