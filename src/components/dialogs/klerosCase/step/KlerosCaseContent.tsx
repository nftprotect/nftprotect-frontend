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
import { ExternalLinkIcon, ArrowDownIcon, ArrowUpIcon, MinusIcon, AddIcon } from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import NFT, { ActionRequest, RequestStatus } from '../../../../classes/NFT';
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useMemo, useState } from 'react';
import { useAlchemy } from '../../../../hooks/useAlchemy';
import { GetTransfersForOwnerTransferType } from 'alchemy-sdk';
import { generateTxURL, generateAddressURL, generateTokenURL } from '../../../../utils/etherscan';
import { addTimestampToDate, formatAddress, timestampToDate } from '../../../../utils/helpers';
import { createDisputeLink } from '../../../../utils/kleros';
import KlerosCaseLabel from './KlerosCaseLabel';
import { Step, Steps, useSteps } from "chakra-ui-steps";
import IPFSUpload from '../../../../classes/IPFSUpload';
import { useAppContext } from '../../../../context/AppContextProvider';
import NFTImage from '../../../nftView/NFTImage';
import { EvidenceJson } from '../../../steps/KlerosEvidencesForm';
import { centralizeIpfsUrl } from '../../../../utils/ipfs';
import { NFTEvents } from '../../../../classes/NFT';
import { DisputePeriodData } from '../../../../hooks/useArbitrableProxy';
import { DisputeGraphData, Period } from '../../../../hooks/useArbitratorGraph';
import TimeCounter from '../../../../hooks/useTimeCounter';
import useTimeCounter from '../../../../hooks/useTimeCounter';
import { ReqStatus, ReqType } from '../../../../hooks/useNftProtectGraph';
import { useCallableDialogContext } from '../../../../context/CallableDialogContextProvider';

export interface KlerosCaseInitialData {
    nft: NFT,
    metaEvidenceId: number,
    claimantAddress: string,
    defendantAddress: string,
    contractAddress?: string,
    evidences?: EvidenceUpload[]
}

export interface EvidenceUpload {
    evidenceJson: EvidenceJson,
    submitDate: Date,
    submittedBy: string
}

interface CaseContentInitialData extends KlerosCaseInitialData {
    pageData: PageData,
    requestType: ReqType,
    requestStatus?: RequestStatus,
    disputeData?: DisputeGraphData,
}

interface PageData {
    title: string,
    summary: string,
    policyURL: string,
    claimantText: string,
    claimantText2?: string,
    claimantTooltip: string,
    defendantText: string,
    defendantTooltip: string,
    caseSubject: string
}

