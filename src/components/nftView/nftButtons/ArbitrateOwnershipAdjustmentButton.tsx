import { EvmNft } from '@moralisweb3/common-evm-utils';
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
    ModalHeader,
    Spinner,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Container,
    Badge,
    Progress,
    List,
    ListItem,
    ListIcon,
    Input,
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
import { Form, Field, Formik } from 'formik'
import KlerosCaseForm from './steps/KlerosCaseForm';
import { useIPFSContext } from '../../../context/IPFSContextProvider';
import { t } from '@lingui/macro';
import { parseEther } from '@ethersproject/units';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function // Function to pause/unpause nft list updating
    pendingRequest: ActionRequest,
    originalOwner: string, // Owner address of original NFT,
    loadPendingRequest: Function, // Function to reload a pending request
}

const ArbitrateOwnershipAdjustmentButton = ({nft, metadata, nftReFetch, setRefreshPaused, originalOwner, pendingRequest, loadPendingRequest}: ButtonInitialData) => {

    const { nftProtectContract, account, library } = useAppContext()
    const { ipfs, getCentralizedUrl, getIpfsUrl, centralizeIpfsUrl } = useIPFSContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [url, setUrl] = useState<string>()
    const subcourtID = KlerosCourts.General
    const numberOfVotes = 3
    const DISPUTE_PRICE = '0.03'

    const disputeId = pendingRequest.disputeId

    // Naming of wizard step numbers
    enum StepMapping {
        start,
        klerosInfo,
        klerosForm,
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
            setNextStep(StepMapping.confirmTransaction)
            const dirHash = result.uploadResult.cid.toString()//toV1().toString()
            const dirUrl = getCentralizedUrl(dirHash)
            const fileIPFSUrl = getIpfsUrl(result.uploadResult.cid.toString(), result.fileName)
            console.log('MetaEvidence IPFS URL:', fileIPFSUrl)
            try {
                nftProtectContract.askOwnershipAdjustmentArbitrate(pendingRequest.id, generateArbitratorExtraData(
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
    }

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder').then(() => alert('Copied!'))
    }

    function getNftImage() {
        if (metadata) {
            let imgUrl = centralizeIpfsUrl(metadata.image)
            return <Flex
                        border="2px solid rgba(255, 255, 255, 0.5)"
                        borderRadius={["16px"]}
                        overflow="hidden"
                        my={{base: "1.25rem"}}
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
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant="primary-solid"
            w="100%"
        >
            <Trans>Open dispute</Trans>
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
                <ModalHeader textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700"><Trans>Open case in Kleros</Trans></ModalHeader>
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    {t`Original NFT owner ` + (pendingRequest.status == RequestStatus.Rejected ? t`refused` : t`unresponsive`)}
                                </Text>
                                <Text id='originalOwnerAddressHolder' fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    { formatAddress(originalOwner, 4) }
                                    <CopyIcon onClick={ copyOriginalOwnerToClipboard } />
                                </Text>

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    { pendingRequest.status == RequestStatus.Rejected ?
                                        t`Don't agree? Initiate a dispute in the Kleros decentralized court.` :
                                        t`Want to initiate a dispute in the Kleros decentralized court?` }
                                    <br></br>
                                    {t`(Paid separately)`}
                                </Text>
                                <Box w="100%">
                                    <Button 
                                        onClick={ () => setNextStep(StepMapping.klerosInfo) }
                                        variant="dark-outline"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans>Initiate a dispute</Trans>
                                    </Button>
                                </Box>
                                <Button 
                                    onClick={onClose}
                                    variant="light-outline"
                                    w="100%"
                                    mt={[4, 8]}
                                >
                                    <Trans>Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside>
                        {/* Kleros info */}
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
                                        onClick={ () => setNextStep(StepMapping.klerosForm) }
                                        variant="dark-outline"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans>Initiate a dispute</Trans>
                                    </Button>
                                </Box>
                                <Button 
                                    onClick={onClose}
                                    variant="light-outline"
                                    w="100%"
                                    mt={[4, 8]}
                                >
                                    <Trans>Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside>
                        {/* Kleros form */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <KlerosCaseForm
                                    onClose={onClose}
                                    onSubmit={klerosFormSubmit}
                                    claimant={account || ''}
                                    defendant={originalOwner}
                                    {...klerosCases.arbitrateOwnershipAdjustment}
                                />
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
                        {/* Waiting for transaction */}
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
                        {/* Case sent to Kleros */}
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
                                    <Trans values={{disputeId}}>case {disputeId}</Trans>
                                </Text>
                                <Text fontSize={["md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    <Trans>Follow the status of the case through our app or at the Kleros website.</Trans>
                                </Text>
                                <Box w="50%" my={[8]}>
                                    <Button
                                        onClick={onClose}
                                        variant="light-outline"
                                        w="100%"
                                    >
                                        <Trans>Close</Trans>
                                    </Button>
                                </Box>
                            </Flex>
                        </SwitchableOutside>
                        {/* Transaction canceled */}
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
                        {/* Error occured */}
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
                        {/* Transaction timeout */}
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

export default ArbitrateOwnershipAdjustmentButton