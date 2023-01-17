import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { walletConnect } from '../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector'
import { formatAddress } from '../../utils/helpers'
import { Button } from '@chakra-ui/react'
import { Wallet } from '@web3uikit/icons'
const ConnectWalletConnect = () => {

    const { chainId, account, activate, deactivate, setError, active,library ,connector} = useWeb3React<Web3Provider>()

    const onClickConnect = () => {
        activate(walletConnect,(error) => {
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
        <Button 
            type="button" 
            onClick={active ? onClickDisconnect : onClickConnect}
            leftIcon={<Wallet fontSize='20px'/>}
        >
            WalletConnect
        </Button>
    )
}

export default ConnectWalletConnect