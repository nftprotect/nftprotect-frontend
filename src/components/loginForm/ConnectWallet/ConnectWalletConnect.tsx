import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { walletConnect } from '../../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector'
import { formatAddress } from '../../../utils/helpers'
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
            py={2}
            px={4}
            my={2}
            justifyContent="flex-start"
            type="button" 
            onClick={active ? onClickDisconnect : onClickConnect}
            leftIcon={<Wallet fontSize='20px'/>}
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="22px"
            fontSize={['xs', 'sm', 'md', 'lg']}
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
            }}
        >
            WalletConnect
        </Button>
    )
}

export default ConnectWalletConnect