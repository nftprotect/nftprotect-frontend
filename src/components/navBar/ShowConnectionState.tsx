import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from "@ethersproject/units"
import { formatAddress, copyTextToClipboard } from '../../utils/helpers'
import { 
    Card, 
    CardBody,
    Heading,
    Text,
    Box,
    Button,
    Menu,
    MenuButton,
    MenuGroup,
    MenuList,
    MenuItem
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'

const ShowConnectionState = () => {

    const { chainId, account, active, deactivate, library} = useWeb3React<Web3Provider>()
    const [ethBalance, setEthBalance] = useState<number | undefined>(undefined)

    useEffect(() => {
        if(active && account){
            library?.getBalance(account).then((result)=>{
                setEthBalance(Number(formatEther(result)))
            })
        }
        console.log(chainId, account, active)
    })

    const onClickDisconnect = () => {
        deactivate()
    }

    const copyAccountToClipboard = () => {
        copyTextToClipboard(account || '')
        alert('Copied!')
    }

    return (
        <Menu>
            <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />}
            >
                {active && typeof account === 'string' ? (
                    <div>{ formatAddress(account, 4) }</div>
                ) : (
                    <p>Connect</p>
                )}
            </MenuButton>
            <MenuList>
                <MenuGroup title='Account'>
                    <MenuItem>{ formatAddress(account || '', 8) }</MenuItem>
                    <MenuItem onClick={ copyAccountToClipboard }>Copy address</MenuItem>
                    <MenuItem onClick={ onClickDisconnect }>Disconnect</MenuItem>
                </MenuGroup>
                <MenuGroup title='Balance'>
                    <MenuItem>{ ethBalance } ETH</MenuItem>
                </MenuGroup>
            </MenuList>
        </Menu>
    )
  }

export default ShowConnectionState