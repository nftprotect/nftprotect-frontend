import { dialogsTimeout } from '../../../utils/config'
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../../dialogs/DidRequiredDialog';
import { useState } from 'react';
import {
    chakra,
    Button,
    Box,
    Flex,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
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
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { ChevronDownIcon, ExternalLinkIcon, CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import { IPFSFileUpload } from '../../IPFSFileUpload';
import { formatEther } from "@ethersproject/units";
import NFT from '../../../classes/NFT';
import IPFSUpload from '../../../classes/IPFSUpload';

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    variant: any
}

const LostPNFTButton = ({nft, nftReFetch, setRefreshPaused, originalOwner, variant}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()
    const [evidenceUpload, setEvidenceUpload] = useState<IPFSUpload>()

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
        return <Flex
            borderRadius={{base: "16px"}}
            filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
            overflow="hidden"
            my={{base: "20px"}}
            justifyContent="center"
            h="150px"
            w="150px"
        >
            <Image 
                src={ nft.thumbnail }
                alt={ nft.title || t`NFT image`}
                borderRadius="1rem"
            />
        </Flex>
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

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>Lost pNFT</Trans>
        </Button>

        {/* <DidRequiredDialog disclosure={didDialogDisclosure}/> */}
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
                w={{base: "450px"}}
                sx={{
                    "::-webkit-scrollbar": {
                        w: "5px",
                    },
                    "::-webkit-scrollbar-track": {
                        my: '16px',
                        overflowY: "hidden"
                    },
                    "::-webkit-scrollbar-thumb": {
                        bgColor: 'accent.light',
                    }

                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Step 1. start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" 
                            >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Have you lost<br /> access to your pNFT?</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>

                                    { getNftImage() }

                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        {"Targeted by an intruder or made a mistake and lost access to your pNFT, don\u0027t worry. We can work together to recover your asset and restore it to your wallet."}
                                    </Text>
                                    <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center" fontWeight="700" color="accent.light" textTransform="uppercase">
                                        Select reason for losing pNFT
                                    </Text>

                                    <Text textStyle="paragraph" color="muted" textAlign="center" mb={{base: "20px"}}>
                                        {"If you're unsure of the reason for losing your asset, please select 'Phishing' as the most likely cause"}
                                    </Text>

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
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Step 2. lostReason */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        { lostReason }
                                    </Text>
                                </CardHeader>
                                
                                <CardBody mb={{base: "20px"}}>
                                    { getNftImage() }

                                    <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                        <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "8px"}}>
                                            <Trans>
                                                {"If you've lost access to your pNFT, you should try attempting to resolve the issue with the current owner of the pNFT"}
                                            </Trans>
                                            {" "}
                                            <Popover placement='top'>
                                                <PopoverTrigger>
                                                    <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                                </PopoverTrigger>
                                                <PopoverContent w="150px">
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody >
                                                        <Trans>Copied{"!"}</Trans>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Popover>
                                            
                                            <span id='originalOwnerAddressHolder'>
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
                                </CardBody>

                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%", sm: "40%"}} mb={{base: "20px"}}>
                                        <Button
                                            variant="dark-outline"
                                            onClick={openCaseInKleros}
                                        ><Trans>Open dispute</Trans>
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
                        
                        {/* Step 3. evidenceFillForm */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Open dispute <br /> in Kleros</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody mb={{base: "20px"}}>
                                    <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center" textTransform="uppercase" fontWeight="700" color="accent.light">
                                        { lostReason }
                                    </Text>
                                    <Textarea placeholder={t`Describe the situation in details…`} variant='primary' resize="vertical" mb={{base: "20px"}} isRequired />
                                    
                                    {(lostReason == 'protocol breach') &&
                                        <Textarea placeholder={t`Write the address of the protocol smart contract`} variant='primary' resize="vertical" mb={{base: "20px"}} isRequired minH={{base: "38px" }} />
                                    }
                                    
                                    <Flex mb={{base: "20px"}} flexDirection="column" textStyle="paragraph" >
                                        <Text mb={{base: "8px"}}>
                                            <Trans>Upload all available evidence:</Trans>
                                        </Text>
                                        <OrderedList>
                                            <ListItem>
                                                <Popover>
                                                    <Text>
                                                        {"Evidence of attempts to solve the problem on your own.\u0020"}
                                                        <PopoverTrigger>
                                                            <chakra.span color="#9D9D9D" textDecoration="underline" cursor="pointer">
                                                                <Trans>Detailed</Trans>
                                                            </chakra.span>
                                                        </PopoverTrigger>
                                                    </Text>
                                                    
                                                    <PopoverContent bg="#F5F1FF" w="400px" border="2px solid #000" borderRadius="30px" maxH="280px" overflowY="auto" ml={{base: "20px"}}
                                                        sx={{
                                                            "::-webkit-scrollbar": {
                                                                w: "5px",
                                                            },
                                                            "::-webkit-scrollbar-track": {
                                                                my: '16px',
                                                                overflowY: "hidden"
                                                            },
                                                            "::-webkit-scrollbar-thumb": {
                                                                bgColor: 'accent.light',
                                                            }

                                                        }}
                                                    >
                                                        <PopoverArrow bg="#F5F1FF" />
                                                        <PopoverCloseButton />
                                                        <PopoverBody color="#000">

                                                        {(lostReason == 'phishing attack') &&
                                                            <Box py={{md: "10px"}} px={{md: "20px"}} textStyle="paragraph">
                                                                <Text letterSpacing="0.04em" mb={{base: "8px"}}>
                                                                    <Trans>Chat logs or emails: If the loss of pNFT resulted from a phishing attack or social engineering, chat logs or emails with the attacker could be used to establish their identity and intent.</Trans>
                                                                </Text>
                                                                <Text letterSpacing="0.04em" mb={{base: "8px"}}>
                                                                    <Trans>Screen recordings: If the loss of pNFT resulted from a scam, a screen recording of the interaction with the scammer could be used as evidence.</Trans>
                                                                </Text>
                                                                <Text letterSpacing="0.04em" mb={{base: "8px"}}>
                                                                    <Trans>Law enforcement reports: If the loss of pNFT has been reported to law enforcement, any relevant reports or documentation related to the dispute may be used as evidence.</Trans>
                                                                </Text>
                                                                <Text letterSpacing="0.04em" mb={{base: "8px"}}>
                                                                    <Trans>Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.</Trans>
                                                                </Text>
                                                            </Box>
                                                        }

                                                        {(lostReason == 'protocol breach') &&
                                                            <Box py={{md: "10px"}} px={{md: "20px"}} textStyle="paragraph">
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Security reports or Protocol Breach Post-mortem: If the loss of pNFT was the result of a protocol breach or hack, security reports (a detailed description of the vulnerability exploited to perform the hack, available in a publicly accessible format, such as a PDF or HTML document, and signed by the responsible parties, such as the NFT Protect team or the compromised partner) could be used to establish the details of the breach and how it was exploited.</Trans>
                                                                </Text>
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Law enforcement reports: If the loss of pNFT has been reported to law enforcement, any relevant reports or documentation related to the dispute may be used as evidence.</Trans>
                                                                </Text>
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.</Trans>
                                                                </Text>
                                                            </Box>
                                                        }

                                                        {(lostReason == 'sending to an incorrect address') &&
                                                            <Box py={{md: "10px"}} px={{md: "20px"}} textStyle="paragraph">
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Screen recordings: If the loss of pNFT resulted from a scam, a screen recording of the interaction with the scammer could be used as evidence.</Trans>
                                                                </Text>
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Screenshots: Screenshots of any relevant communication or activity related to the loss of pNFT, such as messages between the original owner and the party who allegedly took it.</Trans>
                                                                </Text>
                                                                <Text mb={{base: "8px"}} letterSpacing="0.04em">
                                                                    <Trans>Any other relevant information: Any other information that may be relevant to the dispute, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.</Trans>
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
                                    </Flex>
                                    
                                    <Box w="100%">
                                        <IPFSFileUpload returnUploadedFile={ setEvidenceUpload }/>
                                    </Box>
                                    
                                    <Flex flexWrap="nowrap" alignItems="center" mt={{base: "8px"}} mb={{base: "10px"}}>
                                        <Box color="#2D7BD6" mr={[2]}>
                                            <Info fontSize='20px' />
                                        </Box>
                                        <Text textStyle="paragraph" color="#999999">
                                            <Trans>You can add an external file in PDF or add multiple files in a single .zip file.</Trans>
                                        </Text>
                                    </Flex>
                                </CardBody>

                                <CardFooter>
                                    <Box w={{base: "60%", xs: "40%"}}>
                                        <Button
                                            onClick={ evidenceReview }
                                            variant="dark-outline"
                                            textTransform="uppercase"
                                        >
                                            <Trans>Open dispute</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>
                        
                        {/* Step 4. evidenceReview */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Open dispute<br /> in Kleros</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody mb={{base: "20px"}}>
                                    <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center">
                                        <Trans>
                                            We{'\u0027'}ve worked very hard to prepare a strong dispute with compelling evidence. Please review the dispute file provided via the 
                                            <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer">
                                                <Trans>link</Trans>
                                            </Link>
                                            , and file it in court.
                                        </Trans>
                                    </Text>

                                    <Text textStyle="paragraph"  textAlign="center">
                                        <Trans>Please note that the review process can take several weeks to several months.</Trans>
                                    </Text>
                                </CardBody>

                                <CardFooter>
                                    <Box w={{base: "60%", xs: "50%"}}>
                                        <Button
                                            onClick={ () => setNextStep(StepMapping.payArbitrationFee) }
                                            variant="dark-outline"
                                        >
                                            <Trans>Open dispute</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* Step 5. payArbitrationFee */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Open dispute<br /> in Kleros</Trans>
                                        </Text>
                                    </CardHeader>
                                    
                                    <CardBody mb={{base: "20px"}}>
                                        <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center">
                                            <Trans>The final step to open a dispute is to pay for the arbitration fees.</Trans>
                                        </Text>
                                        
                                        <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center">
                                            <Trans>The fee for dispute resolution is</Trans>
                                        </Text>

                                        <Text fontSize={{base: "36px"}} textAlign="center" textTransform="uppercase">
                                            {"Ξ"}{ formatEther(fee || 0) } 
                                        </Text>
                                    </CardBody>
                                </Flex>

                                <CardFooter>
                                    <Box w={{base: "60%", xs: "50%"}}>
                                        <Button
                                            onClick={ () => setNextStep(StepMapping.confirmTransaction) }
                                            variant="dark-outline"
                                        >
                                            <Trans>Pay the dispute</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* Step 6. confirmTransaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Open dispute<br /> in Kleros</Trans>
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

                        {/* Waiting for transaction confirmation */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" textTransform="uppercase" textAlign="center" fontWeight="700">
                                        <Trans>Open dispute<br /> in Kleros</Trans>
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

                        {/* Dispute sent succesfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "360px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Your dispute <br/> sent to Kleros</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody>
                                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                            <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>
                                                You can add any missing evidence to your dispute within 48 hours using the link provided, during the ongoing evidence collection phase.
                                            </Trans>
                                        </Text>
                                        <Text textStyle="paragraph" textAlign="center">
                                            <Trans>Follow the status of the dispute through our app or on the website Kleros.</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
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
                            </Card>
                        </SwitchableOutside>

                        {/* Error */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Some error occured</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                        <Trans>Transaction failed.</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>{"Transaction is still in progress…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default LostPNFTButton