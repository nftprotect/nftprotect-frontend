import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const ShowConnectionState = () => {

    const { chainId, account, active, deactivate, library, connector} = useWeb3React<Web3Provider>()

    useEffect(() => {
        console.log(chainId, account, active, library, connector)
    })

    const onClickDisconnect = () => {
        deactivate()
    }

    return (
        <div>
            {active && typeof account === 'string' ? (
                <p onClick={onClickDisconnect}>ChainID: {chainId} connected</p>
            ) : (
                <p> not connected </p>
            )}
        </div>
    )
  }

export default ShowConnectionState