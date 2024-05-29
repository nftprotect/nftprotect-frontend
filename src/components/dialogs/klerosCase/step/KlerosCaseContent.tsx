import {
    chakra,
    Box,
    Flex,
    Text,
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
    Button,
    Divider,
} from '@chakra-ui/react'
import { HelpCircle, ExternalLink, Calendar, User, Info } from '@web3uikit/icons'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import NFT from '../../../../classes/NFT';
import { useEffect, useMemo, useState } from 'react';
import { useAlchemy } from '../../../../hooks/useAlchemy';
import { GetTransfersForOwnerTransferType, NftTokenType } from 'alchemy-sdk';
import { generateTxURL, generateAddressURL, generateTokenURL } from '../../../../utils/etherscan';
import { formatAddress, timestampToDate } from '../../../../utils/helpers';
import { createDisputeLink } from '../../../../utils/kleros';
import { useAppContext } from '../../../../context/AppContextProvider';
import NFTImage from '../../../nftView/NFTImage';
import { EvidenceJson } from '../../../steps/KlerosEvidencesForm';
import { centralizeIpfsUrl } from '../../../../utils/ipfs';
import { DisputeGraphData, Period } from '../../../../hooks/useArbitratorGraph';
import { MetaEvidenceType } from '../../../../hooks/useNftProtectGraph';
import { useCallableDialogContext } from '../../../../context/CallableDialogContextProvider';
import AddressDisplay from '../../../AddressDisplay';
import KlerosCaseSteps from './KlerosCaseSteps';
import { ReqStatus, ReqType } from '../../../../hooks/useNftProtect';
import { usePublicClient, useWalletClient } from "wagmi";
import { getBlock } from 'viem/actions'


export interface KlerosCaseInitialData {
    nft: NFT,
    selectedChain: any, // The chain selected
    metaEvidenceId: MetaEvidenceType,
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
    requestType: ReqType,
    requestStatus?: ReqStatus,
    disputeData?: DisputeGraphData,
    disputeIsRuled?: boolean
}

