import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { walletConnect } from '../../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector'
import { UnsupportedChainIdError } from '@web3-react/core'
import { formatAddress } from '../../../utils/helpers'
import { Button, Box } from '@chakra-ui/react'
import { Wallet } from '@web3uikit/icons'
import { useAppContext } from '../../../context/AppContextProvider'
import { t } from '@lingui/macro'

const ConnectWalletConnect = ({onClose}: any) => {

    const { activate, deactivate, setError, active } = useWeb3React<Web3Provider>()
    const { defaultChain } = useAppContext()

    const onClickConnect = () => {
        const defaultChainName = defaultChain?.name
        activate(walletConnect,(error) => {
            if (error instanceof UserRejectedRequestError) {
                // ignore user rejected error
                console.log("user refused")
            } else if (error instanceof UnsupportedChainIdError) {
                onClose()
                alert(t`Please switch to ${defaultChainName} network!`)
                deactivate()
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
            onClick={active ? onClickDisconnect : onClickConnect}
            variant='primaryOutline'
            w={['15em']}
            leftIcon={<Wallet fontSize='20px'/>}
            justifyContent="flex-start"
        >
            WalletConnect
        </Button>
    )
}

export default ConnectWalletConnect