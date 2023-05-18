import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../utils/lingui'
import { useEffect, useState } from 'react'
import { defaultChain } from '../../utils/config'
import { BigNumber } from '@ethersproject/bignumber'

export const getServerSideProps: GetServerSideProps = async ({ params, locale } ) => {
    const requestId = params?.requestId
    const chainId = params?.chainId
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
    const { query } = useRouter()
    const [ requestId, setRequestId ] = useState<BigNumber>()
    const [ chainId, setChainId ] = useState<number>()

    useEffect(() => {
        try {
            const pRequestId = BigNumber.from(query.requestId?.toString())
            setRequestId(pRequestId)
        } catch (ex) {
            console.error('Incorrect requestId', ex)
        }
        let pChainId
        if (query.chainId) {
            try {
                pChainId = parseInt(query.chainId?.toString())
            } catch (ex) {
                console.error('Incorrect chainId', ex)
                pChainId = defaultChain
            }
        } else {
            pChainId = defaultChain
        }
        setChainId(pChainId)
    }, [])

    useEffect(() => {
        console.log(requestId, chainId)
    }, [requestId, chainId])

    return (<>
        { requestId && <div>
            <h1>Страница запроса {query.requestId}</h1>
        </div> }
        { !requestId && <h1>Wrong request</h1> }
    </>)
}

export default RequestPage;
