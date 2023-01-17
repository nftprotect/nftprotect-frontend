import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { injected } from '../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { formatAddress } from '../../utils/helpers'
import { Button } from '@chakra-ui/react'
import {Metamask} from '@web3uikit/icons'

const ConnectMetamask = () => {

    const { chainId, account, activate, deactivate, setError, active,library ,connector} = useWeb3React<Web3Provider>()

    const onClickConnect = async () => {
        activate(injected,(error) => {
            if (error instanceof UserRejectedRequestError) {
                // ignore user rejected error
                console.log("user refused")
            } else {
                setError(error)
            }
        }, false)
    }

    const onClickDisconnect = () => {
        deactivate()
    }

    return (
        <div>
            {active && typeof account === 'string' ? (
                <div>  
                    <Button
                        type="button" 
                        onClick={onClickDisconnect}
                    >
                        {formatAddress(account,4)}
                    </Button>
                </div>
            ) : (
                <div>
                    <Button 
                        type="button" 
                        onClick={onClickConnect}
                        leftIcon={<Metamask fontSize='20px'/>}
                    >
                        MetaMask
                    </Button>
                </div>  
            )}
        </div>
    )
}

export default ConnectMetamask