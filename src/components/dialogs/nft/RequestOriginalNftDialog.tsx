import { Contract } from "@ethersproject/contracts";
import React, { useEffect, useState } from 'react';
import {
    chakra,
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
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow ,
    PopoverCloseButton,
    PopoverBody,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleTransactionError } from '../../../utils/errorHandling';
import {AlertCircle, Info} from '@web3uikit/icons'
import { CopyIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'
import ErrorStepContent from '../../steps/ErrorStepContent'
import TimeoutStepContent from '../../steps/TimeoutStepContent'
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import AddressDisplay from "../../AddressDisplay";
import useNftProtect from "../../../hooks/useNftProtect";
import { usePublicClient } from "wagmi";

const RequestOriginalNftDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const { account, referrerAddress, currentChain, defaultChain } = useAppContext()
    const { getRequestByTokenId, askOwnershipAdjustment } = useNftProtect(currentChain?.id || defaultChain.id)
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const originalOwner = nft?.originalData?.ownerAddress
    const publicClient = usePublicClient()    

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
        setNextStep(StepMapping.waitingForFinal);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });
        if (receipt.status === 'success') {
            setNextStep(StepMapping.finalCompleted);
            console.log("Transaction successful", hash);
        } else {
            handleTransactionFailed(receipt);
        }
    }

    const startButtonOnClick = async () => {
        const errorHandlings = {
            default: handleUnknownError,
            UserRejectedRequestError: handleRejected
        };
        setNextStep(StepMapping.confirmTransaction);
        try {
            let hash;
            try {
                hash = await askOwnershipAdjustment(
                    nft!.tokenId, 
                    account!, // TODO: Let user to specify a new address
                    currentChain.defaultArbitrator
                );
            } catch (error) {
                handleTransactionError(error, errorHandlings);
                return;
            }
            finalTransactionSent(hash!);
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    const dialogClose = () => {
        setNextStep(StepMapping.start)
        onClose()
    }

    useEffect(() => {
        setDialog('RequestOriginalNftDialog', {...disclosure, setNft})
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
                                    <Text textStyle="paragraph" letterSpacing="0.04em" mt={{base: "20px"}} mb={{base: "8px"}} textAlign="center">
                                        <Trans>To obtain the original NFT, send a request to the owner</Trans>
                                        {" "}
                                    </Text>
                                    <Popover placement='top'>
                                        <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center">
                                            <chakra.span id='originalOwnerAddressHolder'>
                                                {originalOwner && <AddressDisplay address={originalOwner}/> }
                                            </chakra.span>
                                            <PopoverTrigger>
                                                <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" ml={{base: "2px"}} fontSize="18px" />
                                            </PopoverTrigger>
                                        </Text>
                                        <PopoverContent w="150px">
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverBody >
                                                <Trans>Copied{"!"}</Trans>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>

                                    { nft && <NFTImage nft={nft} /> }

                                </CardBody>

                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%"}} mb={{base: "20px"}}>
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant="darkOutline"
                                        >
                                            <Trans>Request original</Trans>
                                        </Button>
                                    </Box>
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
                                    <Text textStyle="paragraph">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* waitingForFinal */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" textAlign="center" fontWeight="700">
                                        <Trans>Request <br/> the original NFT{"?"}</Trans>
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
                                        <Image src="/images/icons-status/confirm.png" alt="Success" w="100%">
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
                                    <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="brand.light" borderRadius="16px">
                                        <Image src="/images/kleros_logo.png" alt="Kleros logo" w="24px" mr={{base: "20px"}} />
                                        <Flex flexDirection="column">
                                            <Text textStyle="paragraph" color="text.muted">
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
                                            <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                            <Trans>You cancelled a transaction</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
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

export default RequestOriginalNftDialog