const KlerosCaseContent = ({
    nft, 
    pageData, 
    claimantAddress, 
    defendantAddress, 
    contractAddress,
    evidences,
    requestType,
    requestStatus = RequestStatus.Disputed,
    disputeData
}: CaseContentInitialData) => {

    // Step content mapping
    // Label refers to name of the step and displayed on steps bar
    // description is displayed under label. 
    // TODO replace descriptions with counters!!!
    const steps = [
        { 
            key: "Evidence period", 
            description:"1d 06h 09m",
            timeDiff: 3 * 24 * 60 * 60 * 1000 // 3 days
        }, {
            key: "Evidence period", // Actually it's a commit period
            description:"1d 06h 09m",
            timeDiff: 3 * 24 * 60 * 60 * 1000 // 3 days
        }, { 
            key: "Voting period", 
            description:"3d 18h 00m",
            timeDiff: 3 * 24 * 60 * 60 * 1000 // 3 days
        }, { 
            key: "Apealing period", 
            description:"3d 12h 00m",
            timeDiff: 3 * 24 * 60 * 60 * 1000 // 3 days
        }, { 
            key: "Decision period",
            timeDiff: 0
        }
    ]

    const stepsUnique = useMemo(() => {
        const processed: string[] = []
        return steps.filter((item) => {
            const counted = processed.includes(item.key)
            processed.push(item.key)
            return !counted
        })
    }, [steps])

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
    // Current step
    const step = useMemo(() => {
        return (disputeData?.period !== undefined) ? steps[disputeData.period] : undefined
    }, [disputeData])
    const stepKey = useMemo(() => {
        return step?.key
    }, [step])
    // Steps for header
    const { nextStep, prevStep, reset, activeStep, setStep} = useSteps({
        initialStep: 0,
    });
    const { library, account, active } = useAppContext()
    const { getDialog } = useCallableDialogContext()
    const [ sortDirection, setSortDirection ] = useState<'asc'|'desc'>('asc')

    const claimantIsPNftOwner = () => nft.originalData?.ownerAddress ? (claimantAddress === nft.originalData?.ownerAddress) : undefined

    const getBlockDate = async (blockNumber: string) => {
        const block = await library.getBlock(blockNumber)
        return timestampToDate(block.timestamp)
    }

    const formatDate = (date: Date) => date.toLocaleDateString("en-US")

    // First transaction in form for claimant
    const claimantTx1 = claimantIsPNftOwner() ? mintTx : acquireTx
    // Second transaction in form for claimant (if sent to protocol)
    const claimantTx2 = sentToProtocolTx
    // First transaction in form for defendant
    const defendantTx1 = claimantIsPNftOwner() ? acquireTx : mintTx
    // Description of the first evidence is a case description.
    const caseDescription = evidences && evidences[0] ? evidences[0].evidenceJson.description : ''

    const { formattedTime } = useTimeCounter(
        disputeData?.lastPeriodChange && step ?
        addTimestampToDate(disputeData.lastPeriodChange, step.timeDiff) : 
        new Date())

    // Finds pNFT minting TX
    const findPNftMintingTx = () => {
        if (nft.originalData) {
            getTransfersForOwner([
                nft.originalData.ownerAddress,
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
        }
    }
    
    // Finds original NFT minting TX
    const findOriginalMintingTx = () => {
        if (nft?.originalData) {
            // We have to search for transactions after NFTProtect was deployed
            const startBlockNumber = nft.contract.deployedBlockNumber
            getTransfersForContract([
                nft.originalData.contractAddress,
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
        }
    }

    // Finds acquiring pNFT transaction by current owner
    const findAcquiringPNftTx = () => {
        if (nft?.ownerAddress) {
            // It's the last pNFT moving transaction
            getTransfersForOwner([
                nft.ownerAddress,
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
        }
    }

    // Finds snding to hacked protocol transaction
    const findSendingToHackedContractTx = () => {
        if (nft?.ownerAddress && contractAddress) {
            // Find transaction of sending token to a hacked protocol
            // It's the last transaction of original owner to sent this pNFT
            getTransfersForOwner([
                nft.ownerAddress,
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

    useEffect(() => {
        const loadDependingOnInitial = () => {
            findPNftMintingTx()
            findSendingToHackedContractTx()
        }
        const loadDependingOnOriginal = () => {
            findAcquiringPNftTx()
            findOriginalMintingTx()
        }
        if (nft.ownerAddress) {
            loadDependingOnInitial()
        } else {
            nft.addEventListener(NFTEvents.InitialNFTDataLoaded, loadDependingOnInitial)
        }
        if (nft.originalData) {
            loadDependingOnOriginal()
        } else {
            nft.addEventListener(NFTEvents.OriginalNFTDataLoaded, loadDependingOnOriginal)
        }
        return () => {
            nft.removeEventListener(NFTEvents.InitialNFTDataLoaded, loadDependingOnInitial)
            nft.removeEventListener(NFTEvents.OriginalNFTDataLoaded, loadDependingOnOriginal)
        }
    }, [nft, account, library])

    useEffect(() => {
        const idx = stepsUnique.findIndex(item => item.key === stepKey)
        setStep(idx)
    }, [stepKey])

    const mainContent = <>
        <Flex flexDirection="column" flexWrap="nowrap" my={{base: "34px"}}>
            <Text fontSize="30px" lineHeight="38px" fontWeight="600" color="text.base">
                { pageData.title }
            </Text>

            <Flex mt={{base: "8px"}} mb={{base: "30px"}} fontSize="18px" lineHeight="22px">
                <Link href={pageData.policyURL} isExternal rel="noreferrer" color="#2D7BD6" textDecoration="underline" mr={{base: "28px"}}>
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>Dispute Policy</Trans>
                        </Text>
                        <ExternalLink fontSize="18px" href={pageData.policyURL}/>
                    </Flex>
                </Link>
                { disputeData && <Link
                    href={ createDisputeLink(disputeData.id) } 
                    isExternal 
                    rel="noreferrer" 
                    color="#2D7BD6" 
                    textDecoration="underline"
                >
                    <Flex mr={{base: "30px"}} alignItems="center">
                        <Text mr={{base: '8px'}}>
                            <Trans>{"Open the court's page in Kleros"}</Trans>
                        </Text>
                        <ExternalLink fontSize="22px" />
                    </Flex>
                </Link> 
                }
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
                        <Input value={ disputeData?.id?.toString() || t`Not yet`} type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="4px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
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
                        <Input value={disputeData?.startTime && formatDate(disputeData.startTime) } type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
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
                        <Input value="3" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>

                <FormControl w={{base: "186px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Court</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement py={{base: "14px"}} pointerEvents='none'>
                            <Image src="/images/lawBalance.svg" alt="Law balance icon" w="16px" h="16px" />
                        </InputLeftElement>
                        <Input value="Non technical" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>
            </Flex>
            
            {/* Visible only on step 3 "Apealing period" and step 4 "Decision period" */}
            { (stepKey === 'Decision period' || stepKey === 'Apealing period') &&
                <Flex alignItems="center" justifyContent="space-between" px={{base: "22px"}} py={{base: "20px"}} border="1px solid #2D7BD6" borderRadius={{base: "16px"}} mb={{base: "30px"}}>
                    { ((): JSX.Element => {
                        const isAppealingPeriod: boolean = stepKey === 'Apealing period'
                        const enforced: boolean = (requestStatus === RequestStatus.Accepted || requestStatus === RequestStatus.Rejected)
                        const appealButton = <Flex w={{base: "200px"}}>
                            <Button variant="primaryLight">
                                <Trans>File an appeal</Trans>
                            </Button>
                        </Flex>
                        const enforceButton = !enforced && <Flex w={{base: "200px"}}>
                            <Button 
                                variant="primaryLight"
                                onClick={() => {
                                    const dialog = getDialog('EnforceRulingDialog')
                                    dialog.setNft(nft)
                                    dialog.onOpen()
                                }}
                                isDisabled={!active}
                            >
                                <Trans>Enforce the ruling</Trans>
                            </Button>
                        </Flex>
                        const button = isAppealingPeriod ?
                            appealButton :
                            enforceButton
                        switch (disputeData?.currentRulling) {
                            case 0:
                                return (<>
                                    <Flex>
                                        <Box>
                                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} fontWeight="600" color={'#C21313'}>
                                                <Trans>The jurors refused to arbitrate the dispute</Trans>
                                            </Text>
                                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                <Trans>The case will now be closed.</Trans>
                                            </Text>
                                            <br/>
                                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} color={'grey'}>
                                                <Trans>The Ruling on this case must be enforced to open a new case on this pNFT in the future.</Trans>
                                            </Text>
                                        </Box>
                                    </Flex>
                                    { enforceButton }
                                </>)
                            case 1:
                                return (<>
                                    <Flex>
                                        <Box>
                                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} fontWeight="600">
                                                <Trans>Winner: the Claimant</Trans>
                                            </Text>
                                            { requestType === ReqType.OwnershipAdjustment && (
                                                <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                    <Trans>{"The original NFT has been transfered to the Claimant's wallet. The pNFT was burned."}</Trans>
                                                </Text> 
                                            )}
                                            { requestType === ReqType.OwnershipRestore && (
                                                <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                    <Trans>{"The original NFT has been restored to the Claimant's wallet. The pNFT was burned."}</Trans>
                                                </Text> 
                                            )}
                                            {
                                                isAppealingPeriod ?
                                                    <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                        <Trans>You may file an appeal.</Trans>
                                                    </Text> :
                                                    !enforced && <>
                                                        <br/>
                                                        <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} color={'grey'}>
                                                            <Trans>Press the button to enforce the ruling.</Trans>
                                                        </Text>
                                                    </>
                                            }
                                        </Box>
                                    </Flex>
                                    { button }
                                </>)
                            case 2:
                                return (<>
                                    <Flex>
                                        <Box>
                                            <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} fontWeight="600">
                                                <Trans>Winner: the Defendant</Trans>
                                            </Text>
                                            { requestType === ReqType.OwnershipAdjustment && (
                                                <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                    <Trans>The defendant is still the owner of the Original NFT.<br/>The pNFT remains intact.</Trans>
                                                </Text> 
                                            )}
                                            { requestType === ReqType.OwnershipRestore && (
                                                <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                    <Trans>No changes enforced.</Trans>
                                                </Text> 
                                            )}
                                            {
                                                isAppealingPeriod ?
                                                    <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                        <Trans>You may file an appeal.</Trans>
                                                    </Text> :
                                                    !enforced && <>
                                                        <br/>
                                                        <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} color={'grey'}>
                                                            <Trans>Press the button to enforce the ruling.</Trans>
                                                        </Text>
                                                    </>
                                            }
                                        </Box>
                                    </Flex>
                                    { button }
                                </>)
                            default:
                                return <></>
                        }
                    })() }
                </Flex>
            }

            <Flex bgColor="#F8F8F8" p={{base: "18px"}} alignItems="flex-start" mb={{base: "30px"}}>
                <Box my={{base: "-20px"}}>
                    { nft && <NFTImage nft={nft} /> }
                </Box>
                
                <Flex flexDirection="column" ml={{base: "18px"}} >
                    <Text fontSize={{base: "22px"}} mb={{base: "14px"}}>
                        <chakra.span fontWeight="600"><Trans>The Subject of the Dispute{":"}</Trans></chakra.span>
                        {" "}
                        <Trans>{ pageData.caseSubject }</Trans>
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
                    <Flex alignItems="center" mb={{base: "4px"}}>
                        <Text fontSize="18px" fontWeight="700">
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

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                        <Trans>Wallet{":"}</Trans>
                        {' '}
                        { claimantAddress && <Link 
                            href={ generateAddressURL(claimantAddress, library.network.chainId) }
                            isExternal 
                            rel="noreferrer" 
                            
                            ml={{base: "5px"}}
                        >
                            <chakra.span wordBreak="break-all" color="#2D7BD6" textDecoration="underline">
                                { formatAddress(claimantAddress, 8) }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>}
                    </Text>

                    {/* Hided for now */}
                    {/* <Text fontWeight="600" textStyle="paragraph" >
                        <Trans>DID{":"}</Trans>
                        <chakra.span bgColor="rgba(138, 255, 147, 0.5)" borderRadius="3px" fontSize={{base: "12px"}} lineHeight={{base: "15px"}} fontWeight="500" ml={{base: "5px"}} px={{base: "6px"}} py={{base: "2px"}}>
                            <Trans>Gitcoin passport{":"}{" "}70%</Trans>
                        </chakra.span>
                    </Text> */}

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
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
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link> }
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                        { pageData.claimantText }
                        {" "}
                        { claimantTx1 && <Link 
                            href={claimantTx1 ? generateTxURL(claimantTx1, library.network.chainId) : '#'} 
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                               { claimantTx1 ? formatAddress(claimantTx1, 10) : '' }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>}
                    </Text>

                    { pageData.claimantText2 && 
                        <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                            { pageData.claimantText2 }
                            {" "}
                            { claimantTx2 && <Link 
                                href={claimantTx2 ? generateTxURL(claimantTx2, library.network.chainId) : '#'} 
                                isExternal 
                                rel="noreferrer" 
                                color="#2D7BD6" 
                                textDecoration="underline"
                            >
                                <chakra.span wordBreak="break-all">
                                { claimantTx2 ? formatAddress(claimantTx2, 10) : '' }
                                </chakra.span>
                                <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                            </Link>}
                        </Text> 
                    }
                </Flex>

                <Flex flexDirection="column" w="50%" pl={{base: "10px"}} >
                    <Flex  alignItems="center" mb={{base: "4px"}}>
                        <Text fontSize="18px" fontWeight="700">
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

                    <Text fontWeight="600" fontSize={{base: "14px"}} mb={{base: "6px"}}>
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
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>
                    </Text>

                    {/* Visible only if defendant is not a smart contract */}
                    {/* { !contractAddress && 
                        <Text textStyle="paragraph" fontWeight="600" mb={{base: "6px"}}>
                            <Trans>DID{":"}</Trans>
                            <chakra.span bgColor="rgba(246, 12, 54, 0.12)" borderRadius="3px" fontSize={{base: "12px"}} lineHeight={{base: "15px"}} fontWeight="500" ml={{base: "5px"}} px={{base: "6px"}} py={{base: "2px"}}>
                                <Trans>None</Trans>
                            </chakra.span>
                        </Text>
                    } */}

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
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
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
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
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>
                    </Text>
                </Flex>
            </Flex>

            <Flex flexDirection="column" mb={{base: "35px"}}>
                <Text fontWeight="700" fontSize={{base: "18px"}} lineHeight={{base: "22px"}} mb={{base: "6px"}}>
                    { pageData.summary }
                </Text>

                <Text fontWeight="400" textStyle="paragraph" mb={{base: "15px"}}>
                    <Trans>They explain the situation as follows:</Trans>
                </Text>

                <Flex w="100%" fontSize={{base: "14px"}}>
                    <Text>{ caseDescription }</Text>
                </Flex>
            </Flex>

            { evidences && evidences.length > 0 &&
                <>
                    {/* <Flex alignItems="center" justifyContent="space-between" mb={{base: "35px"}}>
                        <Flex alignItems="center" flexDirection="row" color="#ADADAD" textStyle="paragraph">
                            <Text>
                                <Trans>Sort by{": "} date</Trans>
                            </Text>

                            <IconButton 
                                aria-label='Sort' 
                                icon={(sortDirection == 'asc') ? <ArrowUpIcon /> : <ArrowDownIcon />} 
                                w={{base: "20px"}} 
                                bg="none"
                                boxShadow="none"
                                p="0" 
                                m="0" 
                                _hover={{bg: "none"}}
                                onClick={() => {
                                    (sortDirection == 'asc') ? setSortDirection('desc') : setSortDirection('asc')
                                }}
                            />
                        </Flex>
                    </Flex> */}

                    { evidences.sort(( a, b ) => {
                        const result = (sortDirection === 'asc') ? (a.submitDate >= b.submitDate) : (b.submitDate < a.submitDate)
                        return result ? 1 : -1
                    }).map((evidence, idx) => {
                        const isInitial = (evidence === evidences[0])
                        const evidenceDescription = isInitial ? t`Initial evidence` : evidence.evidenceJson.description
                        return <Flex key={`panel-${idx}`} flexDirection="column" border="1px solid #E5E5E5" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)"  >
                            <Text fontWeight="600" textStyle="paragraph" px={{base: "24px"}} pt={{base: "24px"}} pb={{base: "14px"}}>
                                {`#${idx+1} ${evidenceDescription}`}
                            </Text>
                            <Flex flexDirection="column" bgColor="#F8F8F8" px={{base: "24px"}} pt={{base: "11px"}} pb={{base: "14px"}}>
                                <Text textStyle="paragraph">
                                    <Trans>Submitted by</Trans> {
                                        // evidence.evidenceJson.evidenceSide === 0 ? 
                                        //     formatAddress(claimantAddress, 4) : 
                                        // evidence.evidenceJson.evidenceSide === 1 ?
                                        //     formatAddress(defendantAddress, 4) :
                                        formatAddress(evidence.submittedBy, 4)
                                    }
                                </Text>
                                <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <Text color="#818181" fontSize={{base: "12px"}} lineHeight={{base: "18px"}}>
                                        { formatDate(evidence.submitDate) }
                                    </Text>
                                    <Flex flexDirection="column" textAlign="right">
                                    { evidence.evidenceJson.files.map((file, idx) => {
                                        return <Text key={`file-${idx}`} textStyle="paragraph" color="#2D7BD6">
                                            { file.description }
                                            <Link href={centralizeIpfsUrl(file.fileURI)} isExternal rel="noreferrer" color="#2D7BD6">
                                                <ExternalLinkIcon mb="3px" mx='5px' fontSize="16px" lineHeight={{base: "18px"}}/>
                                            </Link>
                                        </Text>
                                    })}
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    })}
                </>
            }
            {/* Visible only on step 1 "Evidence period" */}
            { (stepKey === 'Evidence period') && <Flex mt={{base: "80px"}} alignItems="center" justifyContent="center">
                    <Button 
                        variant="primaryLight" 
                        w={{base: "200px"}} 
                        px={{base: "32px"}} 
                        py={{base: "12px"}}
                        onClick={() => {
                            const dialog = getDialog('AddEvidencesDialog')
                            dialog.setNft(nft)
                            dialog.onOpen()
                        }}
                        isDisabled={!active}
                    >
                        <Trans>Submit new evidence</Trans>
                    </Button>
                </Flex>
            }
        </Flex>
    </>

    return (<>
        { stepKey && <Steps
            borderBottom="1px solid #ADADAD"
            variant={"circles"} 
            colorScheme="brand.light"
            activeStep={activeStep}
            // onClickStep={(i) => {
            //     setStep(i);
            // }}
            py="30px"
            sx={{
                "& .cui-steps__step-icon-container": {
                    w: "26px",
                    h: "26px",
                    bg: "brand.light", 
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
            
            {stepsUnique.map(({ key, description, timeDiff }) => (
                <Step 
                    key={key}
                    label={ <KlerosCaseLabel labelKey={key} /> } 
                    description={ (key === stepKey) ? (timeDiff ? formattedTime : '') : description }
                />
            ))}
        </Steps> }
        { mainContent }
    </>)
}

export default KlerosCaseContent