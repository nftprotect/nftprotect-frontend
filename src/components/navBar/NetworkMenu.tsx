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

interface ProviderError {
    code: number,
    message: string
}


const NetworkMenu = () => {
      const { chainId, setError } = useWeb3React()
      const currentNetwork = supportedChains.find(it => it.id == chainId)
  
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
                rightIcon={<ChevronDownIcon />}
            >{ currentNetwork?.name }</MenuButton>
            <MenuList>
                { supportedChains.map(({ name, id }) => (
                        <MenuItem key={id} value={id} onClick={handleChange}>
                            { name }
                        </MenuItem>
                )) }
                </MenuList>
        </Menu>
    )
}
  
  export default NetworkMenu;