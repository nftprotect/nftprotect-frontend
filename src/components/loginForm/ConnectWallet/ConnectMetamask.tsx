import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { injected } from '../../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { UnsupportedChainIdError } from '@web3-react/core'
import { switchNetwork } from '../../../utils/helpers'
import { Button } from '@chakra-ui/react'
import {Metamask} from '@web3uikit/icons'
import { useWizard } from 'react-use-wizard';
import { useEffect } from 'react'
import { useAppContext } from '../../../context/AppContextProvider'
import { supportedChains } from '../../../utils/config'
import { t } from '@lingui/macro'

const ConnectMetamask = ({onClose}: any) => {

    const { activate, deactivate, setError, active } = useWeb3React<Web3Provider>()
    const { defaultChain, currentChain } = useAppContext()
    const { nextStep } = useWizard()
    const onClickConnect = async () => {
        nextStep()
        activate(injected,(error) => {
            if (error instanceof UserRejectedRequestError) {
                // ignore user rejected error
                console.log("user refused")
            } else if (error instanceof UnsupportedChainIdError) {
                onClose()
                const networkNames = supportedChains.map(it => it.name).join(', ')
                alert(t`Please switch to one of these networks: ${networkNames}`)
                deactivate()
            } else {
                console.log(error)
                setError(error)
            }
        }, false)
    }

    const onClickDisconnect = () => {
        deactivate()
    }

    useEffect(() => {
        if (active) {
            nextStep()
        }
    }, [active])

    return (
        <Button
            variant='primaryOutline'
            onClick={active ? onClickDisconnect : onClickConnect}
            leftIcon={<Metamask fontSize='20px'/>}
            w={['15em']}
            mb={[4, 8]}
            justifyContent="flex-start"
        >
            MetaMask
        </Button>
    )
}

export default ConnectMetamask