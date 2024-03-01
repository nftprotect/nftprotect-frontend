import { 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useAccount, useSwitchChain } from 'wagmi';
import { t } from '@lingui/macro';

const NetworkMenu = () => {
    const { chain } = useAccount()
    const { switchChain, chains } = useSwitchChain()

    const handleChange = (e: any) => {
        const chainId = e.target.value
        switchChain?.({chainId})
    }
    const icon =  <ChevronDownIcon />

    return (
        <Menu>
            <MenuButton 
                as={Button}
                variant="primaryDark"
                rightIcon={icon}
                fontWeight="400"
            >
                { (chain) ? chain?.name : t`Choose network` }
            </MenuButton>
            { <MenuList>
                    { chains.map(({ name, id }) => (
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