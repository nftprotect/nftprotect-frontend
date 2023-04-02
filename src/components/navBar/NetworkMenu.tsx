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
                rightIcon={canSwitchNetwork && <ChevronDownIcon />}
                py={[2, 4]}
                px={[3, 6]}
                mr={4}
                fontSize={['xs', 'sm', 'md']}
                bg="none"
                border="1px solid #FFF"
                borderRadius="13px"
                _hover={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
                _active={{
                    bgColor: "rgba(255, 255, 255, 0.15)"
                }}
            >
                { (currentChain) ? currentChain?.name : 'Choose network' }
            </MenuButton>
            { canSwitchNetwork && <MenuList bgColor="#000">
                    { supportedChains.map(({ name, id }) => (
                            <MenuItem
                                key={id}
                                value={id} 
                                onClick={handleChange}
                                fontSize={['xs', 'sm', 'md']}
                                bg="none"
                                _hover={{
                                    bgColor: "rgba(255, 255, 255, 0.15)"
                                }}
                                _active={{
                                    bgColor: "rgba(255, 255, 255, 0.15)"
                                }}
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