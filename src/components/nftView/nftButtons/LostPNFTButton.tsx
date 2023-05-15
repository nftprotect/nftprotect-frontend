import { defaultArbitrator, dialogsTimeout } from '../../../utils/config'
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
import KlerosCaseForm from './steps/KlerosCaseForm';
import { useIPFSContext } from '../../../context/IPFSContextProvider';
import { parseEther } from '@ethersproject/units';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    variant: any,
    buttonTitle: string,
}

const LostPNFTButton = ({nft, nftReFetch, setRefreshPaused, originalOwner, variant, buttonTitle}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const { ipfs } = useIPFSContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()
    const [ evidenceData, setEvidenceData ] = useState<any>()
    const [ evidence, setEvidence ] = useState<IPFSUpload>()
    const { getDialog } = useCallableDialogContext()
    const DISPUTE_PRICE = '0.03'

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

    const evidenceTypes: any = {
        'protocol breach': 5,
        'phishing attack': 6,
        'sending to an incorrect address': 7
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
            setNextStep(StepMapping.waitForTransactionConfirmation);
            nftProtectContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    nft.loadPendingRequest()
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

    const copyNftOwnerToClipboard = () => {
        copyTextToClipboard(nft.ownerAddress || '', '#pNftOwnerAddressHolder')
    }

    const klerosFormSubmit = (data: any) => {
        setEvidenceData(data)
        const evidenceJSON = {
            evidenceSide: 0,
            name: t`Evidence of` + ` ${klerosCaseFormTitle}`,
            ...data
        }
        uploadEvidence(evidenceJSON).then((result:IPFSUpload) => {
            console.log('EVIDENCE', evidenceJSON, result)
            setEvidence(result)
            setNextStep(StepMapping.evidenceReview)
        })
    }

    const uploadEvidence = async (evidence: any) => {
        const fileName = 'evidence.json'
        if (ipfs) {
            const result = await ipfs.add(
                {
                    path: fileName,
                    content: JSON.stringify(evidence)
                }, 
                {wrapWithDirectory: true}
            )
            return new IPFSUpload({
                uploadResult: result,
                fileName: fileName,
                wrappedWithDirectory: true
            })
        } else {
            throw Error('IPFS client not configured!')
        }
    }

    const openDispute = () => {
        setNextStep(StepMapping.confirmTransaction)
        if (evidence) {
            const evidenceJSONUrl = evidence.getRelativeIPFSUrl()
            try {
                nftProtectContract.askOwnershipRestoreArbitrate(
                    nft.tokenId,
                    account, // TODO: Must be replaced by new address
                    defaultArbitrator,
                    lostReason && evidenceTypes[lostReason],
                    evidenceJSONUrl,
                    {
                        value: parseEther(DISPUTE_PRICE),
                    //    gasLimit: 1000000
                    }
                )
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
        } else {
            console.error('Missing evidence.json file')
        }
    }

    const klerosCaseFormTitle = (lostReason === 'protocol breach') ?
                                    t`Protocol breach` :
                                (lostReason === 'phishing attack') ?
                                    t`Phishing attack` :
                                (lostReason === 'sending to an incorrect address') ?
                                    t`Sending to an incorrect address` :
                                undefined

    const metaEvidenceId = (lostReason === 'protocol breach') ?
                                7 :
                            (lostReason === 'phishing attack') ?
                                6 :
                            (lostReason === 'sending to an incorrect address') ?
                                5 :
                            undefined
    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>{ buttonTitle }</Trans>
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
                                                    <CopyIcon onClick={ copyNftOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                                </PopoverTrigger>
                                                <PopoverContent w="150px">
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody >
                                                        <Trans>Copied{"!"}</Trans>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Popover>
                                            
                                            <span id='pNftOwnerAddressHolder'>
                                                { " (" + formatAddress(nft.ownerAddress, 4) + ") " }
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
                            <KlerosCaseForm
                                onClose={onClose}
                                onSubmit={klerosFormSubmit}
                                claimant={account || ''}
                                defendant={originalOwner}
                                title={ klerosCaseFormTitle }
                                requireProtocolAddress={(lostReason === 'protocol breach')}
                            >
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
                            </KlerosCaseForm>
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
                                            <Link 
                                                href='#' 
                                                textDecoration="underline" 
                                                cursor="pointer"
                                                onClick={() => {
                                                    const dialog = getDialog('KlerosCaseDialog')
                                                    dialog.setCaseData({
                                                        nft,
                                                        metaEvidenceId,
                                                        claimantAddress: account,
                                                        defendantAddress: nft.ownerAddress,
                                                        contractAddress: evidenceData.protocolAddress,
                                                        caseDescription: evidenceData.description,
                                                        evidences: []
                                                    })
                                                    dialog.onOpen() 
                                                }}
                                            >
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
                                            onClick={ openDispute }
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