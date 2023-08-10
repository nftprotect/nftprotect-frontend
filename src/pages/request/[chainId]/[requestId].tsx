import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../../utils/lingui'
import { useEffect, useMemo, useState } from 'react'
import { defaultChain, nftpDeployBlockNumber, supportedChains } from '../../../utils/config'
import { BigNumber } from '@ethersproject/bignumber'
import { useAlchemy } from '../../../hooks/useAlchemy'
import NFT from '../../../classes/NFT'
import { useAppContext } from '../../../context/AppContextProvider'
import KlerosCaseContent, { EvidenceUpload } from '../../../components/dialogs/klerosCase/step/KlerosCaseContent'
import { metaEvidenceTypes } from '../../../utils/metaEvidence'
import { NFTEvents } from '../../../classes/NFT'
import { Trans, t } from '@lingui/macro'
import { ReqType, ReqStatus, useNftProtectGraph, RequestGraphData } from '../../../hooks/useNftProtectGraph'
import { Container } from '@chakra-ui/react'
import { ActionRequest } from '../../../classes/NFT'
import { useArbitrableProxy, DisputePeriodData } from '../../../hooks/useArbitrableProxy'
import { centralizeIpfsUrl } from '../../../utils/ipfs'
import { timestampToDate } from '../../../utils/helpers'
import { DisputeGraphData, useArbitratorGraph } from '../../../hooks/useArbitratorGraph'
import AddEvidencesDialog from '../../../components/dialogs/request/AddEvidencesDialog'
import { useIPFSContext } from '../../../context/IPFSContextProvider'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../../../utils/connectors'
import LoginForm from '../../../components/loginForm/LoginForm'
import EnforceRulingDialog from '../../../components/dialogs/request/EnforceRulingDialog'
import Head from 'next/head'

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
    const { activate } = useWeb3React()
    const { listEvidences, getPeriod } = useArbitrableProxy()
    const { query } = useRouter()
    const [ requestId, setRequestId ] = useState<BigNumber>()
    const [ requestData, setRequestData ] = useState<ActionRequest>()
    const [ requestGraphData, setRequestGraphData ] = useState<RequestGraphData>()
    const [ disputeData, setDisputeData ] = useState<DisputeGraphData>()
    const [ evidences, setEvidences ] = useState<EvidenceUpload[]>()
    const [ nft, setNft ] = useState<NFT>()
    const { getNftMetadata } = useAlchemy()
    const { getDispute } = useArbitratorGraph(currentChain?.id || defaultChain, currentChain?.defaultArbitrator || defaultChainArbitrator)
    //const pageData = metaEvidenceTypes.find(item => item.value === requestData?.)
    const [ claimantAddress, setClaimaintAddress ] = useState<string>()
    const [ defendantAddress, setDefendantAddress ] = useState<string>()
    const [ error, setError ] = useState<string>()
    const metaEvidenceType = useMemo(() => {
        let meType = requestData?.metaevidence
        return metaEvidenceTypes.find( item => item.value === meType?.toString() )
    }, [requestData])
    const { getRequest } = useNftProtectGraph()
    const [ period, setPeriod ] = useState<DisputePeriodData>()
    const { setBaseUrl } = useIPFSContext()

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
        if (requestData) {
            const evidences = await listEvidences(
                requestData.arbitratorId, 
                requestData.localDisputeId, 
                requestGraphData?.createBlockNumber || nftpDeployBlockNumber
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
        if (currentChain && requestId && library) {
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
            nftProtectContract.requests(requestId.toString()).then((resultRequest: ActionRequest) => {
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
    }, [requestId, library, currentChain])

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

    // Load evidences and period
    useEffect(() => {
        if (currentChain) {
            loadEvidences()
            loadPeriod()
        }
    }, [requestData, currentChain])

    useEffect(() => {
        if (requestData) {
            console.log("REQUEST DATA", requestData)
        }
    }, [requestData])

    useEffect(() => {
        if (nft) {
            console.log("NFT", nft)
        }
    }, [nft])

    const allRequiredLoaded = requestData && nft && metaEvidenceType && claimantAddress && defendantAddress

    return (<>
        { currentChain && <Head>
            { requestId ? 
                <title>{t`NFT Protect App: Request #${requestId}, ${currentChain.name}`}</title> :
                <title>{t`NFT Protect App: Incorrect requestId`}</title> }
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
            { !active && <LoginForm buttonVariant={'primaryLight'} /> }
            <KlerosCaseContent
                metaEvidenceId={parseInt(metaEvidenceType.value)}
                nft={nft}
                claimantAddress={claimantAddress}
                defendantAddress={defendantAddress}
                evidences={evidences}
                disputeData={disputeData}
                requestType={requestData.reqtype}
                requestStatus={requestData.status}
                pageData={ metaEvidenceType.page }
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
