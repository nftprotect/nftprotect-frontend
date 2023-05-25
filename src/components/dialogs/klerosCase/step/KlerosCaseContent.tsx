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
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useState } from 'react';
import { useAlchemy } from '../../../../hooks/useAlchemy';
import { GetTransfersForOwnerTransferType } from 'alchemy-sdk';
import { generateTxURL, generateAddressURL, generateTokenURL } from '../../../../utils/etherscan';
import { formatAddress } from '../../../../utils/helpers';
import { createDisputeLink } from '../../../../utils/kleros';
import KlerosCaseLabel from './KlerosCaseLabel';
import { Step, Steps, useSteps } from "chakra-ui-steps";
import IPFSUpload from '../../../../classes/IPFSUpload';
import { useAppContext } from '../../../../context/AppContextProvider';
import NFTImage from '../../../nftView/NFTImage';

export interface KlerosCaseInitialData {
    nft: NFT,
    metaEvidenceId: number,
    claimantAddress: string,
    defendantAddress: string,
    contractAddress?: string,
    caseDescription: string,
    evidences?: IPFSUpload[]
}

interface StepContentInitialData extends KlerosCaseInitialData {
    stepKey?: string,
    pageData: PageData,
    disputeData?: DisputeData
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

interface DisputeData {
    disputeId: BigNumber,
    dateCreated?: Date
}

const KlerosCaseContent = ({
    stepKey,
    nft, 
    pageData, 
    claimantAddress, 
    defendantAddress, 
    contractAddress,
    caseDescription,
    evidences,
    disputeData
}: StepContentInitialData) => {

    // Step content mapping
    // Label refers to name of the step and displayed on steps bar
    // description is displayed under label. 
    // TODO replace descriptions with counters!!!
    const steps = [
        { 
            key: "Evidence period", 
            description:"1d 06h 09m"
        }, { 
            key: "Voting period", 
            description:"3d 18h 00m"
        }, { 
            key: "Apealing period", 
            description:"3d 12h 00m"
        }, { 
            key: "Decision period",
        }
    ];

    const { getTransfersForContract, getTransfersForOwner } = useAlchemy()

    // Holds TX hash for pNFT minting transaction
    const [ mintTx, setMintTx ] = useState<string>()
    // Holds TX date for pNFT minting transaction
    const [ mintDate, setMintDate ] = useState<Date>()
    // Holds TX hash for original NFT minting transaction
    const [ mintOriginalTx, setMintOriginalTx ] = useState<string>()
    // Holds TX date for original NFT minting transaction
    const [ mintOriginalDate, setMintOriginalDate ] = useState<Date>()
    // Holds TX hash for acquiring pNFT by current owner
    const [ acquireTx, setAcquireTx ] = useState<string>()
    // Holds TX hash for acquiring pNFT by current owner
    const [ sentToProtocolTx, setSentToProtocolTx ] = useState<string>()
    // Steps for header
    const { nextStep, prevStep, reset, activeStep, setStep} = useSteps({
        initialStep: 0,
    });
    const { library, account } = useAppContext()

    const claimantIsPNftOwner = () => nft.originalData?.ownerAddress ? (claimantAddress === nft.originalData?.ownerAddress) : undefined

    const getBlockDate = async (blockNumber: string) => {
        const block = await library.getBlock(blockNumber)
        return new Date(block.timestamp * 1000)
    }

    const formatDate = (date: Date) => date.toLocaleDateString("en-US")

    // First transaction in form for claimant
    const claimantTx1 = claimantIsPNftOwner() ? mintTx : acquireTx
    // Second transaction in form for claimant (if sent to protocol)
    const claimantTx2 = sentToProtocolTx
    // First transaction in form for defendant
    const defendantTx1 = claimantIsPNftOwner() ? acquireTx : mintTx

    useEffect(() => {
        if (nft) {
            // Find pNFT minting TX
            getTransfersForOwner([
                nft.originalData?.ownerAddress || '',
                GetTransfersForOwnerTransferType.TO,
                {
                    contractAddresses: [nft.contract.address]
                }
            ]).then((result) => {
                const mintTransfer = result.nfts.find((transfer) => {
                    return transfer.tokenId === nft.tokenId
                })
                if (mintTransfer) {
                    setMintTx(mintTransfer.transactionHash)
                    // Take mint TX and it's timestamp
                    getBlockDate(mintTransfer.blockNumber).then((date) => {
                        setMintDate(date)
                    })
                } else {
                    setMintTx(undefined)
                    setMintDate(undefined)
                }
            })
            // Find original minting TX
            // We have to search for transactions after NFTProtect was deployed
            const startBlockNumber = nft.contract.deployedBlockNumber
            getTransfersForContract([
                nft.originalData?.contractAddress || '',
                {
                    fromBlock: startBlockNumber,
                }
            ]).then((result) => {
                const mintTransfer = result.nfts.find((transfer) => {
                    return transfer.tokenId === nft.originalData?.tokenId
                })
                if (mintTransfer) {
                    setMintOriginalTx(mintTransfer.transactionHash)
                    // Take mint TX and it's timestamp
                    getBlockDate(mintTransfer.blockNumber).then((date) => {
                        setMintOriginalDate(date)
                    })
                } else {
                    setMintOriginalTx(undefined)
                    setMintOriginalDate(undefined)
                }
            })
            // Find acquiring pNFT transaction. It's the last pNFT moving transaction
            getTransfersForOwner([
                nft.ownerAddress || '',
                GetTransfersForOwnerTransferType.TO,
                {
                    contractAddresses: [nft.contract.address]
                }
            ]).then((result) => {
                const acquireTransfer = result.nfts.reverse().find((transfer) => {
                    return transfer.tokenId === nft.tokenId
                })
                if (acquireTransfer) {
                    setAcquireTx(acquireTransfer.transactionHash)
                } else {
                    setAcquireTx(undefined)
                }
            })
            if (contractAddress) {
                // Find transaction of sending token to a hacked protocol
                // It's the last transaction of original owner to sent this pNFT
                getTransfersForOwner([
                    nft.ownerAddress || '',
                    GetTransfersForOwnerTransferType.FROM,
                    {
                        contractAddresses: [nft.contract.address]
                    }
                ]).then((result) => {
                    const sentTransfer = result.nfts.reverse().find((transfer) => {
                        return transfer.tokenId === nft.tokenId
                    })
                    if (sentTransfer) {
                        setSentToProtocolTx(sentTransfer.transactionHash)
                    } else {
                        setSentToProtocolTx(undefined)
                    }
                })
            } else {
                setSentToProtocolTx(undefined)
            }
        }
    }, [nft, account, library])

    const mainContent = <>
        <Flex flexDirection="column" flexWrap="nowrap" mt={{base: "30px"}}>
            <Text fontSize="30px" lineHeight="38px" fontWeight="600" color="#333333">
                { pageData.title }
            </Text>

            <Flex mt={{base: "5px"}} mb={{base: "30px"}} fontSize="18px" lineHeight="22px">
                <Link href={pageData.policyURL} isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline" textTransform="capitalize">
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>Dispute policy</Trans>
                        </Text>
                        <ExternalLink fontSize="18px" href={pageData.policyURL}/>
                    </Flex>
                </Link>
                { disputeData && <Link
                    href={ createDisputeLink(disputeData?.disputeId) } 
                    isExternal 
                    rel="noreferrer" 
                    color="#2D7BD6" 
                    fontSize="18px" 
                    lineHeight="22px"
                    textDecoration="underline"
                >
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>{"Open court's page in Kleros"}</Trans>
                        </Text>
                        <ExternalLink fontSize="22px" />
                    </Flex>
                </Link> }
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
                        <Input value={ disputeData?.disputeId?.toString() || t`Not yet`} type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
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
                        <Input value={formatDate(disputeData?.dateCreated || new Date()) } type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 3px rgba(0, 0, 0, 0.06)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
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
            { (stepKey === 'Decision period' || stepKey === 'Apealing period') &&
                <Flex alignItems="center" justifyContent="space-between" px={{base: "22px"}} py={{base: "20px"}} border="1px solid #2D7BD6" borderRadius={{base: "16px"}} mb={{base: "30px"}}>
                    { stepKey === 'Decision period' &&
                        <Flex>
                            <Box mr={{base: "20px"}}>
                                <Info fontSize="24px" color="#009AFF" />
                            </Box>
                            
                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                <Trans>Winner{":"}</Trans>
                                {" "}the Claimant
                            </Text>
                        </Flex>
                    }
                    {/* Visible only on step 3 "Apealing period" */}
                    { stepKey === 'Apealing period' &&
                        <Flex w={{base: "200px"}}>
                            <Button variant="primary-solid">File an appeal</Button>
                        </Flex>
                    }
                </Flex>
            }

            <Flex bgColor="#F8F8F8" p={{base: "18px"}} alignItems="flex-start" mb={{base: "30px"}}>
                { nft && <NFTImage nft={nft} /> }
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
                        { mintOriginalDate && formatDate(mintOriginalDate) }
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Original NFT protection date{":"}</Trans></chakra.span>
                        {" "}
                        { mintDate && formatDate(mintDate) }
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
                        <Link 
                            href={ generateAddressURL(claimantAddress, library.network.chainId) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                            ml={{base: "5px"}}
                        >
                            <chakra.span wordBreak="break-all">
                                { formatAddress(claimantAddress, 8) }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    {/* Hided for now */}
                    {/* <Text fontWeight="600" textStyle="paragraph" >
                        <Trans>DID{":"}</Trans>
                        <chakra.span bgColor="rgba(138, 255, 147, 0.5)" borderRadius="3px" fontSize={{base: "12px"}} lineHeight={{base: "15px"}} fontWeight="500" ml={{base: "5px"}} px={{base: "6px"}} py={{base: "2px"}}>
                            <Trans>Gitcoin passport{":"}{" "}70%</Trans>
                        </chakra.span>
                    </Text> */}

                    <Text fontWeight="600" textStyle="paragraph">
                        <Trans>Original{":"}</Trans>
                        {" "}
                        { nft.originalData && <Link 
                            href={ generateTokenURL(nft.originalData?.contractAddress, nft.originalData?.tokenId, library.network.chainId) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                                { formatAddress(nft.originalData?.contractAddress, 4) } (id: {nft.originalData?.tokenId})
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link> }
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph">
                        { pageData.claimantText }
                        {" "}
                        <Link 
                            href={claimantTx1 ? generateTxURL(claimantTx1, library.network.chainId) : '#'} 
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                               { claimantTx1 ? formatAddress(claimantTx1, 10) : '' }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    { pageData.claimantText2 && 
                        <Text fontWeight="600" textStyle="paragraph">
                            { pageData.claimantText2 }
                            {" "}
                            <Link 
                                href={claimantTx2 ? generateTxURL(claimantTx2, library.network.chainId) : '#'} 
                                isExternal 
                                rel="noreferrer" 
                                color="#2D7BD6" 
                                textDecoration="underline"
                            >
                                <chakra.span wordBreak="break-all">
                                { claimantTx2 ? formatAddress(claimantTx2, 10) : '' }
                                </chakra.span>
                                <ExternalLinkIcon mx='5px' />
                            </Link>
                        </Text> 
                    }
                </Flex>

                <Flex flexDirection="column" w="50%" pl={{base: "10px"}} >
                    <Flex  alignItems="center" mb={{base: "10px"}}>
                        <Text fontSize="18px" fontWeight="700" textTransform="capitalize">
                            <Trans>The Defendant</Trans>
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
                        <Link 
                            href={ generateAddressURL(contractAddress || defendantAddress, library.network.chainId) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline" 
                            ml={{base: "5px"}}
                        >
                            <chakra.span wordBreak="break-all">
                                { formatAddress(contractAddress || defendantAddress, 8) }
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
                        <Link
                            href={ generateTokenURL(nft.contract.address, nft.tokenId, library.network.chainId) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                                { formatAddress(nft.contract.address, 4) } (id: { nft.tokenId })
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph">
                        { pageData.defendantText }
                        {" "}
                        <Link 
                            href={defendantTx1 ? generateTxURL(defendantTx1, library.network.chainId) : '#'} 
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                               { defendantTx1 ? formatAddress(defendantTx1, 10) : '' }
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
    </>

    return (<>
        { stepKey && <Steps
            borderBottom="2px solid #ADADAD"
            variant={"circles"} 
            colorScheme="#1316DD"
            activeStep={activeStep}
            // onClickStep={(i) => {
            //     setStep(i);
            // }}
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
            
            {steps.map(({ key, description }) => (
                <Step 
                    key={key}
                    label={ <KlerosCaseLabel labelKey={key} /> } 
                    description={description}
                >
                    {/* {content} */}
                </Step>
            ))}
        </Steps> }
        { mainContent }
    </>)
}

export default KlerosCaseContent