import { dialogsTimeout } from '../../../utils/config' 
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
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { RequestStatus, ActionRequest } from '../../../classes/NFT';
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
import { useArbitrableProxy } from '../../../hooks/useArbitrableProxy';

const AddEvidencesDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const { nftProtectContract, account, library, fee, currentBlock, currentChain } = useAppContext()
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
    const { submitEvidence } = useArbitrableProxy()
    const subcourtID = KlerosCourts.General
    const numberOfVotes = 3
    const DISPUTE_PRICE = '0.03'
    const metaEvidenceId = 3

    const disputeId = nft?.pendingRequest?.externalDisputeId

    // Naming of wizard step numbers
    enum StepMapping {
        evidenceForm,
        evidenceDescribeFiles,
        confirmTransaction,
        waitingForTransaction,
        evidenceSubmitted,
        canceled,
        error,
        timeout
    }

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(StepMapping.error)
        setTimeout(dialogClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
        setTimeout(dialogClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(dialogClose, dialogsTimeout)
    }

    const finalTransactionSent = () => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForTransaction);
            nftProtectContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    nft && nft.loadPendingRequest()
                    // after mined fire wrap
                    setNextStep(StepMapping.evidenceSubmitted)
                    console.log("Transaction successful", tx.hash);
                    setTimeout(dialogClose, dialogsTimeout)
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
    }

    const submitPreparedEvidence = () => {
        setNextStep(StepMapping.confirmTransaction)
        if (evidence) {
            const evidenceJSONUrl = evidence.getRelativeIPFSUrl()
            try {
                nft?.pendingRequest && 
                    submitEvidence(currentChain.defaultArbitrator, nft.pendingRequest.localDisputeId, evidenceJSONUrl)
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

    const dialogClose = () => {
        setNextStep(StepMapping.evidenceForm)
        onClose()
        setEvidenceFiles(undefined)
        setEvidenceData(undefined)
        setEvidence(undefined)
    }

    // Check request timeout on every block
    useEffect(() => {
        if (nft?.pendingRequest && (nft.pendingRequest.status === RequestStatus.Initial) && !requestTimedOut) {
            library.getBlock(currentBlock).then((blockData: any) => {
                if (nft?.pendingRequest && (blockData.timestamp >= nft.pendingRequest.timeout)) {
                    setRequestTimedOut(true)
                }
            })
        }
    }, [currentBlock])

    useEffect(() => {
        evidence && submitPreparedEvidence()
    }, [evidenceData, evidence])

    useEffect(() => {
        setDialog('AddEvidencesDialog', {...disclosure, setNft})
    }, [])



    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={dialogClose}
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
                        {/* Kleros form */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <KlerosCaseForm
                                onClose={onClose}
                                onSubmit={klerosFormSubmit}
                                claimant={''}
                                defendant={''}
                                header={t`Submit new evidence`}
                                buttonText={t`Submit`}
                                requireProtocolAddress={false}
                            >
                                <Flex mb={{base: "20px"}} flexDirection="column" textStyle="paragraph" >
                                    <Text mb={{base: "8px"}}>
                                        <Trans>Upload all available evidence:</Trans>
                                    </Text>
                                    <Text>
                                        <Trans>The more detail you provide, including text, images, or other documentation, the better the review.</Trans>
                                    </Text>
                                </Flex>
                            </KlerosCaseForm>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            {evidenceFiles && <KlerosEvidencesForm
                                goBack={() => setNextStep(StepMapping.evidenceForm)}
                                onSubmit={ klerosEvidenceFormSubmit }
                                header={t`Submit new evidence`}
                                buttonText={t`Submit`}
                                ipfsUpload={ evidenceFiles }
                                evidenceData={{
                                    name: `Additional evidence`,
                                    description: evidenceData.description,
                                    evidenceSide: 0, // does nothing
                                }}
                            />}
                        </SwitchableOutside>

                        {/* Confirm transaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Submit new evidence</Trans>
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
                                        <Trans>Submit new evidence</Trans>
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

                        {/* Evidence submitted successfully */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "360px"}}>
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Submit new evidence</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody>
                                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                            <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>The new evidence submitted succesfully.</Trans>
                                        </Text>
                                        <Text textStyle="paragraph" textAlign="center">
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

export default AddEvidencesDialog