import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Contract } from "@ethersproject/contracts";
import { useState } from 'react';
import {
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
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Spinner,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { centralizeIpfsUrl } from '../../../utils/ipfs';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { CopyIcon, ArrowForwardIcon} from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import CancelledStepContent from './steps/CancelledStepContent'
import TimeoutStepContent from './steps/TimeoutStepContent'
import ErrorStepContent from './steps/ErrorStepContent'
import ReleaseOriginalNFTButton from './ReleaseOriginalNFTButton'
import LostPNFTButton from './LostPNFTButton';
import { ActionRequest } from '../NFTCard';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    tokenContract: Contract,
    pendingRequest: any | undefined,
    variant: any
}

const DoNotTransferOriginal = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract, originalOwner, variant, pendingRequest}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()

    enum StepMapping {
        confirmTransaction,
        waitForTransactionConfirmation,
        finalCompleted,
        canceled,
        error,
        timeout
    }

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.confirmTransaction)
        onOpen()
        setRefreshPaused(true)
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

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>Do not transfer original</Trans>
        </Button>

        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={() => {
                setNextStep(StepMapping.confirmTransaction)
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
                        {/* confirmTransaction */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Transfer the <br/>original NFT to <br/> the new owner</Trans>{"?"}
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
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Transfer the <br/>original NFT to <br/> the new owner</Trans>{"?"}
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
                                            <Trans>The original NFT <br/> remains in your <br/> wallet</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody mb={{base: "20px"}}>
                                        { getNftImage() }
                                        <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center">
                                            <Trans>
                                                The pNFT is at user 1234...1234
                                            </Trans>
                                        </Text>
                                        <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="danger" borderRadius="16px" bgColor="rgba(255, 96, 96, 0.2)">
                                            <Box color="danger" mr={[2]} >
                                                <Info fontSize='32px' />
                                            </Box>
                                            <Flex flexDirection="column">
                                                <Text textStyle="paragraph">
                                                    <Trans>This is a controversial issue, we recommend that you either transfer the original nft or burn the pNFT</Trans>
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </CardBody>

                                    <CardFooter>
                                        <Flex 
                                            flexWrap={{base: "wrap", sm: "nowrap"}}
                                            alignSelf="flex-start"
                                            justifyContent="space-around"
                                            w="100%"
                                            mb={{base: "20px"}}
                                        >
                                            <Box w={{base: "100%", sm: "45%"}}>
                                                <ReleaseOriginalNFTButton 
                                                    nft={ nft } 
                                                    metadata={ metadata } 
                                                    nftReFetch={ nftReFetch }
                                                    setRefreshPaused = { setRefreshPaused }
                                                    tokenContract={ tokenContract }
                                                    pendingRequest={ pendingRequest?.id }
                                                    variant={"dark-outline"}
                                                />
                                            </Box>
                                            <Box w={{base: "100%", sm: "45%"}}>
                                                <LostPNFTButton 
                                                    nft={ nft } 
                                                    metadata={ metadata } 
                                                    nftReFetch={ nftReFetch }
                                                    setRefreshPaused = { setRefreshPaused }
                                                    tokenContract={ tokenContract }
                                                    originalOwner={originalOwner}
                                                    variant={"dark-outline"}
                                                    />
                                            </Box>
                                        </Flex>
                                </CardFooter>
                                </Flex>
                            </Card>
                        </SwitchableOutside>

                        {/* Canceled */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <CancelledStepContent />
                        </SwitchableOutside>

                        {/* Error */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <ErrorStepContent />
                        </SwitchableOutside>

                        {/* Timeout */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <TimeoutStepContent />
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default DoNotTransferOriginal