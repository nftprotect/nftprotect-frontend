import { dialogsTimeout } from '../../../utils/config' 
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
    Spinner,
    ModalCloseButton,
    Link,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { CopyIcon } from '@chakra-ui/icons'
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { RequestStatus, ActionRequest } from '../NFTCard';
import { Trans } from '@lingui/macro'
import { generateArbitratorExtraData, KlerosCourts, klerosCases } from '../../../utils/kleros';
import KlerosCaseForm from './steps/KlerosCaseForm';
import { useIPFSContext } from '../../../context/IPFSContextProvider';
import { t } from '@lingui/macro';
import { parseEther, formatEther } from '@ethersproject/units';
import { getCentralizedUrl, getRelativeIpfsUrl, centralizeIpfsUrl } from '../../../utils/ipfs';
import NFT from '../../../classes/NFT';

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function // Function to pause/unpause nft list updating
    pendingRequest: any,
    originalOwner: string, // Owner address of original NFT,
    loadPendingRequest: Function, // Function to reload a pending request
    variant: any // apearance of the button (see variants in theme/index.tsx)
}

const ArbitrateOwnershipAdjustmentButton = ({nft, nftReFetch, setRefreshPaused, originalOwner, pendingRequest, loadPendingRequest, variant}: ButtonInitialData) => {

    const { nftProtectContract, account, library, fee } = useAppContext()
    const { ipfs } = useIPFSContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [url, setUrl] = useState<string>()
    const subcourtID = KlerosCourts.General
    const numberOfVotes = 3
    const DISPUTE_PRICE = '0.03'

    const disputeId = pendingRequest?.disputeId

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        klerosForm,
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
            setNextStep(StepMapping.waitingForTransaction);
            nftProtectContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    loadPendingRequest()
                    // after mined fire wrap
                    setNextStep(StepMapping.caseSent)
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

    const klerosFormSubmit = (metaEvidence: any) => {
        uploadMetaEvidence(metaEvidence).then((result:any) => {
            setNextStep(StepMapping.evidenceReview)
            const dirHash = result.uploadResult.cid.toString()//toV1().toString()
            const dirUrl = getCentralizedUrl(dirHash)
            const fileIPFSUrl = getRelativeIpfsUrl(result.uploadResult.cid.toString(), result.fileName)
            console.log('MetaEvidence IPFS URL:', fileIPFSUrl)
            try {
                nftProtectContract.askOwnershipAdjustmentArbitrate(pendingRequest?.id, generateArbitratorExtraData(
                    subcourtID.toString(), numberOfVotes.toString()
                ), fileIPFSUrl, {value: parseEther(DISPUTE_PRICE)})
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
        })
    }

    const uploadMetaEvidence = async (metaEvidence: any) => {
        console.log('METAEVIDENCE', metaEvidence)
        const fileName = 'metaEvidence.json'
        if (ipfs) {
            const result = await ipfs.add(
                {
                    path: fileName,
                    content: JSON.stringify(metaEvidence)
                }, 
                {wrapWithDirectory: true}
            )
            return {
                fileName: fileName,
                uploadResult: result
            }
        } else {
            throw Error('IPFS client not configured!')
        }
    }

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder').then(() => alert('Copied!'))
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

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>Open dispute</Trans>
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
                        bgColor: 'accent.light',
                    }
                }}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        {t`The original NFT owner` + ' ' + (pendingRequest?.status == RequestStatus.Rejected ? t`refused` : t`unresponsive`)}
                                    </Text>
                                    {/* <Text id='originalOwnerAddressHolder' fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                        <CopyIcon onClick={ copyOriginalOwnerToClipboard } />
                                        { formatAddress(originalOwner, 4) }
                                    </Text> */}
                                </CardHeader>
                                <CardBody>

                                    { getNftImage() }

                                    <Text textStyle="paragraph" mb={{base: "10px"}} textAlign="center" letterSpacing="0.04em">
                                        { pendingRequest?.status == RequestStatus.Rejected ?
                                        t`Don't agree? Initiate a dispute in the Kleros decentralized court.` :
                                        t`Want to initiate a dispute in the Kleros decentralized court?` }
                                    </Text>
                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        {t`(Paid separately)`}
                                    </Text>
                                </CardBody>
                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%", sm: "50%"}} mb={{base: "20px"}}>
                                        <Button
                                            variant="dark-outline"
                                            onClick={ () => setNextStep(StepMapping.klerosForm) }
                                        ><Trans>Open dispute</Trans>
                                        </Button>
                                    </Box>
                                    <Box w={{base: "60%", sm: "50%"}}>
                                        <Button
                                            variant="dark-outline"
                                            onClick={onClose}
                                        ><Trans>Close</Trans>
                                        </Button>
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
                                defendant={originalOwner}
                                {...klerosCases.arbitrateOwnershipAdjustment}
                            />
                        </SwitchableOutside>

                        {/* evidenceReview */}
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

                        {/* payArbitrationFee */}
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

                        {/* Confirm transaction */}
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

                        {/* Waiting for transaction */}
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
                                            <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                            <Trans>If you{'\u0027'}ve missed including any evidences, you have up to 48 hours to add additional evidence to your dispute while the evidence collection phase is still ongoing via the provided link</Trans>
                                        </Text>
                                        
                                        <Link href='#' isExternal rel="noreferrer" textDecoration="underline" cursor="pointer">
                                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                                <Trans values={{disputeId}}>case {disputeId}</Trans>
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
                                        <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
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
                                        <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
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

export default ArbitrateOwnershipAdjustmentButton