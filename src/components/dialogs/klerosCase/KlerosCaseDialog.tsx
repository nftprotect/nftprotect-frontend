import { dialogsTimeout } from '../../../utils/config'
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../DidRequiredDialog';
import { useState, useEffect } from 'react';
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
import { formatEther } from "@ethersproject/units";
import NFT from '../../../classes/NFT';
// import { StepsTheme as Steps } from 'chakra-ui-steps';
import { Step, Steps, useSteps } from "chakra-ui-steps";
import StepLabel from './step/StepLabel';
import StepContent from './step/StepContent';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import { metaEvidenceTypes } from '../../../utils/metaEvidence';
import IPFSUpload from '../../../classes/IPFSUpload';

export interface KlerosCaseInitialData {
    nft: NFT,
    metaEvidenceId: number,
    claimantAddress: string,
    defendantAddress: string,
    contractAddress?: string,
    caseDescription: string,
    evidences?: IPFSUpload[]
}

const KlerosCaseDialog = () => {

    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { nextStep, prevStep, reset, activeStep, setStep} = useSteps({
        initialStep: 0,
    });
    const { setDialog } = useCallableDialogContext()
    const [ caseData, setCaseData ] = useState<KlerosCaseInitialData>()
    const { nft, metaEvidenceId } = caseData || {}
    const pageData = metaEvidenceId && metaEvidenceTypes.find((item) => item.value === metaEvidenceId.toString() )?.page

    // Step content mapping
    // Label refers to name of the step and displayed on steps bar
    // description is displayed under label. 
    // TODO replace descriptions with counters!!!
    const steps = [
        { key: "Evidence period", label: <StepLabel labelKey={t`Evidence period`} />, description:"1d 06h 09m", content: pageData && caseData && <StepContent stepKey={"Evidence period"} {...caseData} pageData={pageData}/> },
        { key: "Voting period", label: <StepLabel labelKey={t`Voting period`} />, description:"3d 18h 00m", content: pageData && caseData && <StepContent stepKey="Voting period" {...caseData} pageData={pageData}/> },
        { key: "Apealing period", label: <StepLabel labelKey={t`Apealing period`} />, description:"3d 12h 00m", content: pageData && caseData && <StepContent stepKey={"Apealing period"} {...caseData} pageData={pageData}/> },
        { key: "Decision period", label: <StepLabel labelKey={t`Decision period`} />, content: pageData && caseData && <StepContent stepKey={"Decision period"}{...caseData} pageData={pageData}/> }
    ];

    useEffect(() => {
        setDialog('KlerosCaseDialog', {...disclosure, setCaseData})
    }, [])

    return (<>{
        pageData && <>
            <Modal
                variant="stepModal"
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
            >
                <ModalOverlay />
                <ModalContent
                    borderRadius="0"
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
                    <ModalBody mx={{base: "220px"}}>
                        <Flex flexDir="column" width="100%">
                            <Steps
                                borderBottom="2px solid #ADADAD"
                                variant={"circles"} 
                                colorScheme="#1316DD"
                                activeStep={activeStep}
                                onClickStep={(i) => {
                                    setStep(i);
                                }}
                                py="30px"
                                sx={{
                                    "& .cui-steps__step-icon-container": {
                                        w: "26px",
                                        h: "26px",
                                        // bg: "#1316DD", 
                                        // {activeStep === 0}
                                    },
                                    ".cui-steps__step-icon-container span": {
                                        fontFamily: "Open Sans",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        lineHeight: "19px",
                                        color: "#FFF"
                                    },
                                    "& .cui-steps__horizontal-step": {
                                        color: "#FFF",
                                        "::after": {
                                            height: "1px",
                                            bg: "#ADADAD"
                                        }
                                    },

                                }}
                            >
                                
                                {steps.map(({ key, label, description, content }) => (
                                    <Step 
                                        key={key}
                                        label={label} 
                                        description={description}
                                    >
                                        {content}
                                    </Step>
                                ))}
                            </Steps>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    }</>)
}

export default KlerosCaseDialog