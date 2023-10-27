import { 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { t } from '@lingui/macro';

const NetworkMenu = () => {
    const { chain, chains } = useNetwork()
    const { switchNetwork } = useSwitchNetwork()
    const canSwitchNetwork = switchNetwork ? true : false

    const handleChange = (e: any) => {
        const networkId = e.target.value
        switchNetwork?.(networkId)
    }
    const icon = canSwitchNetwork ? <ChevronDownIcon /> : undefined

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
            { canSwitchNetwork && <MenuList>
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