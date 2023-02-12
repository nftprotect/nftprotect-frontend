import { useWeb3React } from '@web3-react/core'
import { hexValue } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { supportedChains } from '../../utils/config'
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

interface ProviderError {
    code: number,
    message: string
}

const NetworkMenu = () => {
    const { connector } = useWeb3React()
    const { currentChain } = useAppContext()
    const canSwitchNetwork = !(connector instanceof WalletConnectConnector)

    const handleChange = async (e: any) => {
        const networkId = e.target.value
        // check if the user is connected through MetaMask
        if (window.ethereum?.request !== undefined) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: hexValue(BigNumber.from(networkId).toHexString()) }],
                });
            } catch (error) {
                const e = error as ProviderError
                if (e?.code === 4902) {
                    console.log(error)
                    alert('Add network first!')
                } else {
                    console.error(error)
                }
            }
        }
    }

    return (
        <Menu>
            <MenuButton 
                as={Button}
                rightIcon={canSwitchNetwork && <ChevronDownIcon />}
                py={[2, 4]}
                px={[3, 6]}
                my={2}
                mr={2}
                fontSize={['xs', 'sm', 'md']}
                bg="none"
                _active={{
                    borderRadius: "13px",
                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                    color: "#FFF"
                }}
                _hover={{
                    border: "2px",
                    borderColor: "#BC9CFF",
                    borderRadius: "13px",
                }}
            >
                { (currentChain) ? currentChain?.name : 'Choose network' }
            </MenuButton>
            { canSwitchNetwork && <MenuList>
                    { supportedChains.map(({ name, id }) => (
                            <MenuItem
                                key={id}
                                value={id} 
                                onClick={handleChange}
                                borderRadius="13px"
                                fontSize={['xs', 'sm', 'md']}
                                _hover={{
                                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
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