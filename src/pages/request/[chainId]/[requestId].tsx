import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../../utils/lingui'
import { useEffect, useMemo, useState } from 'react'
import { supportedChains, switchingManualURI } from '../../../config'
import { useAlchemy } from '../../../hooks/useAlchemy'
import NFT from '../../../classes/NFT'
import { useAppContext } from '../../../context/AppContextProvider'
import KlerosCaseContent, { EvidenceUpload } from '../../../components/dialogs/klerosCase/step/KlerosCaseContent'
import { Trans, t } from '@lingui/macro'
import { useNftProtectGraph, RequestGraphData, convertTokenGraphData } from '../../../hooks/useNftProtectGraph'
import { chakra, Box, Container, Grid, GridItem, Link, Text } from '@chakra-ui/react'
import { useArbitrableProxy, DisputePeriodData } from '../../../hooks/useArbitrableProxy'
import { centralizeIpfsUrl } from '../../../utils/ipfs'
import { timestampToDate } from '../../../utils/helpers'
import { DisputeGraphData, Period, useArbitratorGraph } from '../../../hooks/useArbitratorGraph'
import AddEvidencesDialog from '../../../components/dialogs/request/AddEvidencesDialog'
import { useIPFSContext } from '../../../context/IPFSContextProvider'
import EnforceRulingDialog from '../../../components/dialogs/request/EnforceRulingDialog'
import Head from 'next/head'
import { WarningTwoIcon } from '@chakra-ui/icons'
import NavBar from '../../../components/navBar/NavBar'
import Footer from '../../../components/footer/Footer'
import useNftProtect, { ActionRequest, ReqType } from '../../../hooks/useNftProtect'
import { getBlock } from 'viem/actions'
import { usePublicClient } from 'wagmi'

export const getServerSideProps: GetServerSideProps = async ({ params, locale } ) => {
    const translation = await loadTranslation(
        locale!,
        process.env.NODE_ENV === 'production'
    )
    return {
        props: {
            translation
        }
    }
}

