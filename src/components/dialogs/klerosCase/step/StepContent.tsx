import {
    chakra,
    Box,
    Flex,
    Text,
    Textarea,
    Link,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    Image,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Button,
    IconButton,
} from '@chakra-ui/react'
import { HelpCircle, ExternalLink, Calendar, User, Info } from '@web3uikit/icons'
import { ExternalLinkIcon, ArrowDownIcon, MinusIcon, AddIcon } from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import NFT from '../../../../classes/NFT';
import { KlerosCaseInitialData } from '../KlerosCaseDialog';

interface StepContentInitialData extends KlerosCaseInitialData {
    stepKey?: string,
    nft: NFT,
    pageData: PageData
}

interface PageData {
    title: string,
    summary: string,
    policyURL: string,
    claimantText: string,
    claimantText2?: string,
    claimantTooltip: string,
    defendantText: string,
    defendantTooltip: string
}

const StepContent = ({
    stepKey,
    nft, 
    pageData, 
    claimantAddress, 
    defendantAddress, 
    contractAddress,
    caseDescription,
    evidences
}: StepContentInitialData) => {

    function getNftImage() {
        return <Flex
            overflow="hidden"
            justifyContent="center"
            h="150px"
            w="150px"
        >
            <Image 
                src={ nft.thumbnail }
                alt={ nft.title || t`NFT image`}
            />
        </Flex>
    }

    return(
        <Flex flexDirection="column" flexWrap="nowrap" mt={{base: "30px"}}>
            <Text fontSize="30px" lineHeight="38px" fontWeight="600" color="#333333">
                { pageData.title }
            </Text>

            <Flex mt={{base: "5px"}} mb={{base: "30px"}}>
                <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textStyle="h3" textDecoration="underline" textTransform="capitalize">
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>Dispute policy</Trans>
                        </Text>
                        <ExternalLink fontSize="22px" href={pageData.policyURL}/>
                    </Flex>
                </Link>
                <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textStyle="h3" textDecoration="underline">
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>{"Open court's page in Kleros"}</Trans>
                        </Text>
                        <ExternalLink fontSize="22px" />
                    </Flex>
                </Link>
            </Flex>

            <Flex mb={{base: "30px"}}>
                <FormControl w={{base: "186px"}} mr={{base: "30px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Dispute</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement py={{base: "14px"}} pointerEvents='none'>
                            {"#"}
                        </InputLeftElement>
                        <Input value="1369" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>

                <FormControl w={{base: "210px"}} mr={{base: "30px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Date of creation</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement py={{base: "14px"}} pointerEvents='none'>
                            <Calendar fontSize="18px" />
                        </InputLeftElement>
                        <Input value="24/05/2022" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>

                <FormControl w={{base: "126px"}} mr={{base: "30px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Jurors</Trans>
                    </FormLabel>
                    <InputGroup>
                        <InputLeftElement  py={{base: "14px"}} pointerEvents='none'>
                            <User fontSize="18px" />
                        </InputLeftElement>
                        <Input value="3" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>

                <FormControl w={{base: "186px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Court</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement py={{base: "14px"}} pointerEvents='none'>
                            <Image src="./images/lawBalance.svg" alt="Law balance icon" w="16px" h="16px" />
                        </InputLeftElement>
                        <Input value="Non technical" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>
            </Flex>
            
            {/* Visible only on step 3 "Apealing period" and step 4 "Decision period" */}
            <Flex alignItems="center" justifyContent="space-between" px={{base: "22px"}} py={{base: "20px"}} border="1px solid #2D7BD6" borderRadius={{base: "16px"}} mb={{base: "30px"}}>
                <Flex>
                    <Box mr={{base: "20px"}}>
                        <Info fontSize="24px" color="#009AFF" />
                    </Box>
                    
                    <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                        <Trans>Winner{":"}</Trans>
                        {" "}the Claimant
                    </Text>
                </Flex>

                {/* Visible only on step 3 "Apealing period" */}
                <Flex w={{base: "200px"}}>
                    <Button variant="primary-solid">File an appeal</Button>
                </Flex>
                
            </Flex>

            <Flex bgColor="#F8F8F8" p={{base: "18px"}} alignItems="flex-start" mb={{base: "30px"}}>
                { getNftImage() }
                <Flex flexDirection="column" ml={{base: "18px"}} >
                    <Text fontSize={{base: "18px"}}>
                        <chakra.span fontWeight="600"><Trans>The Subject of the Dispute{":"}</Trans></chakra.span>
                        {" "}
                        <Trans>Original NFT</Trans>
                    </Text>
                    <Text textStyle="paragraph">
                    <chakra.span fontWeight="600"><Trans>Сollection{":"}</Trans></chakra.span>
                        {" "}
                        { nft?.contract?.name}
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Name{":"}</Trans></chakra.span>
                        {" "}
                        { nft.title}
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Creator{":"}</Trans></chakra.span>
                        {" "}
                        { nft.contract.contractDeployer }
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Original NFT creation date{":"}</Trans></chakra.span>
                        {" "}
                        21.04.2021
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Original NFT protection date{":"}</Trans></chakra.span>
                        {" "}
                        17.05.2023
                    </Text>
                </Flex>
            </Flex>

            <Flex w="100%" mb={{base: "36px"}}>
                <Flex flexDirection="column" borderRight="2px solid #ADADAD" w="50%" pr={{base: "10px"}}>
                    <Flex alignItems="center" mb={{base: "10px"}}>
                        <Text fontSize="18px" fontWeight="700" textTransform="capitalize">
                            <Trans>The claimant</Trans>
                        </Text>
                        <Popover placement="right">
                            <PopoverTrigger>
                                <Box cursor="pointer" color="#2D7BD6" ml={[2]}>
                                    <HelpCircle fontSize='20px' />
                                </Box>
                            </PopoverTrigger>
                            <PopoverContent w={{base: "280px"}} color="#FFF" bgColor="#030303" textStyle="paragraph" textAlign="left">
                                <PopoverArrow bgColor="#030303"/>
                                <PopoverBody  borderRadius="16px" color="#FFF" px={{base: "10px"}} py={{base: "10px"}} >
                                    { pageData.claimantTooltip }
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </Flex>

                    <Text fontWeight="600" textStyle="paragraph">
                        <Trans>Wallet{":"}</Trans>
                        {' '}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline"ml={{base: "5px"}}>
                            <chakra.span wordBreak="break-all">
                                { claimantAddress }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph" >
                        <Trans>DID{":"}</Trans>
                        <chakra.span bgColor="rgba(138, 255, 147, 0.5)" borderRadius="3px" fontSize={{base: "12px"}} lineHeight={{base: "15px"}} fontWeight="500" ml={{base: "5px"}} px={{base: "6px"}} py={{base: "2px"}}>
                            <Trans>Gitcoin passport{":"}{" "}70%</Trans>
                        </chakra.span>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph">
                        <Trans>Original{":"}</Trans>
                        {" "}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline">
                            <chakra.span wordBreak="break-all">
                                {nft.originalData?.contractAddress} (id: {nft.originalData?.tokenId})
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph">
                        { pageData.claimantText }
                        {" "}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline">
                            <chakra.span wordBreak="break-all">
                                0xbabd69e432388644...60c9bf6e743aed40505055
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    { pageData.claimantText2 && 
                        <Text fontWeight="600" textStyle="paragraph">
                            { pageData.claimantText2 }
                            {" "}
                            <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline">
                                <chakra.span wordBreak="break-all">
                                    0xbabd69e432388644...60c9bf6e743aed40505055
                                </chakra.span>
                                <ExternalLinkIcon mx='5px' />
                            </Link>
                        </Text> 
                    }
                </Flex>

                <Flex flexDirection="column" w="50%" pl={{base: "10px"}} >
                    <Flex  alignItems="center" mb={{base: "10px"}}>
                        <Text fontSize="18px" fontWeight="700" textTransform="capitalize">
                            <Trans>The defendant</Trans>
                        </Text>
                        <Popover placement="right">
                            <PopoverTrigger>
                                <Box cursor="pointer" color="#2D7BD6" ml={[2]}>
                                    <HelpCircle fontSize='20px' />
                                </Box>
                            </PopoverTrigger>
                            <PopoverContent w={{base: "280px"}} color="#FFF" bgColor="#030303" textStyle="paragraph" textAlign="left">
                                <PopoverArrow bgColor="#030303"/>
                                <PopoverBody borderRadius="16px" color="#FFF" px={{base: "10px"}} py={{base: "10px"}} >
                                    { pageData.defendantTooltip }
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </Flex>

                    <Text fontWeight="600" fontSize={{base: "14px"}}>
                        {
                            contractAddress ? 
                                <Trans>{"Smart contract:"}</Trans> :
                                <Trans>{"Wallet:"}</Trans>
                        }
                        {' '}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline" ml={{base: "5px"}}>
                            <chakra.span wordBreak="break-all">
                                { contractAddress || defendantAddress }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    {/* Visible only if defendant is not a smart contract */}
                    { !contractAddress && 
                        <Text textStyle="paragraph" fontWeight="600">
                            <Trans>DID{":"}</Trans>
                            <chakra.span bgColor="rgba(246, 12, 54, 0.12)" borderRadius="3px" fontSize={{base: "12px"}} lineHeight={{base: "15px"}} fontWeight="500" ml={{base: "5px"}} px={{base: "6px"}} py={{base: "2px"}}>
                                <Trans>None</Trans>
                            </chakra.span>
                        </Text>
                    }

                    <Text fontWeight="600" textStyle="paragraph">
                        <Trans>pNFT{":"}</Trans>
                        {" "}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline">
                            <chakra.span wordBreak="break-all">
                                { nft.contract.address } (id: { nft.tokenId })
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph">
                        { pageData.defendantText }
                        {" "}
                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline">
                            <chakra.span wordBreak="break-all">
                                0xbabd69e432388644...60c9bf6e743aed40505055
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>
                </Flex>
            </Flex>

            <Flex flexDirection="column" mb={{base: "35px"}}>
                <Text fontWeight="700" fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                    { pageData.summary }
                </Text>

                <Text fontWeight="400" textStyle="paragraph" mb={{base: "15px"}}>
                    <Trans>This is how he described the situation:</Trans>
                </Text>

                <Textarea value={ caseDescription } py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&::focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} fontSize={{base: "14px"}} />
            </Flex>

            {evidences && evidences.length > 0 &&
                <Accordion allowToggle mb={{base: "30px"}}>
                    <AccordionItem>
                        {({ isExpanded }) => (
                            <>
                                <AccordionButton pl={{base: "30px"}} color="#FFF" bgColor="#2D7BD6" fontWeight="600" fontSize={{base: "16px"}} lineHeight={{base: "22px"}} _hover={{bgColor: "#2D7BD6"}}>
                                    <Box as="span" flex='1' textAlign='left'>
                                        <Trans>Evidence</Trans>
                                    </Box>
                                    {isExpanded ? ( <MinusIcon fontSize='16px' /> ) : ( <AddIcon fontSize='16px' /> )}
                                </AccordionButton>

                                <AccordionPanel px={{base: "32px"}} py={{base: "32px"}} border="1px solid #ADADAD">
                                    <Flex alignItems="center" justifyContent="space-between" mb={{base: "35px"}}>
                                        <Flex alignItems="center" flexDirection="row" color="#ADADAD" textStyle="paragraph">
                                            <Text>
                                                <Trans>Sort by{": "} date</Trans>
                                            </Text>

                                            <IconButton aria-label='Sort' icon={<ArrowDownIcon />} w={{base: "20px"}} bg="none" p="0" m="0" _hover={{bg: "none"}}/>
                                        </Flex>

                                        {/* Visible only on step 1 "Evidence period" */}
                                        <Button variant="primary-solid" w={{base: "200px"}}>Submit new evidence</Button>
                                    </Flex>

                                    <Flex flexDirection="column" border="1px solid #E5E5E5" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)"  >
                                        <Text fontWeight="600" textStyle="paragraph" px={{base: "24px"}} pt={{base: "24px"}} pb={{base: "14px"}}>
                                            {"#"}1 Evidence of a phishing atack
                                        </Text>
                                        <Flex flexDirection="column" bgColor="#F8F8F8" px={{base: "24px"}} pt={{base: "11px"}} pb={{base: "14px"}}>
                                            <Text textStyle="paragraph">
                                                <Trans>
                                                    Submitted by the 0x12...3456
                                                </Trans>
                                            </Text>
                                            <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
                                                <Text color="#818181" fontSize={{base: "12px"}} lineHeight={{base: "18px"}}>
                                                    Jan 09, 2020 05:00 GMT
                                                </Text>
                                                
                                                <Text textStyle="paragraph" color="#2D7BD6">
                                                    <Trans>File link</Trans>
                                                    <Link href='#' isExternal rel="noreferrer" color="#2D7BD6">
                                                        <ExternalLinkIcon mb="3px" mx='5px' fontSize="16px" lineHeight={{base: "18px"}}/>
                                                    </Link>
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </AccordionPanel>
                            </>
                        )}
                    </AccordionItem>
                </Accordion>
            }
        </Flex>
    )
}

export default StepContent