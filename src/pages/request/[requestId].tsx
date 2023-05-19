import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../utils/lingui'
import { useEffect, useState } from 'react'
import { defaultChain } from '../../utils/config'
import { BigNumber } from '@ethersproject/bignumber'
import { nftpContractAddress } from '../../utils/config'
import NFTProtectABI from '../../abi/NFTProtectABI'
import { Contract } from '@ethersproject/contracts'
import { useAlchemy } from '../../hooks/useAlchemy'
import NFT from '../../classes/NFT'
import { useAppContext } from '../../context/AppContextProvider'
import KlerosCaseContent from '../../components/dialogs/klerosCase/step/KlerosCaseContent'
import { metaEvidenceTypes } from '../../utils/metaEvidence'

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

enum RequestType {
    OwnershipAdjustment,
    OwnershipRestore,
    Burn
}

enum RequestStatus {
    Initial,
    Accepted,
    Rejected,
    Disputed
}

interface Request {
    reqtype: RequestType, 
    tokenId: BigNumber,
    newowner: String,
    timeout: BigNumber,
    status: RequestStatus,
    arbitratorId: BigNumber,
    localDisputeId: BigNumber,
    externalDisputeId: BigNumber
}

const RequestPage: NextPage = () => {
    const context = useAppContext()
    const { account, library, currentChain } = context
    const { query } = useRouter()
    const [ requestId, setRequestId ] = useState<BigNumber>()
    const [ requestData, setRequestData ] = useState<Request>()
    const [ nft, setNft ] = useState<NFT>()
    const { getNftMetadata } = useAlchemy(currentChain?.alchemyId)
    //const pageData = metaEvidenceTypes.find(item => item.value === requestData?.)

    useEffect(() => {
        try {
            const pRequestId = BigNumber.from(query.requestId?.toString())
            setRequestId(pRequestId)
        } catch (ex) {
            console.error('Incorrect requestId', ex)
        }
        let chainId: number
        if (query.chainId) {
            try {
                chainId = parseInt(query.chainId?.toString())
            } catch (ex) {
                console.error('Incorrect chainId', ex)
                chainId = defaultChain
            }
        } else {
            chainId = defaultChain
        }
        if (chainId) {
            context.setChainId(chainId)
        } else {
            console.error('Unsupported chain', chainId)
        }
    }, [query])

    useEffect(() => {
        console.log(currentChain, requestId, library)
        if (currentChain && requestId && library) {
            const nftProtectContract = new Contract(nftpContractAddress, NFTProtectABI, library)
            nftProtectContract.requests(requestId.toString()).then((result: Request) => {
                setRequestData(result)
                getNftMetadata && getNftMetadata([
                    nftProtectContract.address,
                    result.tokenId
                ]).then((alchemyNft) => {
                    const currentNFT = new NFT(alchemyNft, context)
                    currentNFT.loadInitialData()
                    setNft(currentNFT)
                })
            })
        }
    }, [requestId, library])

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

    return (<>
        { !requestId && <h1>Wrong request</h1> }
        { requestData && nft && <KlerosCaseContent
            stepKey={''}
            nft={nft}
            claimantAddress='0xSCAMMER'
            defendantAddress='0xVICTIM'
            caseDescription='efsdf'
            evidences={[]}
            disputeData={{disputeId: requestData.externalDisputeId}}
            pageData={{}}
        />}
    </>)
}

export default RequestPage;
