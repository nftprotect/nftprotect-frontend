import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config'
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../../dialogs/DidRequiredDialog';
import { useState } from 'react';
import {
    Button,
    Box,
    Flex,
    Image,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    Textarea,
    ListItem,
    OrderedList,
    Link,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    Highlight,
    Spinner,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { AlertCircle, Info } from '@web3uikit/icons'
import { ChevronDownIcon, ExternalLinkIcon, CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { AuthErrorCode } from 'moralis/common-core';
import { NextComponentType } from 'next';
import { Trans, t } from '@lingui/macro';
import { useIPFSContext } from '../../../context/IPFSContextProvider';
import { IPFSFileUpload } from '../../IPFSFileUpload';
import { formatEther } from "@ethersproject/units";

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    tokenContract: Contract,
}

const LostPNFTButton = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract, originalOwner}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const { centralizeIpfsUrl } = useIPFSContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()

    enum StepMapping {
        start,
        lostReason,
        evidenceFillForm,
        evidenceReview,
        payArbitrationFee,
        confirmTransaction,
        waitForTransactionConfirmation,
        finalCompleted,
        canceled,
        error,
        timeout
    }

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.start)
        onOpen()
        setRefreshPaused(true)
    }

    function getNftImage() {
        let nftImage = <div />
        if (metadata) {
            const imgUrl = centralizeIpfsUrl(metadata?.image || '')
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
            }
        return nftImage
    }

    const handleLostReasonSelection = (event: any) => {
        let lostReason = event.target.getAttribute('data-reason')
        setLostReason(lostReason)
        setNextStep(StepMapping.lostReason)
    }

    const openCaseInKleros = () => {
        setNextStep(StepMapping.evidenceFillForm)
    }

    const evidenceReview = () => {
        setNextStep(StepMapping.evidenceReview)
    }
    
    const payArbitrationFee = () => {
        setNextStep(StepMapping.payArbitrationFee)
    }

    const approvePayment = () => {
        setNextStep(StepMapping.confirmTransaction)
    }

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder').then(() => alert('Copied!'))
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant="primary-solid"
            w="100%"
        >
            <Trans>Lost pNFT</Trans>
        </Button>

        <DidRequiredDialog disclosure={didDialogDisclosure}/>
        <Modal
            scrollBehavior="inside"
            isCentered
            isOpen={isOpen}
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
                setRefreshPaused(false)
            }}
        >
            <ModalOverlay 
                bg='blackAlpha.700'
            />
            <ModalContent
                w={{base: "450px"}}
                h={{base: "690px"}}
                my="0"
                bg="#FFF"
                border="2px solid #000"
                borderRadius="30px"
                backdropFilter="blur(7.5px)"
                overflowY={{base: 'auto'}}
            >
                <ModalBody py={{base: "33px"}} px={{base: "26px"}}>
                    <Wizard>
                        {/* Step 1. start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text as="h3" textStyle="h3" textTransform="uppercase" textAlign="center" fontWeight="700">
                                    Have you lost<br /> access to your pNFT?
                                </Text>

                                { getNftImage() }

                                <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                    {"Targeted by an intruder or made a mistake and lost access to your pNFT, don't worry. We can work together to recover your asset and restore it to your wallet."}
                                </Text>
                                <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center" fontWeight="700" color="accent.light" textTransform="uppercase">
                                    Select reason for losing pNFT
                                </Text>

                                <Flex flexWrap="nowrap" alignItems="center" mb={{base: "10px"}} py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="accent.light" borderRadius="16px">
                                    <Flex color="accent.light" mr={{base: "20px"}} bg="#FFF" >
                                        <Info fontSize="24px" />
                                    </Flex>
                                    <Flex flexDirection="column">
                                        <Text textStyle="paragraph" color="muted">
                                            {"If you're unsure of the reason for losing your asset, please select 'Phishing' as the most likely cause"}
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Menu matchWidth>
                                    <MenuButton
                                        as={Button} 
                                        rightIcon={<ChevronDownIcon fontSize="14px" />}
                                        borderRadius="0"
                                        color="#FFF"
                                        bgColor="accent.light"
                                        textAlign="left"
                                        fontSize={{base: '12px', lg: '14px'}}
                                        lineHeight={{base: '16px', lg: '18px'}}
                                        fontWeight="500"
                                        textTransform="none"
                                        mb={{base: "20px"}}
                                        _hover={{
                                            bgColor: "accent.light",
                                            color: "#FFF"
                                        }}
                                        _active={{
                                            bgColor: "accent.light",
                                            color: "#FFF"
                                        }}
                                    >
                                        <Trans>Reason</Trans>
                                    </MenuButton>
                                    <MenuList border="1px solid black" borderRadius="3px" textStyle="paragraph">
                                        <MenuItem data-reason="phishing attack" onClick={ handleLostReasonSelection }>
                                            <Trans>Phishing attack</Trans>
                                        </MenuItem>
                                        <MenuItem data-reason="protocol breach" onClick={ handleLostReasonSelection }>
                                            <Trans>Protocol breach</Trans>
                                        </MenuItem>
                                        <MenuItem data-reason="sending to an incorrect address" onClick={ handleLostReasonSelection }>
                                            <Trans>Sending to an incorrect address</Trans>
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Flex w="50%">
                                    <Button 
                                        onClick={onClose}
                                        variant="light-outline"
                                        border="none"
                                        w="100%"
                                    >Close
                                    </Button>
                                </Flex>
                            </Flex>
                            
                        </SwitchableOutside>
                        
                        {/* Step 2. lostReason */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text as="h3" textStyle="h3" textTransform="uppercase" textAlign="center" fontWeight="700">
                                    { lostReason }
                                </Text>

                                { getNftImage() }

                                <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}}>
                                    <Text mb={{base: "8px"}}>
                                        <Trans>
                                            {"If you've lost access to your pNFT, you should try attempting to resolve the issue with the current owner of the pNFT"}
                                        </Trans>
                                        <span id='originalOwnerAddressHolder'>
                                            { " "}
                                            <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer"/>
                                            { " (" + formatAddress(originalOwner, 4) + ") " }
                                        </span>
                                        <Trans>
                                            {"before resorting to legal action."}
                                        </Trans>
                                    </Text>
                                    <Text mb={{base: "8px"}}>
                                        <Trans>
                                        {"You can try to find the owner through social media or use services like Blockscan Chat or Hashmail to communicate with them."}
                                        </Trans>
                                    </Text>

                                    <Text>
                                        <Trans>{"Keep screenshots of all conversations as evidence if you need to submit a case to Kleros."}</Trans>
                                    </Text>
                                </Flex>

                                <Flex flexWrap="nowrap" alignItems="center" my={{base: "20px"}} py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="accent.light" borderRadius="16px">
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
                                
                                <Flex flexDirection="row" flexWrap={{base: "wrap", sm: "nowrap"}} alignSelf="flex-start" justifyContent="space-evenly" w="100%">
                                    <Box mb={{base: "20px", sm: "0"}} w={{base: "100%", sm: "40%"}}>
                                        <Button 
                                            onClick={onClose}
                                            variant="dark-outline"
                                        ><Trans>Close</Trans>
                                        </Button>
                                    </Box>

                                    <Box w={{base: "100%", sm: "40%"}}>
                                        <Button 
                                            variant="dark-outline"
                                            onClick={openCaseInKleros}
                                        ><Trans>Open dispute</Trans>
                                        </Button>
                                    </Box>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>
                        
                        {/* Step 3. evidenceFillForm */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" px={[4, 8, 12]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Open dispute in Kleros</Trans>
                                </Heading>

                                 <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase" fontWeight="400">
                                    { lostReason }
                                </Text>
                                <Textarea
                                    placeholder={t`Describe the situation in details…`}
                                    mb={[8]}
                                    _hover={{
                                        border: "2px solid #2D7BD6"
                                    }}
                                    _focus={{
                                        border: "2px solid #2D7BD6"
                                    }}
                                />
                                
                                {(lostReason == 'protocol breach') &&
                                    <Textarea
                                        placeholder={t`Write the address of the protocol smart contract`}
                                        mb={[8]}
                                        _hover={{
                                            border: "2px solid #2D7BD6"
                                        }}
                                        _focus={{
                                            border: "2px solid #2D7BD6"
                                        }}
                                    />
                                }
                                
                                <Text fontSize={["sm", "md"]} mb={[2]}>
                                    <Trans>Upload all available evidence:</Trans>
                                </Text>
                                <OrderedList fontSize={["sm", "md"]} mb={[8]}>
                                    <ListItem>
                                        <Popover>
                                            <PopoverTrigger>
                                                <Text>
                                                    <Trans>
                                                        <Highlight query='Evidence' styles={{ cursor: "pointer", textDecoration: "underline", px: '1', py: '1', bg: 'orange.100'}}>
                                                            Evidence of attempts to solve the problem on your own
                                                        </Highlight>
                                                    </Trans>
                                                </Text>
                                            </PopoverTrigger>
                                            <PopoverContent bg="#2D7BD6" w="476px">
                                                <PopoverArrow bg="#2D7BD6"/>
                                                <PopoverCloseButton color="#FFF" />
                                                <PopoverBody color="#FFF" fontSize={{md: "14px"}}>

                                                {(lostReason == 'phishing attack') &&
                                                    <Box py={{md: "10px"}} px={{md: "20px"}}>
                                                        <Text>
                                                            Chat logs or emails: If the loss of pNFT resulted from a phishing attack or social engineering, chat logs or emails with the attacker could be used to establish their identity and intent.
                                                        </Text>
                                                        <Text>
                                                            Screen recordings: If the loss of pNFT resulted from a scam, a screen recording of the interaction with the scammer could be used as evidence.
                                                        </Text>
                                                        <Text>
                                                            Law enforcement reports: If the loss of pNFT has been reported to law enforcement, any relevant reports or documentation related to the dispute may be used as evidence.
                                                        </Text>
                                                        <Text>
                                                            Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.
                                                        </Text>
                                                    </Box>
                                                }

                                                {(lostReason == 'protocol breach') &&
                                                    <Box py={{md: "10px"}} px={{md: "20px"}}>
                                                        <Text>
                                                            Security reports or Protocol Breach Post-mortem: If the loss of pNFT was the result of a protocol breach or hack, security reports (a detailed description of the vulnerability exploited to perform the hack, available in a publicly accessible format, such as a PDF or HTML document, and signed by the responsible parties, such as the NFT Protect team or the compromised partner) could be used to establish the details of the breach and how it was exploited.
                                                        </Text>
                                                        <Text>
                                                            Law enforcement reports: If the loss of pNFT has been reported to law enforcement, any relevant reports or documentation related to the dispute may be used as evidence.
                                                        </Text>
                                                        <Text>
                                                            Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.
                                                        </Text>
                                                    </Box>
                                                }

                                                {(lostReason == 'sending to an incorrect address') &&
                                                    <Box py={{md: "10px"}} px={{md: "20px"}}>
                                                        <Text>
                                                            Screen recordings: If the loss of pNFT resulted from a scam, a screen recording of the interaction with the scammer could be used as evidence.
                                                        </Text>
                                                        <Text>
                                                            Screenshots: Screenshots of any relevant communication or activity related to the loss of pNFT, such as messages between the original owner and the party who allegedly took it.
                                                        </Text>
                                                        <Text>
                                                            Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.
                                                        </Text>
                                                    </Box>
                                                }
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    </ListItem>
                                    <ListItem>
                                        <Trans>Other Evidence including chat logs or emails, screen recordings, law enforcement reports or any other information that may be relevant to the case, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.</Trans>
                                    </ListItem>
                                </OrderedList>

                                <IPFSFileUpload />

                                <Flex flexWrap="nowrap" alignItems="center" mt={[4]} mb={[8]}>
                                    <Box color="#2D7BD6" mr={[2]}>
                                        <Info fontSize='20px' />
                                    </Box>
                                    <Text fontSize={["sm", "md"]} color="#999999">
                                        <Trans>You can add an external file in PDF or add multiple files in a single .zip file.</Trans>
                                    </Text>
                                </Flex>
                                <Flex flexDirection="column" alignItems="center">
                                    <Button
                                        onClick={ evidenceReview }
                                        variant="dark-outline"
                                        m={[4]}
                                        w="50%"
                                        textTransform="uppercase"
                                    >
                                        <Trans>Open dispute</Trans>
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="light-outline"
                                        m={[4]}
                                        textTransform="uppercase"
                                        w="50%"
                                    >Close
                                    </Button>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>
                        
                        {/* Step 4. evidenceReview */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[4, 8, 12]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    Open dispute<br /> in Kleros
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    <Trans>
                                        We've worked very hard to prepare a strong dispute with compelling evidence. Please review the dispute file provided via the 
                                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6">
                                            <Trans>link</Trans>
                                            <ExternalLinkIcon mx='2px' />
                                        </Link>
                                        , and file it in court.
                                    </Trans>
                                </Text>
                                 
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    <Trans>Please note that the review process can take several weeks to several months.</Trans>
                                </Text>

                                <Box w={{base: "60%", sm: "40%"}}>
                                    <Button
                                        onClick={ payArbitrationFee }
                                        my={2}
                                        h={[8, 10]}
                                        variant="dark-outline"
                                    >
                                        <Trans>Open dispute</Trans>
                                    </Button>

                                    <Button
                                        onClick={ onClose }
                                        my={2}
                                        h={[8, 10]}
                                        variant="light-outline"
                                    >
                                        <Trans>Close</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        {/* Step 5. payArbitrationFee */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[4, 8, 12]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    Open dispute<br /> in Kleros
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    <Trans>The final step to open a dispute is to pay for the arbitration fees.</Trans>
                                </Text>
                                 
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    <Trans>The fee for dispute resolution is</Trans>
                                </Text>

                                <Text fontSize={["xl", "2xl", "3xl"]} mb={[8]} textAlign="center" textTransform="uppercase" fontWeight="500">
                                    {"Ξ"}{ formatEther(fee || 0) } 
                                </Text>

                                <Box w={{base: "60%", sm: "40%"}}>
                                    <Button
                                        onClick={ approvePayment }
                                        my={2}
                                        h={[8, 10]}
                                        variant="dark-outline"
                                    >
                                        <Trans>Pay the dispute</Trans>
                                    </Button>

                                    <Button
                                        onClick={ onClose }
                                        my={2}
                                        h={[8, 10]}
                                        variant="light-outline"
                                    >
                                        <Trans>Close</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>

                        {/* Step 6. confirmTransaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    Open dispute<br /> in Kleros
                                </Heading>
                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center" textTransform="uppercase">
                                    <Trans>Confirm the transaction in the wallet</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        {/* Waiting for transaction confirmation */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    Open dispute<br /> in Kleros
                                </Heading>
                                <Spinner
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center" textTransform="uppercase">
                                    <Trans>{"Wait for transaction to confirm…"}</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        {/* Dispute sent succesfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[4, 8, 10]}>
                                <Text
                                    as="h3"
                                    fontSize={{md: "30px"}}
                                    lineHeight={{md: "130%"}}
                                    textTransform="uppercase"
                                    fontWeight="700"
                                    textAlign="center" 
                                    mb="4"
                                >
                                    <Trans>Your dispute <br/> sent to Kleros</Trans>
                                </Text>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>

                                <Text fontSize={["md", "lg"]} textAlign="center" my={{md: "32px"}}>
                                    <Trans>
                                        You can add any missing evidence to your dispute within 48 hours using the link provided, during the ongoing evidence collection phase.
                                    </Trans>
                                </Text>
                                <Text fontSize={["md", "lg"]} textAlign="center" mb={{md: "32px"}}>
                                    <Trans>Follow the status of the dispute through our app or on the website Kleros.</Trans>
                                </Text>
                                <Flex w="40%" flexDirection="column" alignSelf="center" fontSize="16px">
                                    <Button
                                        onClick={ onClose }
                                        my={2}
                                        h={[8, 10]}
                                        variant="light-outline"
                                    >
                                        <Trans>Close</Trans>
                                    </Button>
                                </Flex>
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

export default LostPNFTButton