const RequestPage: NextPage = () => {
    const { defaultChain, setChainId, isCorrectChain } = useAppContext()
    const { query } = useRouter()
    // Processing query params
    const { requestId, selectedChain, error: initialError } = useMemo(() => {
        let error = undefined;
        let requestId: bigint | undefined;
        let chainId: number | undefined;
    
        try {
            requestId = BigInt(query.requestId!.toString());
        } catch (ex) {
            console.error('Incorrect requestId', ex);
            error = t`Incorrect requestId`;
        }
    
        if (query.chainId) {
            try {
                chainId = parseInt(query.chainId?.toString());
            } catch (ex) {
                console.error('Incorrect chainId', ex);
                error = t`Incorrect chainId`;
            }
        } else {
            console.error('No chainId provided');
            error = t`No chainId provided`;
        }
    
        const selectedChain = (chainId !== undefined) ?
            supportedChains.find(it => it.id === chainId) :
            undefined;
        if (!selectedChain) {
            console.error('Unsupported chain', chainId);
            error = t`Unsupported chain`;
        }
    
        return { requestId, selectedChain, error };
    }, [query]);

    const { listEvidences, getPeriod, isRuled: checkIsRuled } = useArbitrableProxy(selectedChain?.id || defaultChain.id)
    const { getRequestByTokenId, getRequest: getRequestOnchain } = useNftProtect(selectedChain?.id || defaultChain.id)

    const [ requestData, setRequestData ] = useState<ActionRequest>()
    const [ requestGraphData, setRequestGraphData ] = useState<RequestGraphData>()
    const [ disputeData, setDisputeData ] = useState<DisputeGraphData>()
    const [ evidences, setEvidences ] = useState<EvidenceUpload[]>()
    const [ nft, setNft ] = useState<NFT>()
    const { nft: nftApi } = useAlchemy()
    const { getDispute } = useArbitratorGraph(selectedChain?.id || defaultChain.id, selectedChain?.defaultArbitrator || defaultChain.defaultArbitrator)
    const [ claimantAddress, setClaimaintAddress ] = useState<string>()
    const [ defendantAddress, setDefendantAddress ] = useState<string>()
    const [ error, setError ] = useState<string|undefined>(initialError)
    const { getToken, getRequest } = useNftProtectGraph(selectedChain?.id || defaultChain.id)
    const [ period, setPeriod ] = useState<DisputePeriodData>()
    const { setBaseUrl } = useIPFSContext()
    const [ isRuled, setIsRuled ] = useState<boolean>(false)
    const publicClient  = usePublicClient({chainId: selectedChain?.id || defaultChain.id })

    // setup ipfs endpoint
    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    const getBlockDate = async (blockNumber: string|number) => {
        const block = await getBlock(publicClient!, {blockNumber: BigInt(blockNumber)})
        return timestampToDate(Number(block.timestamp))
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

    // Set selected chain globally
    useEffect(() => {
        selectedChain && setChainId(selectedChain.id)
    }, [selectedChain])

    const loadNft = async (tokenId: bigint, params?: Partial<NFT>) => {
        const alchemyNft = await nftApi.getNftMetadata(
            selectedChain!.nftpContractAddress,
            tokenId
        )
        return alchemyNft ?
            new NFT(alchemyNft, params) :
            undefined
    }

    // Load Request and NFT
    useEffect(() => {
        const fetchData = async () => {
            if ( requestId && selectedChain ) {
                let currentNFT: NFT|undefined
                // Fetch request data from The Graph
                const graphRequest: RequestGraphData|null = await getRequest(requestId)
                const contractRequest: ActionRequest|null = await getRequestOnchain(requestId)

                if (!graphRequest && !contractRequest) {
                    setError(t`Incorrect requestId`)
                } else if (!graphRequest || !contractRequest) {
                    setError(t`Error loading request`)
                } else {
                    setRequestData(contractRequest)

                    // If there's a dispute, load it
                    if (contractRequest.externalDisputeId) {
                        getDispute(contractRequest.externalDisputeId).then((disputeData) => {
                            setDisputeData(disputeData)
                        })
                    }
                    setRequestGraphData(graphRequest)
                    const nftData = await getToken(graphRequest.tokenId)
                    if (!nftData) {
                        setError(t`Error loading token data`)
                        return
                    }
                    const tokenData = convertTokenGraphData(nftData)
                    currentNFT = await loadNft(graphRequest.tokenId, {...tokenData, pendingRequest: contractRequest})
                    if (!currentNFT) {
                        setError(t`Error loading token data`)
                        return
                    }
                    setNft(currentNFT)

                    // Set claimant and defendant addresses
                    const claimantAddress = (contractRequest.reqtype === ReqType.OwnershipAdjustment) ?
                                    currentNFT.ownerAddress :
                                    (contractRequest.reqtype === ReqType.OwnershipRestore) ?
                                        currentNFT.originalData!.ownerAddress :
                                    undefined
                    const defendantAddress = (contractRequest.reqtype === ReqType.OwnershipAdjustment) ?
                                    currentNFT.originalData!.ownerAddress :
                                    (contractRequest.reqtype === ReqType.OwnershipRestore) ?
                                        currentNFT.ownerAddress :
                                    undefined
                    setClaimaintAddress(claimantAddress)
                    setDefendantAddress(defendantAddress)
                }
            }
        }
        fetchData()
    }, [requestId, selectedChain])

    // Load evidences
    useEffect(() => {
        if (selectedChain) {
            loadEvidences()
        }
    }, [requestData, requestGraphData, selectedChain])

    // Load period
    useEffect(() => {
        if ( selectedChain ) {
            loadPeriod()
        }
    }, [requestData, selectedChain])

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

    const allRequiredLoaded = selectedChain && requestData && nft && claimantAddress && defendantAddress

    return (<>
        { selectedChain && <Head>
            { requestId ?
                <meta name="description" content={t`The page of the court session in the Kleros decentralized court for the NFT Protect request #${requestId!.toString()}.`} /> :
                ''
            }
            { requestId ? 
                <title>{t`NFT Protect • Request #${requestId}, ${selectedChain.name}`}</title> :
                <title>{t`NFT Protect • Incorrect requestId`}</title> }
        </Head> }
        <Grid
            templateAreas={
                            `"nav"
                            "main"
                            "footer"`
                        }
            gridTemplateRows={ "60px 1fr 60px" }
            gridTemplateColumns={"1fr"}
            maxW="1920px"
            minH="100vh"
            p={0}
            mx="auto"
            flexDirection="column"
            position="relative"
        >
            <GridItem
                area={"nav"}
                position="sticky"
                top="0"
                zIndex="1"
                bgColor="brand.light"
                color="#FFF"
                w="100%"
                display="flex"
            >
                <NavBar />
            </GridItem>
            <GridItem area={"main"}  w={'100vw'} >
                <chakra.main>
                    { error && <Text textStyle={"h3"} m={{base: "1rem", md: "2rem"}} >
                        {error}
                    </Text> }
                    { !error && !allRequiredLoaded && <Text textStyle={"h3"} m={{base: "1rem", md: "2rem"}}>
                        {/* TODO: We have loading always when not logged in! */}
                        <Trans>Loading...</Trans>
                    </Text> }
                    { !error && allRequiredLoaded && <>
                        <Box 
                            w="100%" 
                            h="45px" 
                            mb='2rem' 
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
                        <Box mx={{base: "1rem", md: "2rem"}}>
                            <KlerosCaseContent
                                selectedChain={selectedChain}
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
                        </Box>
                    </>}
                    {/* Dialogs registration flollowing */}
                    {/* TODO: Evidences not reloading */}
                    <AddEvidencesDialog onSubmitted={loadEvidences} />
                    <EnforceRulingDialog onSubmitted={async () => {
                        const action = async () => {
                            nft!.pendingRequest = await getRequestByTokenId(nft!.tokenId) || undefined
                            setNft(nft)
                            setRequestData(nft!.pendingRequest)
                        }
                        action();
                    }} />
                </chakra.main>
            </GridItem>
            <GridItem area={"footer"}>
                <Footer />
            </GridItem>
        </Grid>
    </>)
}

export default RequestPage;