const KlerosCaseContent = ({
    nft,
    selectedChain,
    metaEvidenceId,
    claimantAddress, 
    defendantAddress, 
    contractAddress,
    evidences,
    requestType,
    requestStatus = ReqStatus.Disputed,
    disputeData,
    disputeIsRuled
}: CaseContentInitialData) => {

    const metaEvidenceDescriptions = [
        {
            label: t`Bona fide transfer`,
            id: MetaEvidenceType.Adjustment,
            page: {
                title: t`Ownership adjustment in case of bona fide transfer`,
                summary: t`The Claimant alleges that he purchased the pNFT bona fide but the owner of the original NFT refused to transfer him the original.`,
                policyURL: 'https://cloudflare-ipfs.com/ipfs/QmbaUb1TLEj8ZLrjfSiXfn6aqycZRVGfPzSSUVj7MRjR8M/nftprotect-policy-bonafide-transfer.pdf',
                claimantText: t`Claimant acquired the pNFT through this transaction:`,
                claimantTooltip: t`The Claimant is the party that has obtained a pNFT in a bona fide transaction`,
                defendantText: t`Defendant was the Original Owner of the NFT and insured it through the Protocol:`,
                defendantTooltip: t`The Defendant is the party that has insured the Original throught the Protocol (Original Owner)`,
                caseSubject: t`Original NFT`
            }
        }, {
            label: t`Incorrect address`,
            id: MetaEvidenceType.Mistake,
            page: {
                title: t`Ownership restoration in case of loss of pNFT due to a sending to an incorrect address`,
                summary: t`The Claimant alleges loss of their pNFT due to a transaction to an incorrect address.`,
                policyURL: 'https://cloudflare-ipfs.com/ipfs/QmedeZXJcuK6ynaEdT2igAqsVpFenP2u2NGPX6ThuDhwQg/nftprotect-policy-incorrect-address.pdf',
                claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
                claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
                defendantText: t`Defendant acquired the pNFT through this transaction:`,
                defendantTooltip: t`The Defendant is the party that has aquired the pNFT and is challenged.`,
                caseSubject: t`Protected NFT (pNFT)`
            }
        }, {
            label: t`Phishing attack`,
            id: MetaEvidenceType.Phishing,
            page: {
                title: t`Ownership restoration in case of loss of pNFT in phishing attack`,
                summary: t`The Claimant alleges loss of their pNFT due to a phishing attack.`,
                policyURL: 'https://cloudflare-ipfs.com/ipfs/QmaFLVL6a861bnwpr4jKhUN5oq7YXdsMaQfD74SiVDtmaJ/nftprotect-policy-phishing-attack.pdf',
                claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
                claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
                defendantText: t`Defendant acquired the pNFT through this transaction:`,
                defendantTooltip: t`The Defendant is the party that has aquired the pNFT and is challenged.`,
                caseSubject: t`Protected NFT (pNFT)`
            }
        }, {
            label: t`Protocol breach`,
            id: MetaEvidenceType.ProtocolBreach,
            page: {
                title: t`Ownership restoration in case of loss of pNFT in a protocol breach`,
                summary: t`The Claimant alleges loss of their pNFT due to a protocol breach.`,
                policyURL: 'https://cloudflare-ipfs.com/ipfs/QmfXtwDKxLXaN8CfbKoWHU7H1jsU5tzmHPyK4KnNgYfwtx/nftprotect-policy-protocol-breach.pdf',
                claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
                claimantText2: t`Claimant sent pNFT to partner protocol:`,
                claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
                defendantText: t`The pNFT was transfered out of the protocol:`,
                defendantTooltip: t`The Defendant is the protocol, that lost the pNFT due to breach and is challenged`,
                caseSubject: t`Protected NFT (pNFT)`
            }
        }
    ]

    const { nft: nftApi } = useAlchemy()

    // Holds TX hash for pNFT minting transaction
    const [ mintTx, setMintTx ] = useState<string|null|undefined>()
    // Holds TX date for pNFT minting transaction
    const [ mintDate, setMintDate ] = useState<Date|null|undefined>()
    // Holds TX hash for original NFT minting transaction
    const [ mintOriginalTx, setMintOriginalTx ] = useState<string|null|undefined>()
    // Holds TX date for original NFT minting transaction
    const [ mintOriginalDate, setMintOriginalDate ] = useState<Date|null|undefined>()
    // Holds TX hash for acquiring pNFT by current owner
    const [ acquireTx, setAcquireTx ] = useState<string|null|undefined>()
    // Holds TX hash for acquiring pNFT by current owner
    const [ sentToProtocolTx, setSentToProtocolTx ] = useState<string|null|undefined>()
    const { active, isCorrectChain } = useAppContext()
    const publicClient  = usePublicClient({chainId: selectedChain.id})
    const { getDialog } = useCallableDialogContext()
    const [ sortDirection, setSortDirection ] = useState<'asc'|'desc'>('asc')
    const pageData = metaEvidenceDescriptions.find((item) => item.id === metaEvidenceId )?.page || metaEvidenceDescriptions[0].page

    const claimantIsPNftOwner = () => nft.originalData?.ownerAddress ? (claimantAddress === nft.originalData?.ownerAddress) : undefined

    const getBlockDate = async (blockNumber: string) => {
        const block = await getBlock(publicClient!, {blockNumber: BigInt(blockNumber)})
        return timestampToDate(Number(block.timestamp))
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

    // Finds pNFT minting TX
    const findPNftMintingTx = () => {
        if (nft.originalData) {
            nftApi.getTransfersForOwner(
                nft.originalData.ownerAddress,
                GetTransfersForOwnerTransferType.TO,
                {
                    contractAddresses: [nft.contract.address]
                }
            ).then((result) => {
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
                    setMintTx(null)
                    setMintDate(null)
                }
            })
        }
    }
    
    // Finds original NFT minting TX
    const findOriginalMintingTx = () => {
        if (nft?.originalData) {
            // We have to search for transactions after NFTProtect was deployed
            const startBlockNumber = nft.contract.deployedBlockNumber
            nftApi.getTransfersForOwner(
                nft.originalData.ownerAddress,
                GetTransfersForOwnerTransferType.TO,
                {
                    contractAddresses: [selectedChain.nftProtectContract],
                    tokenType: NftTokenType.ERC721
                }
            ).then((result) => {
                const mintTransfer = result.nfts.find((transfer) => {
                    return transfer.tokenId === nft.tokenId
                })
                if (mintTransfer) {
                    setMintOriginalTx(mintTransfer.transactionHash)
                    // Take mint TX and it's timestamp
                    getBlockDate(mintTransfer.blockNumber).then((date) => {
                        setMintOriginalDate(date)
                    })
                } else {
                    setMintOriginalTx(null)
                    setMintOriginalDate(null)
                }
            })
        }
    }

    // Finds acquiring pNFT transaction by current owner
    const findAcquiringPNftTx = () => {
        if (nft?.ownerAddress) {
            // It's the last pNFT moving transaction
            nftApi.getTransfersForOwner(
                nft.ownerAddress,
                GetTransfersForOwnerTransferType.TO,
                {
                    contractAddresses: [nft.contract.address]
                }
            ).then((result) => {
                const acquireTransfer = result.nfts.reverse().find((transfer) => {
                    return transfer.tokenId === nft.tokenId
                })
                if (acquireTransfer) {
                    setAcquireTx(acquireTransfer.transactionHash)
                } else {
                    setAcquireTx(null)
                }
            })
        }
    }

    // Finds snding to hacked protocol transaction
    const findSendingToHackedContractTx = () => {
        if (nft?.ownerAddress && contractAddress) {
            // Find transaction of sending token to a hacked protocol
            // It's the last transaction of original owner to sent this pNFT
            nftApi.getTransfersForOwner(
                nft.ownerAddress,
                GetTransfersForOwnerTransferType.FROM,
                {
                    contractAddresses: [nft.contract.address]
                }
            ).then((result) => {
                const sentTransfer = result.nfts.reverse().find((transfer) => {
                    return transfer.tokenId === nft.tokenId
                })
                if (sentTransfer) {
                    setSentToProtocolTx(sentTransfer.transactionHash)
                } else {
                    setSentToProtocolTx(null)
                }
            })
        } else {
            setSentToProtocolTx(null)
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
        loadDependingOnInitial()
        loadDependingOnOriginal()
    }, [nft])

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

                <FormControl w={{base: "186px"}} mr={{base: "30px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Court</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement py={{base: "14px"}} pointerEvents='none'>
                            <Image src="/images/law-balance.svg" alt="Law balance icon" w="16px" h="16px" />
                        </InputLeftElement>
                        <Input value="Non technical" type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>

                <FormControl w={{base: "186px"}}>
                    <FormLabel fontSize="14px" lineHeight="18px">
                        <Trans>Chain</Trans>
                    </FormLabel>
                    <InputGroup >
                        <InputLeftElement  py={{base: "14px"}} pointerEvents='none'>
                            <User fontSize="18px" />
                        </InputLeftElement>
                        <Input value={ selectedChain.name } type='text' py={{base: "8px"}} isReadOnly border="1px solid rgba(0, 0, 0, 0.1)" borderRadius="3px" boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)" sx={{"&:focus": {border: '1px solid rgba(0, 0, 0, 0.1)' }}} />
                    </InputGroup>
                </FormControl>
            </Flex>
            
            {/* Visible only on step 3 "Apealing period" and step 4 "Decision period" */}
            { (disputeData?.period === Period.Execution || disputeData?.period === Period.Appeal) &&
                <Flex alignItems="center" justifyContent="space-between" px={{base: "22px"}} py={{base: "20px"}} border="1px solid #2D7BD6" borderRadius={{base: "16px"}} mb={{base: "30px"}}>
                    { ((): JSX.Element => {
                        const isAppealingPeriod: boolean = disputeData?.period === Period.Appeal
                        const enforced: boolean = (requestStatus === ReqStatus.Accepted || requestStatus === ReqStatus.Rejected)
                        const appealButton = <Flex w={{base: "200px"}}>
                            <Button 
                                variant="primaryLight"
                                onClick={() => {
                                    const disputeLink = createDisputeLink(disputeData.id);
                                    window.open(disputeLink, '_blank');
                                }}
                            >
                                <Trans>File an appeal</Trans>
                            </Button>
                        </Flex>
                        const enforceButton = (!enforced) ? <Flex w={{base: "200px"}}>
                            <Button 
                                variant="primaryLight"
                                onClick={() => {
                                    const dialog = getDialog('EnforceRulingDialog')
                                    dialog.setData({nft, isRuled: disputeIsRuled})
                                    dialog.onOpen()
                                }}
                                isDisabled={!(active && isCorrectChain)}
                            >
                                <Trans>Enforce the ruling</Trans>
                            </Button>
                        </Flex> : ''
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
                                            {
                                                isAppealingPeriod ?
                                                    <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}}>
                                                        <Trans>You may file an appeal.</Trans>
                                                    </Text> :
                                                    !enforced && <>
                                                        <br/>
                                                        <Text fontSize={{base: "18px"}} lineHeight={{base: "22px"}} color={'grey'}>
                                                            <Trans>The Ruling on this case must be enforced to open a new case on this pNFT in the future.</Trans>
                                                        </Text>
                                                    </>
                                            }
                                        </Box>
                                    </Flex>
                                    { button }
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
                        { nft.contract.contractDeployer || t`Unknown` }
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Original NFT creation date{":"}</Trans></chakra.span>
                        {" "}
                        { mintOriginalDate ? 
                            formatDate(mintOriginalDate) :
                            ( mintOriginalDate === null ) ?
                                <chakra.span color={'#C21313'}><Trans>No information found</Trans></chakra.span> :
                                <Trans>Loading…</Trans>
                        }
                    </Text>
                    <Text textStyle="paragraph">
                        <chakra.span fontWeight="600"><Trans>Original NFT protection date{":"}</Trans></chakra.span>
                        {" "}
                        { mintDate ? 
                            formatDate(mintDate) :  
                                (mintDate === null) ?
                                <chakra.span color={'#C21313'}><Trans>No information found</Trans></chakra.span> :
                                <Trans>Loading…</Trans>
                        }
                    </Text>
                </Flex>
            </Flex>

            <Flex w="100%" mb={{base: "36px"}}>
                <Flex flexDirection="column" borderRight="2px solid #ADADAD" w="50%" pr={{base: "10px"}}>
                    <Flex alignItems="center" mb={{base: "4px"}}>
                        <Text fontSize="18px" fontWeight="700">
                            <Trans>The Claimant</Trans>
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
                            href={ generateAddressURL(claimantAddress, selectedChain.id) }
                            isExternal 
                            rel="noreferrer" 
                            
                            ml={{base: "5px"}}
                        >
                            <chakra.span wordBreak="break-all" color="#2D7BD6" textDecoration="underline">
                                <AddressDisplay address={claimantAddress} formatNumber={8} />
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
                            href={ generateTokenURL(nft.originalData?.contractAddress, nft.originalData?.tokenId, selectedChain.id) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                                <AddressDisplay address={nft.originalData?.contractAddress}/> (id: { formatAddress(nft.originalData.tokenId, 2) })
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link> }
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                        { pageData.claimantText }
                        {" "}
                        { claimantTx1 ? <Link 
                            href={ generateTxURL(claimantTx1, selectedChain.id) } 
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                               { formatAddress(claimantTx1, 10) }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link> : (claimantTx1 === null) ?
                            <chakra.span color={'#C21313'}><Trans>No information found</Trans></chakra.span> :
                            <Trans>Loading…</Trans>
                        }
                    </Text>

                    { pageData.claimantText2 && 
                        <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                            { pageData.claimantText2 }
                            {" "}
                            { claimantTx2 ? <Link 
                                href={ generateTxURL(claimantTx2, selectedChain.id) } 
                                isExternal 
                                rel="noreferrer" 
                                color="#2D7BD6" 
                                textDecoration="underline"
                            >
                                <chakra.span wordBreak="break-all">
                                    { formatAddress(claimantTx2, 10) }
                                </chakra.span>
                                <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                            </Link> : (claimantTx2 === null) ?
                                <chakra.span color={'#C21313'}><Trans>No information found</Trans></chakra.span> :
                                <Trans>Loading…</Trans>
                            }
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
                            href={ generateAddressURL(contractAddress || defendantAddress, selectedChain.id) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline" 
                            ml={{base: "5px"}}
                        >
                            <chakra.span wordBreak="break-all">
                                <AddressDisplay address={contractAddress || defendantAddress} formatNumber={8}/>
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
                            href={ generateTokenURL(nft.contract.address, nft.tokenId, selectedChain.id) }
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                                <AddressDisplay address={nft.contract.address}/> (id: { formatAddress(nft.tokenId, 2) })
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link>
                    </Text>

                    <Text fontWeight="600" textStyle="paragraph" mb={{base: "6px"}}>
                        { pageData.defendantText }
                        {" "}
                        { defendantTx1 ? <Link 
                            href={ defendantTx1 ? generateTxURL(defendantTx1, selectedChain.id) : '#'} 
                            isExternal 
                            rel="noreferrer" 
                            color="#2D7BD6" 
                            textDecoration="underline"
                        >
                            <chakra.span wordBreak="break-all">
                               { formatAddress(defendantTx1, 10) }
                            </chakra.span>
                            <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                        </Link> : (defendantTx1 === null) ?
                            <chakra.span color={'#C21313'}><Trans>No information found</Trans></chakra.span> :
                            <Trans>Loading…</Trans>
                        }
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
                                    <Trans>Submitted by</Trans>
                                    <Box as="span" ml={"0.3rem"}>
                                        <AddressDisplay address={evidence.submittedBy}/>
                                    </Box>
                                </Text>
                                <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <Text color="#818181" fontSize={{base: "12px"}} lineHeight={{base: "18px"}}>
                                        { formatDate(evidence.submitDate) }
                                    </Text>
                                    <Flex flexDirection="column" textAlign="right">
                                    { evidence.evidenceJson.files ? 
                                        evidence.evidenceJson.files.map((file, idx) => {
                                            return <Text key={`file-${idx}`} textStyle="paragraph" color="#2D7BD6">
                                                { file.description }
                                                <Link href={centralizeIpfsUrl(file.fileURI)} isExternal rel="noreferrer" color="#2D7BD6">
                                                    <ExternalLinkIcon mb="3px" mx='5px' fontSize="16px" lineHeight={{base: "18px"}}/>
                                                </Link>
                                            </Text>
                                        }) : 
                                        <Text textStyle="paragraph" color="#2D7BD6">
                                                <Trans>File link</Trans>
                                                <Link href={centralizeIpfsUrl(evidence.evidenceJson.fileURI)} isExternal rel="noreferrer" color="#2D7BD6">
                                                    <ExternalLinkIcon mb="3px" mx='5px' fontSize="16px" lineHeight={{base: "18px"}}/>
                                                </Link>
                                        </Text>
                                    }
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    })}
                </>
            }
            {/* Visible only on step 1 "Evidence period" */}
            { (disputeData?.period === Period.Evidence || disputeData?.period === Period.Commit) && 
                <Flex mt={{base: "80px"}} alignItems="center" justifyContent="center">
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
                        isDisabled={!(active && isCorrectChain)}
                    >
                        <Trans>Submit new evidence</Trans>
                    </Button>
                </Flex>
            }
        </Flex>
    </>

    return (<>
        <KlerosCaseSteps
            period={disputeData?.period}
            lastPeriodChange={disputeData?.lastPeriodChange}
        />
        <Divider pt='1em' borderColor='gray'/>
        { mainContent }
    </>)
}

export default KlerosCaseContent