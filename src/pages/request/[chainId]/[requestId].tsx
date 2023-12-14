import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../../utils/lingui'
import { useEffect, useMemo, useState } from 'react'
import { defaultChain, supportedChains, switchingManualURI } from '../../../config'
import { BigNumber } from '@ethersproject/bignumber'
import { useAlchemy } from '../../../hooks/useAlchemy'
import NFT from '../../../classes/NFT'
import { useAppContext } from '../../../context/AppContextProvider'
import KlerosCaseContent, { EvidenceUpload } from '../../../components/dialogs/klerosCase/step/KlerosCaseContent'
import { NFTEvents } from '../../../classes/NFT'
import { Trans, t } from '@lingui/macro'
import { ReqType, ReqStatus, useNftProtectGraph, RequestGraphData } from '../../../hooks/useNftProtectGraph'
import { Box, Container, Link, Text } from '@chakra-ui/react'
import { ActionRequest } from '../../../classes/NFT'
import { useArbitrableProxy, DisputePeriodData } from '../../../hooks/useArbitrableProxy'
import { centralizeIpfsUrl } from '../../../utils/ipfs'
import { timestampToDate } from '../../../utils/helpers'
import { DisputeGraphData, Period, useArbitratorGraph } from '../../../hooks/useArbitratorGraph'
import AddEvidencesDialog from '../../../components/dialogs/request/AddEvidencesDialog'
import { useIPFSContext } from '../../../context/IPFSContextProvider'
import EnforceRulingDialog from '../../../components/dialogs/request/EnforceRulingDialog'
import Head from 'next/head'
import { WarningTwoIcon } from '@chakra-ui/icons'
import ConnectButton from '../../../components/ConnectButton'

export const getServerSideProps: GetServerSideProps = async ({ params, locale } ) => {
    const requestId = params?.requestId
    const translation = await loadTranslation(
        locale!,
        process.env.NODE_ENV === 'production'
    )
    return {
        props: {
            translation,
            requestId,
        }
    }
}

const defaultChainArbitrator = supportedChains.find(it => it.id === defaultChain)?.defaultArbitrator

