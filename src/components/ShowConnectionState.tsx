import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const ShowConnectionState = () => {

    const { chainId, account, active, library, connector} = useWeb3React<Web3Provider>()

    useEffect(() => {
        console.log(chainId, account, active, library, connector)
    })

    return (
        <div>
            {active && typeof account === 'string' ? (
                <p>ChainID: {chainId} connected</p>
            ) : (
                <p> not connected </p>
            )}
        </div>
    )
  }

export default ShowConnectionState