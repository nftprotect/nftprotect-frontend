import { useWeb3React } from '@web3-react/core'
import { supportedChains } from '../../utils/config'
import { switchNetwork } from '../../utils/helpers'
import { 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useAppContext } from '../../context/AppContextProvider';
import { useEffect } from 'react';

const NetworkMenu = () => {
    const { connector } = useWeb3React()
    const { currentChain } = useAppContext()
    const canSwitchNetwork = !(connector instanceof WalletConnectConnector)

    const handleChange = (e: any) => {
        const networkId = e.target.value
        switchNetwork(networkId)
    }

    return (
        <Menu>
            <MenuButton 
                as={Button}
                variant="primaryDark"
                rightIcon={canSwitchNetwork && <ChevronDownIcon />}
                fontWeight="400"
            >
                { (currentChain) ? currentChain?.name : 'Choose network' }
            </MenuButton>
            { canSwitchNetwork && <MenuList>
                    { supportedChains.map(({ name, id }) => (
                            <MenuItem
                                key={id}
                                value={id} 
                                onClick={handleChange}
                            >
                                { name }
                            </MenuItem>
                    )) }
                </MenuList>
            } 
        </Menu>
    )
}

export default NetworkMenu;