const RequestPage: NextPage = () => {
    const context = useAppContext()
    const { account, active, library, currentChain, nftProtectContract } = context
    const { listEvidences, getPeriod, isRuled: checkIsRuled } = useArbitrableProxy()
    const { query } = useRouter()
    const [ requestId, setRequestId ] = useState<BigNumber>()
    const [ requestData, setRequestData ] = useState<ActionRequest>()
    const [ requestGraphData, setRequestGraphData ] = useState<RequestGraphData>()
    const [ disputeData, setDisputeData ] = useState<DisputeGraphData>()
    const [ evidences, setEvidences ] = useState<EvidenceUpload[]>()
    const [ nft, setNft ] = useState<NFT>()
    const { getNftMetadata } = useAlchemy()
    const { getDispute } = useArbitratorGraph(currentChain?.id || defaultChain, currentChain?.defaultArbitrator || defaultChainArbitrator)
    const [ claimantAddress, setClaimaintAddress ] = useState<string>()
    const [ defendantAddress, setDefendantAddress ] = useState<string>()
    const [ error, setError ] = useState<string>()
    const { getRequest } = useNftProtectGraph()
    const [ period, setPeriod ] = useState<DisputePeriodData>()
    const { setBaseUrl } = useIPFSContext()
    const [ isRuled, setIsRuled ] = useState<boolean>(false)

    // setup ipfs endpoint
    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    const getBlockDate = async (blockNumber: number) => {
        const block = await library.getBlock(blockNumber)
        return timestampToDate(block.timestamp)
    }

    // Loads all submitted evidence data
    const loadEvidences = async () => {
        if (requestData && requestGraphData) {
            const evidences = await listEvidences(
                requestData.arbitratorId, 
                requestData.localDisputeId, 
                requestGraphData.createBlockNumber
            )
            const promises = evidences.map(async ({evidenceURI, blockNumber, submittedBy}) => {
                const uri = centralizeIpfsUrl(evidenceURI)
                const fetchResp = await fetch(uri)
                const evidenceJson = await fetchResp.json()
                const submitDate = await getBlockDate(blockNumber)
                return {
                    evidenceJson,
                    submitDate,
                    submittedBy
                }
            })
            const result = await Promise.all(promises)
            setEvidences(result)
        }
    }

    // Load a dispute period from arbitrableProxy -> arbitrator
    const loadPeriod = async () => {
        if (requestData) {
            const period = await getPeriod(requestData.arbitratorId, requestData.externalDisputeId)
            console.log('PERIOD:', period)
            setPeriod(period)
        }
    }

    // Load a dispute period from arbitrableProxy -> arbitrator
    const loadIsRuled = async () => {
        if (requestData) {
            const result = await checkIsRuled(requestData.arbitratorId, requestData.localDisputeId)
            console.log('IS RULED:', result)
            setIsRuled(result)
        }
    }

    // Process request params
    useEffect(() => {
        try {
            const pRequestId = BigNumber.from(query.requestId?.toString())
            setRequestId(pRequestId)
        } catch (ex) {
            console.error('Incorrect requestId', ex)
            setError(t`Incorrect requestId`)
        }
        let chainId: number = -1
        if (query.chainId) {
            try {
                chainId = parseInt(query.chainId?.toString())
            } catch (ex) {
                console.error('Incorrect chainId', ex)
                setError(t`Incorrect chainId`)
            }
        } else {
            chainId = defaultChain
        }
        if (chainId > -1) {
            const currentChain = supportedChains.find(it => it.id === chainId)
            if (currentChain) {
                context.setChainId(chainId)
            } else {
                console.error('Unsupported chain', chainId)
                setError(t`Unsupported chain`)
            }
            
        } else {
            console.error('Unsupported chain', chainId)
            setError(t`Unsupported chain`,)
        }
        console.log('INITIAL', chainId, requestId)
    }, [query])

    const loadNft = async (tokenId: BigNumber) => {
        const alchemyNft = await getNftMetadata([
            nftProtectContract.address,
            tokenId
        ])
        return new NFT(alchemyNft, context)
    }

    // Load NFT
    useEffect(() => {
        if (currentChain && requestId && (currentChain.id === parseInt(query?.chainId?.toString() || '-1'))) {
            let currentNFT: NFT
            const initialDataLoadedListener = () => {
                setNft(currentNFT)
            }
            let loadNftStarted = false
            // Fetch request data from The Graph
            getRequest(requestId).then((result: RequestGraphData|null) => {
                if (result === null) {
                    setError(t`Incorrect requestId`)
                } else {
                    setRequestGraphData(result)
                    if (!loadNftStarted) {
                        loadNft(result.tokenId).then((result) => {
                            currentNFT = result
                            currentNFT.addEventListener(NFTEvents.InitialNFTDataLoaded, initialDataLoadedListener)
                            currentNFT.loadInitialData()
                            currentNFT.loadPendingRequest() // TODO: remove because loading twice
                        })
                    }
                }
                loadNftStarted = true
            })
            nftProtectContract.requests(requestId.toString()).then((result: any) => {
                const resultRequest: ActionRequest = { id: requestId, ...result }
                setRequestData(resultRequest)
                if (!loadNftStarted) {
                    loadNft(resultRequest.tokenId).then((result) => {
                        currentNFT = result
                        currentNFT.addEventListener(NFTEvents.InitialNFTDataLoaded, initialDataLoadedListener)
                        currentNFT.loadInitialData()
                        currentNFT.pendingRequest = resultRequest
                    })
                }
                loadNftStarted = true
                if (resultRequest.externalDisputeId) {
                    getDispute(resultRequest.externalDisputeId).then((disputeData) => {
                        setDisputeData(disputeData)
                    })
                }
            })
            return () => {
                currentNFT && currentNFT.removeEventListener(NFTEvents.InitialNFTDataLoaded, initialDataLoadedListener)
            }
        }
    }, [requestId, currentChain])

    // Load original NFT data
    useEffect(() => {
        if (nft) {
            nft.loadOriginalNFTData()
            const originalNFTDataLoadedListener = () => {
                console.log('ORIGINAL NFT DATA:', nft.originalData)
                const claimantAddress = (requestData?.reqtype === ReqType.OwnershipAdjustment) ?
                                            nft.ownerAddress :
                                        (requestData?.reqtype === ReqType.OwnershipRestore) ?
                                            nft.originalData?.ownerAddress :
                                        undefined
                const defendantAddress = (requestData?.reqtype === ReqType.OwnershipAdjustment) ?
                                            nft.originalData?.ownerAddress :
                                        (requestData?.reqtype === ReqType.OwnershipRestore) ?
                                            nft.ownerAddress :
                                        undefined
                setClaimaintAddress(claimantAddress)
                setDefendantAddress(defendantAddress)
            }
            nft.addEventListener(NFTEvents.OriginalNFTDataLoaded, originalNFTDataLoadedListener)
            return () => {
                nft.removeEventListener(NFTEvents.OriginalNFTDataLoaded, originalNFTDataLoadedListener)
            }
        }
    }, [nft])

    // Load evidences
    useEffect(() => {
        if (currentChain) {
            loadEvidences()
        }
    }, [requestData, requestGraphData, currentChain])

    // Load period
    useEffect(() => {
        if (currentChain) {
            loadPeriod()
        }
    }, [requestData, currentChain])

    useEffect(() => {
        if (period?.period === Period.Execution) {
            loadIsRuled()
        }
    }, [period])
    
    useEffect(() => {
        if (requestData) {
            console.log("REQUEST DATA", requestData)
        }
    }, [requestData])

    useEffect(() => {
        if (requestGraphData) {
            console.log("REQUEST GRAPH DATA", requestGraphData)
        }
    }, [requestGraphData])

    useEffect(() => {
        if (nft) {
            console.log("NFT", nft)
        }
    }, [nft])

    const allRequiredLoaded = requestData && nft && claimantAddress && defendantAddress

    return (<>
        { currentChain && <Head>
            { requestId &&
                <meta name="description" content={t`The page of the court session in the Kleros decentralized court for the NFT Protect request #${requestId}.`} /> 
            }
            { requestId ? 
                <title>{t`NFT Protect • Request #${requestId}, ${currentChain.name}`}</title> :
                <title>{t`NFT Protect • Incorrect requestId`}</title> }
        </Head> }
        <Container 
            p={0}
            maxW="1920px"
            width={"auto"}
            h={"auto"}
            mx={'2em'}
        >
            { error && <h1>{error}</h1> }
            { !error && !allRequiredLoaded && <h1>Loading...</h1> }
            { !error && allRequiredLoaded && <>
                { !active && <ConnectButton
                    buttonVariant='primaryLight'
                    chainId={parseInt(query?.chainId?.toString() || '-1')}
                /> }
                <Box 
                    w="100%" 
                    h="45px" 
                    my='1em' 
                    bgColor='#940000'
                    color='white'
                    display='flex'
                    alignItems='center'
                    justifyContent={'center'}
                >
                    <WarningTwoIcon mx='0.5em'/>
                    <Text>
                        <Trans>In testnets, you need to manually <Link href={switchingManualURI} isExternal={true} target='_blank'><u>move the case</u></Link> from one stage to another.</Trans>
                    </Text>
                </Box>
                <KlerosCaseContent
                    metaEvidenceId={requestData.metaevidence}
                    nft={nft}
                    claimantAddress={claimantAddress}
                    defendantAddress={defendantAddress}
                    evidences={evidences}
                    contractAddress={evidences ? evidences[0]?.evidenceJson?.protocolAddress : undefined}
                    disputeData={disputeData}
                    disputeIsRuled={ isRuled }
                    requestType={requestData.reqtype}
                    requestStatus={requestData.status}
                />
            </>}
            {/* Dialogs registration flollowing */}
            {/* TODO: Evidences not reloading */}
            <AddEvidencesDialog onSubmitted={loadEvidences} />
            <EnforceRulingDialog onSubmitted={async () => {
                const request = await nft?.loadPendingRequest()
                request && setRequestData(request)
            }} />
        </Container>
    </>)
}

export default RequestPage;
