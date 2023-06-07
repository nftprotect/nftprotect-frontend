import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../utils/lingui'
import { useEffect, useMemo, useState } from 'react'
import { defaultArbitrator, defaultChain } from '../../utils/config'
import { BigNumber } from '@ethersproject/bignumber'
import { nftpContractAddress } from '../../utils/config'
import NFTProtectABI from '../../abi/NFTProtectABI'
import { Contract } from '@ethersproject/contracts'
import { useAlchemy } from '../../hooks/useAlchemy'
import NFT from '../../classes/NFT'
import { useAppContext } from '../../context/AppContextProvider'
import KlerosCaseContent, { EvidenceUpload } from '../../components/dialogs/klerosCase/step/KlerosCaseContent'
import { metaEvidenceTypes } from '../../utils/metaEvidence'
import { NFTEvents } from '../../classes/NFT'
import { Trans, t } from '@lingui/macro'
import { ReqType, ReqStatus } from '../../hooks/useNftProtectGraph'
import { Container } from '@chakra-ui/react'
import { ActionRequest } from '../../classes/NFT'
import { useArbitrableProxy } from '../../hooks/useArbitrableProxy'
import { centralizeIpfsUrl } from '../../utils/ipfs'

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

const RequestPage: NextPage = () => {
    const context = useAppContext()
    const { account, library, currentChain } = context
    const { listEvidences } = useArbitrableProxy()
    const { query } = useRouter()
    const [ requestId, setRequestId ] = useState<BigNumber>()
    const [ requestData, setRequestData ] = useState<ActionRequest>()
    const [ evidences, setEvidences ] = useState<EvidenceUpload[]>()
    const [ nft, setNft ] = useState<NFT>()
    const { getNftMetadata } = useAlchemy(currentChain?.alchemyId)
    //const pageData = metaEvidenceTypes.find(item => item.value === requestData?.)
    const [ claimantAddress, setClaimaintAddress ] = useState<string>()
    const [ defendantAddress, setDefendantAddress ] = useState<string>()
    const [ error, setError ] = useState<string>()
    const metaEvidenceType = useMemo(() => {
        let meType = requestData?.metaevidence
        // temporarily workaround contract mistake
        meType = (meType === 3) ? 4 : meType
        return metaEvidenceTypes.find( item => item.value === meType?.toString() )
    }, [requestData])

    const getBlockDate = async (blockNumber: number) => {
        const block = await library.getBlock(blockNumber)
        return new Date(block.timestamp * 1000)
    }

    // Loads all submitted evidence data
    const loadEvidences = async () => {
        if (requestData) {
            const evidences = await listEvidences(requestData.arbitratorId, requestData.localDisputeId, 9083542)
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
                setError(t`Incorrect requestId`)
            }
        } else {
            chainId = defaultChain
        }
        if (chainId > -1) {
            context.setChainId(chainId)
        } else {
            console.error('Unsupported chain', chainId)
            setError(t`Unsupported chain`)
        }
    }, [query])

    // Load NFT
    useEffect(() => {
        console.log(currentChain, requestId, library)
        if (currentChain && requestId && library) {
            const nftProtectContract = new Contract(nftpContractAddress, NFTProtectABI, library)
            let currentNFT: NFT
            const initialDataLoadedListener = () => {
                setNft(currentNFT)
            }
            nftProtectContract.requests(requestId.toString()).then((result: ActionRequest) => {
                setRequestData(result)
                getNftMetadata && getNftMetadata([
                    nftProtectContract.address,
                    result.tokenId
                ]).then((alchemyNft) => {
                    currentNFT = new NFT(alchemyNft, context)
                    currentNFT.addEventListener(NFTEvents.InitialNFTDataLoaded, initialDataLoadedListener)
                    currentNFT.loadInitialData()
                    
                })
            })
            return () => {
                currentNFT && currentNFT.removeEventListener(NFTEvents.InitialNFTDataLoaded, initialDataLoadedListener)
            }
        }
    }, [requestId, library])

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
        loadEvidences()
    }, [requestData])

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

    return (
        <Container 
            p={0}
            maxW="1920px"
            width={"auto"}
            h={"auto"}
            mx={'2em'}
        >
            { error && <h1>{error}</h1> }
            { !error && !(requestData && nft && metaEvidenceType) && <h1>Loading...</h1> }
            { !error && requestData && nft && metaEvidenceType && <KlerosCaseContent
                stepKey={''}
                metaEvidenceId={parseInt(metaEvidenceType.value)}
                nft={nft}
                claimantAddress={claimantAddress || t`Loading...`}
                defendantAddress={defendantAddress || t`Loading...`}
                evidences={evidences}
                disputeData={{disputeId: requestData.externalDisputeId}}
                pageData={ metaEvidenceType.page }
            />}
        </Container>
    )
}

export default RequestPage;
