import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../../dialogs/DidRequiredDialog';
// import { MultipleFilesUpload } from '../../MultipleFilesUpload'
import { useState } from 'react';
import {
    Button,
    Box,
    Flex,
    Image,
    Heading,
    Text,
    Spinner,
    Select,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    Textarea,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    UnorderedList,
    Tooltip,
    ListItem,
    OrderedList,
    Link,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle, Info } from '@web3uikit/icons'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { AuthErrorCode } from 'moralis/common-core';
import { NextComponentType } from 'next';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { useIPFSContext } from '../../../context/IPFSContextProvider';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract
}

const LostPNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress} = useAppContext()
    const { centalizeIpfsUrl } = useIPFSContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)
    const [lostReason, setLostReason ] = useState<string>()

    enum StepMapping {
        start,
        lostReason,
        openCaseInKleros,
        // requestConcrete,
        // requestAll,
        // requestWrap,
        // waitingForAllow,
        // waitingForFinal,
        // finalCompleted,
        // canceled,
        // error,
        // timeout
    }

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.start)
        onOpen()
    }

    function getNftImage() {
        let nftImage = <div />
        if (metadata) {
            const imgUrl = centalizeIpfsUrl(metadata?.image || '')
            nftImage = <Box
                            my={[4]}
                            border="2px solid rgba(255, 255, 255, 0.5)"
                            borderRadius={["20px"]}
                            overflow="hidden"
                            alignItems="center"
                            w="60%"
                        > 
                            <Image src={ imgUrl } />
                        </Box>
            }
        return nftImage
    }

    const handleLostReasonSelection = (selected: any) => {
        setLostReason(selected.target.value)
        setNextStep(StepMapping.lostReason)
    }

    const openCaseInKleros = () => {
        setNextStep(StepMapping.openCaseInKleros)
    }
    

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant="primary-solid"
            w="100%"
        >Lost pNFT
        </Button>

        <DidRequiredDialog disclosure={didDialogDisclosure}/>
        <Modal
            isCentered
            isOpen={isOpen}
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
            }}
        >
            <ModalOverlay 
                bg='blackAlpha.700'
            />
            <ModalContent
                my="0"
                w={["90%", "32rem", "42rem"]}
                maxW="100%"
                bg="#FFF"
                border="2px solid #000"
                borderRadius="30px"
                maxH="90%"
                overflowY={{base: 'scroll', md: 'hidden'}}
            >
                <ModalBody px="0" py={[8]}>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[4, 8, 12]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >Have you lost<br /> access to your pNFT?
                                </Heading>

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    {"Targeted by an intruder or made a mistake and lost access to your pNFT, don't worry. We can work together to recover your asset and restore it to your wallet."}
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[4]} textAlign="center" fontWeight="600">
                                    Select reason for losing pNFT
                                </Text>
                                
                                <Select
                                    onChange={handleLostReasonSelection}
                                    placeholder='Reason'
                                    color="#000"
                                    bgColor="#2D7BD6"
                                    w="100%"
                                    mb={[8]}
                                    _hover={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value='Phishing attack'>Phishing Attack</option>
                                    <option value='Protocol breach'>Protocol Breach</option>
                                    <option value='Sending to an incorrect address'>Sending to an incorrect address</option>
                                </Select>

                                <Flex flexWrap="nowrap" alignItems="center" border="2px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]} mb={[8]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <Info />
                                    </Box>
                                    <Flex flexDirection="column">
                                        <Text fontSize={["sm", "md", "lg"]}>
                                            {"If you're unsure of the reason for losing your asset, please select 'Phishing' as the most likely cause"}
                                        </Text>
                                    </Flex>
                                </Flex>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >Close
                                </Button>
                            </Flex>
                        </SwitchableOutside> 

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" px={[4, 8, 12]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    textAlign="center"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="8"
                                > { lostReason }
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                    <Trans>{"If you've lost access to your pNFT, you should try attempting to resolve the issue with the current owner of the pNFT before resorting to legal action. You can try to find the owner through social media or use services like Blockscan Chat or Hashmail to communicate with them."}</Trans>
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center">
                                   <Trans>{"Keep screenshots of all conversations as evidence if you need to submit a case to Kleros. It's important to note that your case may not be considered if you don&apos;t have evidence of an attempt to resolve the issue outside of court."}</Trans>
                                </Text>

                                <Flex flexDirection="row" flexWrap={{base: "wrap", sm: "nowrap"}} justifyContent="space-between" mb={[8]}>
                                    <Button 
                                        onClick={onClose}
                                        variant="monochrome-transparent"
                                        m={[4]}
                                        w="100%"
                                    ><Trans>Close</Trans>
                                    </Button>
                                    <Button 
                                        variant="monochrome-transparent"
                                        m={[4]}
                                        w="100%"
                                        onClick={openCaseInKleros}
                                    ><Trans>Open case in Kleros</Trans>
                                    </Button>
                                </Flex>

                                <Flex flexWrap="nowrap" alignItems="center" border="2px solid #2D7BD6" borderRadius={["20px"]} p={[2, 4]} mb={[8]}>
                                    <Box color="#2D7BD6" mr={[2, 4]} fontSize={['30px', '50px']}>
                                        <Info />
                                    </Box>
                                    <Flex flexDirection="column">
                                        <Text fontSize={["sm", "md", "lg"]}>
                                        <Trans>Kleros is an open source online dispute resolution protocol that uses blockchain and crowdsourcing 
                                            to resolve disputes fairly.</Trans> <Link href='https://kleros.io/' isExternal rel="noreferrer" color="#2D7BD6"><Trans>To learn more</Trans><ExternalLinkIcon mx='2px' /></Link>
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>

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
                                    <Trans>Open case in Kleros</Trans>
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
                                
                                <Text fontSize={["sm", "md"]} mb={[2]}>
                                    <Trans>Upload all available evidence:</Trans>
                                </Text>
                                <OrderedList fontSize={["sm", "md"]} mb={[8]}>
                                    <ListItem>
                                        <Trans>Evidence of attempts to solve the problem on your own</Trans>
                                        <Tooltip label={t`Details`} bg="none" color="#1A202C">
                                        <Flex
                                            justifyContent="center"
                                            alignItems="center"
                                            w="2em"
                                            h="2em"
                                            p={[1]}
                                            borderRadius="1em"
                                            bgColor="gray.200"
                                            cursor="pointer"
                                            // _hover={{
                                            //     bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                            //     color: "#FFF"
                                            // }}
                                        >
                                            <Info color="#2D7BD6" fontSize='30px' />
                                        </Flex>
                                    </Tooltip>
                                        
                                    </ListItem>
                                    <ListItem>
                                        <Trans>Other Evidence including chat logs or emails, screen recordings, law enforcement reports or any other information that may be relevant to the case, such as information about the platform where the theft occurred or any security breaches that may have led to the theft.</Trans>
                                    </ListItem>
                                </OrderedList>

                                {/* <MultipleFilesUpload /> */}

                                <Flex flexWrap="nowrap" alignItems="center" mt={[4]} mb={[8]}>
                                    <Box color="#2D7BD6" mr={[2]}>
                                        <Info fontSize='20px' />
                                    </Box>
                                    <Text fontSize={["sm", "md"]}>
                                        <Trans>You can add an external file in PDF or add multiple files in a single .zip file.</Trans>
                                    </Text>
                                </Flex>
                                <Flex flexDirection="column" alignItems="center">
                                    <Button 
                                        variant="monochrome-transparent"
                                        m={[4]}
                                        w="50%"
                                        textTransform="uppercase"
                                    >
                                        <Trans>Open dispute</Trans>
                                    </Button>
                                    <Button 
                                        onClick={onClose}
                                        variant="monochrome-transparent"
                                        m={[4]}
                                        textTransform="uppercase"
                                        w="50%"
                                    >Close
                                    </Button>
                                </Flex>
                            </Flex>
                        </SwitchableOutside>

                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default LostPNFTButton