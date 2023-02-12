import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { injected } from '../../../utils/connectors'
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { formatAddress } from '../../../utils/helpers'
import { Button } from '@chakra-ui/react'
import {Metamask} from '@web3uikit/icons'
import { useWizard } from 'react-use-wizard';
import { useEffect } from 'react'

const ConnectMetamask = () => {

    const { activate, deactivate, setError, active } = useWeb3React<Web3Provider>()
    const { nextStep } = useWizard()
    const onClickConnect = async () => {
        
        nextStep()
        
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

    useEffect(() => {
        if (active) {
            nextStep()
        }
    }, [active])

    return (
        <Button
            my={2}
            justifyContent="flex-start"
            type="button" 
            onClick={active ? onClickDisconnect : onClickConnect}
            leftIcon={<Metamask fontSize='20px'/>}
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="22px"
            fontSize={['xs', 'sm', 'md', 'lg']}
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
            w={['15em']}
        >
            MetaMask
        </Button>
    )
}

export default ConnectMetamask