import React, { useEffect, useState } from 'react';
import {
    chakra,
    Button,
    Box,
    Image,
    Flex,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    Spinner,
    ModalCloseButton,
    Link,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { CopyIcon } from '@chakra-ui/icons'
import { copyTextToClipboard } from '../../../utils/helpers';
import { Trans } from '@lingui/macro'
import { KlerosCourts } from '../../../utils/kleros';
import KlerosCaseForm from '../../steps/KlerosCaseForm';
import KlerosEvidencesForm, { EvidenceData, EvidenceJson } from '../../steps/KlerosEvidencesForm';
import { t } from '@lingui/macro';
import { parseEther, formatEther } from '@ethersproject/units';
import NFT from '../../../classes/NFT';
import IPFSUpload from '../../../classes/IPFSUpload';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import AddressDisplay from '../../AddressDisplay';
import { ReqStatus } from '../../../hooks/useNftProtect';
import useNftProtect from '../../../hooks/useNftProtect';

interface DialogInitialData {
    nftReFetch: Function, // function to update nft list
}

const ArbitrateOwnershipAdjustmentDialog = ({ nftReFetch }: DialogInitialData) => {

    const [ nft, setNft ] = useState<NFT>()
    const { nftProtectContract, account, library, baseTokenPrice, currentChain, defaultChain } = useAppContext()
    const { getRequestByTokenId } = useNftProtect(currentChain?.id || defaultChain.id)
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { getDialog, setDialog } = useCallableDialogContext()
    const [ nextStep, setNextStep ] = useState<number>(0)
    //* Stores evidence initial data and result json */
    const [ evidenceData, setEvidenceData ] = useState<any>()
    //* Stores evidence files uploaded by user */
    const [ evidenceFiles, setEvidenceFiles ] = useState<IPFSUpload>()
    //* Stores evidenceJson file*/
    const [ evidence, setEvidence ] = useState<IPFSUpload>()
    const [ requestTimedOut, setRequestTimedOut ] = useState(false)
    const subcourtID = KlerosCourts.General
    const numberOfVotes = 3
    const DISPUTE_PRICE = '0.03'
    const metaEvidenceId = 3

    const disputeId = nft?.pendingRequest?.externalDisputeId

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        klerosForm,
        evidenceDescribeFiles,
        evidenceReview,
        payArbitrationFee,
        confirmTransaction,
        waitingForTransaction,
        caseSent,
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

    const finalTransactionSent = async () => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForTransaction);
            nftProtectContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    const action = async () => {
                        nft!.pendingRequest = await getRequestByTokenId(nft!.tokenId) || undefined
                        setNft(nft)
                        // TODO: probably we have to set NFT in parent component
                    }
                    action();
                    setNextStep(StepMapping.caseSent);
                    console.log("Transaction successful", tx.hash);
                    nftReFetch();
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const klerosFormSubmit = ({data, upload}: {data: EvidenceData, upload: IPFSUpload}) => {
        setEvidenceData(data)
        setEvidenceFiles(upload)
        setNextStep(StepMapping.evidenceDescribeFiles)
    }

    const klerosEvidenceFormSubmit = ({data, upload}: {data: EvidenceJson, upload: IPFSUpload}) => {
        setEvidenceData(data)
        setEvidence(upload)
        setNextStep(StepMapping.evidenceReview)
    }

    const openDispute = () => {
        setNextStep(StepMapping.confirmTransaction)
        if (evidence) {
            const evidenceJSONUrl = evidence.getRelativeIPFSUrl()
            try {
                nftProtectContract.askOwnershipAdjustmentArbitrate(nft?.pendingRequest?.id, evidenceJSONUrl, {
                    value: parseEther(DISPUTE_PRICE),
                //    gasLimit: 1000000
                })
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

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(nft?.originalData?.ownerAddress || '', '#originalOwnerAddressHolder').then(() => alert('Copied!'))
    }

    const dialogClose = () => {
        setNextStep(StepMapping.start)
        onClose()
    }

    // Set timer for request timeout
    useEffect(() => {
        if (nft?.pendingRequest && (nft.pendingRequest.status === ReqStatus.Initial) && !requestTimedOut) {
            const timeUntilTimeout = nft.pendingRequest.timeout.toNumber() - Date.now();
            console.log('Time until request timeout:', timeUntilTimeout)
            if (timeUntilTimeout > 0) {
                const timeoutId = setTimeout(() => {
                    setRequestTimedOut(true);
                }, timeUntilTimeout);
                return () => clearTimeout(timeoutId);
            } else {
                setRequestTimedOut(true);
            }
        }
    }, [nft]);

    useEffect(() => {
        setDialog('ArbitrateOwnershipAdjustmentDialog', {...disclosure, setNft})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={dialogClose}
            blockScrollOnMount={false}
        >
            <ModalOverlay 
                bg='blackAlpha.700' 
                backdropFilter='blur(10px)' 
            />
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
                        bgColor: 'brand.light',
                    }
                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader mb={{base: "20px"}}>
                                    {/* NFT owner confirmed transfer */}
                                    { nft?.pendingRequest?.status == ReqStatus.Accepted &&
                                        <Text as="h3" textStyle="h3">
                                            {t`Congrats`}{"!"}
                                        </Text>
                                    } 
                                    
                                    {/* NFT owner refused transfer */}
                                    { nft?.pendingRequest?.status == ReqStatus.Rejected &&
                                        <Text as="h3" textStyle="h3" >
                                            {t`The original NFT`}<br/>{t`owner refused`}
                                        </Text>
                                    }
                                    
                                    {/* NFT owner unresponsive */}
                                    { requestTimedOut &&
                                        <Text as="h3" textStyle="h3">
                                            {t`The original NFT`}<br/>{t` owner unresponsive`}
                                        </Text>
                                    }
                                </CardHeader>
                                <CardBody mb={{base: "20px"}}>
                                    {/* NFT owner confirmed transfer */}
                                    { nft?.pendingRequest?.status == ReqStatus.Accepted &&
                                        <Popover placement='top'>
                                            <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "8px"}}>
                                                <chakra.span id='originalOwnerAddressHolder'>
                                                    { " " }<AddressDisplay address={nft.originalData?.ownerAddress||''}/>
                                                </chakra.span>
                                                <PopoverTrigger>
                                                    <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" ml={{base: "2px"}} fontSize="18px" />
                                                </PopoverTrigger>
                                                { " " }
                                                <Trans>
                                                    {"has transferred the original NFT to you"}
                                                </Trans>
                                            </Text>
                                            <PopoverContent w="150px">
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverBody >
                                                    <Trans>Copied{"!"}</Trans>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    }

                                    { nft && <NFTImage nft={nft} /> }
                                    {/* NFT owner rejected transfer */}
                                    { nft?.pendingRequest?.status == ReqStatus.Rejected &&
                                        <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center" letterSpacing="0.04em">
                                            { t`Don't agree? Initiate a dispute in the Kleros decentralized court.`}
                                        </Text>
                                    }

                                    {/* NFT owner unresponsive */}
                                    { requestTimedOut &&
                                        <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center" letterSpacing="0.04em">
                                            {t`Want to initiate a dispute in the Kleros decentralized court?`}
                                        </Text>
                                    }

                                    {/* NFT owner rejected transfer or unresponsive*/}
                                    { (nft?.pendingRequest?.status == ReqStatus.Rejected || requestTimedOut) && 
                                        <Text textStyle="paragraph"  textAlign="center" letterSpacing="0.04em">
                                                {t`(Paid separately)`}
                                        </Text>
                                    }
                                </CardBody>
                                <CardFooter flexDirection="column" alignItems="center">
                                    
                                    <Box w={{base: "60%", sm: "50%"}} mb={{base: "20px"}}>
                                        {/* NFT owner rejected transfer or unresponsive*/}
                                        { (nft?.pendingRequest?.status == ReqStatus.Rejected || requestTimedOut) && 
                                            <Button
                                                variant="darkOutline"
                                                onClick={ () => setNextStep(StepMapping.klerosForm) }
                                            ><Trans>Open dispute</Trans>
                                            </Button>
                                        }

                                        {/* NFT owner accepted transfer */}
                                        { nft?.pendingRequest?.status == ReqStatus.Accepted &&
                                            <Button
                                                variant={"darkOutline"}
                                                onClick={ () => {
                                                    const dialog = getDialog('ProtectNftDialog')
                                                    dialog.setNft(nft)
                                                    dialog.onOpen()
                                                } }
                                            >
                                                <Trans>Protect NFT</Trans>
                                            </Button>
                                        }
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* Kleros form */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <KlerosCaseForm
                                onClose={onClose}
                                onSubmit={klerosFormSubmit}
                                claimant={account || ''}
                                defendant={nft?.originalData?.ownerAddress || ''}
                                header={t`Open dispute in Kleros`}
                                title={t`Bona fide transfer`}
                                buttonText={t`Open dispute`}
                                requireProtocolAddress={false}
                            >
                                <Flex mb={{base: "20px"}} flexDirection="column" textStyle="paragraph" >
                                    <Text mb={{base: "8px"}}>
                                        <Trans>Upload all available evidence.</Trans>
                                    </Text>
                                    <Text>
                                        <Trans>To ensure a fair review by expert arbitrators, be sure to provide evidence. The more detail you provide, including text, images, or other documentation, the better the review.</Trans>
                                    </Text>
                                </Flex>
                            </KlerosCaseForm>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            {evidenceFiles && <KlerosEvidencesForm
                                goBack={() => setNextStep(StepMapping.klerosForm)}
                                onSubmit={ klerosEvidenceFormSubmit }
                                header={ t`Open dispute in Kleros` }
                                title={t`Bona fide transfer`}
                                buttonText={t`Open dispute`}
                                ipfsUpload={ evidenceFiles }
                                evidenceData={{
                                    name: `Evidence of Bona fide transfer`,
                                    description: evidenceData.description,
                                    evidenceSide: 0,
                                }}
                            />}
                        </SwitchableOutside>

                        {/* evidenceReview */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Open dispute in Kleros</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody mb={{base: "20px"}}>
                                    <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center">
                                        <Trans>
                                            {"Before we raise the dispute in Kleros Court, please review the case and collect evidence.  If everything is OK, press the 'Proceed to payment' button."}
                                        </Trans>
                                    </Text>
                                </CardBody>

                                <CardFooter>
                                    <Box w={{base: "45%", sm: "40%"}}>
                                        <Button
                                            variant="darkOutline"
                                            onClick={() => {
                                                const dialog = getDialog('KlerosCaseDialog')
                                                dialog.setCaseData({
                                                    nft,
                                                    metaEvidenceId,
                                                    claimantAddress: account,
                                                    defendantAddress: nft?.originalData?.ownerAddress,
                                                    evidences: [{
                                                        evidenceJson: evidenceData,
                                                        submittedBy: account,
                                                        submitDate: new Date()
                                                    }]
                                                })
                                                dialog.onOpen() 
                                            }}
                                        >
                                            <Trans>Review the case</Trans>
                                        </Button>
                                    </Box>
                                    <Box w={{base: "45%", sm: "40%"}}>
                                        <Button
                                            onClick={ () => setNextStep(StepMapping.payArbitrationFee) }
                                            variant="darkOutline"
                                        >
                                            <Trans>Proceed to payment</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* payArbitrationFee */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Open dispute in Kleros</Trans>
                                        </Text>
                                    </CardHeader>
                                    
                                    <CardBody mb={{base: "20px"}}>
                                        <Text textStyle="paragraph" my={{base: "20px"}} textAlign="center">
                                            <Trans>The final step to open a dispute is to pay for the arbitration fees.</Trans>
                                        </Text>
                                        
                                        <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center">
                                            <Trans>The fee for dispute resolution is</Trans>
                                        </Text>

                                        <Flex justifyContent="center" w={"100%"}>
                                            <Text fontSize={{base: "36px"}} textAlign="center" textTransform="uppercase">
                                                {"Ξ"}{ DISPUTE_PRICE } 
                                            </Text>
                                            &nbsp;
                                            { baseTokenPrice && <Text fontSize={['16px']} lineHeight={'1em'}>
                                                ~${ Math.round(parseFloat(DISPUTE_PRICE) * baseTokenPrice) }
                                            </Text> }
                                        </Flex>
                                    </CardBody>
                                </Flex>

                                <CardFooter>
                                    <Box w={{base: "60%", xs: "50%"}}>
                                        <Button
                                            onClick={ openDispute }
                                            variant="darkOutline"
                                        >
                                            <Trans>Pay the dispute</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Open dispute in Kleros</Trans>
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

                        {/* Waiting for transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3" textAlign="center" fontWeight="700">
                                        <Trans>Open dispute in Kleros</Trans>
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

                        {/* Case sent to Kleros */}
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
                                            <Image src="/images/icons-status/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                            <Trans>{"If you've missed including any evidence, you have up to 48 hours to add additional evidence to your dispute while the evidence collection phase is still ongoing."}</Trans>
                                        </Text>
                                        
                                        <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer">
                                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                                <Trans>case {disputeId?.toString()}</Trans>
                                            </Text>
                                        </Link>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                            <Trans>Follow the status of the dispute through our app or on the website Kleros.</Trans>
                                        </Text>
                                        
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Transaction canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
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
                            </Card>
                        </SwitchableOutside>

                        {/* Error occured */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Some error occured</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                                        <Trans>Transaction failed.</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* Transaction timeout */}
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

export default ArbitrateOwnershipAdjustmentDialog