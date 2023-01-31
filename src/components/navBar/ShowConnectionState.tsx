import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from "@ethersproject/units"
import { formatAddress, copyTextToClipboard } from '../../utils/helpers'
import LoginForm from '../loginForm/LoginForm'
import {
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

    if(!active) {
        return (
            <LoginForm mt={[8]}/>
        )
        
    } else {
        return (
            <Menu>
                <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    borderRadius="22px"
                    textTransform="uppercase"
                    fontSize={['xs', 'sm', 'md']}
                    py={[2, 4]}
                    px={[3, 6]}
                    my={2}
                    mr={2}
                    bg="none"
                    _hover={{
                        border: "2px",
                        borderColor: "#BC9CFF",
                        borderRadius: "13px",
                    }}
                    _active={{
                        borderRadius: "13px",
                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                        color: "#FFF"
                    }}
                >
                    {active && typeof account === 'string' ? (
                        <p>{ formatAddress(account, 4) }</p>
                    ) : (
                        <p>Connect Wallet</p>
                    )}
                </MenuButton>
                <MenuList>
                    <MenuGroup 
                        title='Account' 
                        fontSize={['xs', 'sm', 'md']}
                        borderBottom="2px"
                        borderColor="#BC9CFF"
                    >
                        <MenuItem
                            fontSize={['xs', 'sm', 'md']}
                            pl={[8]}
                            _hover={{
                                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                            }}
                        >
                            { formatAddress(account || '', 8) }
                        </MenuItem>
                        <MenuItem 
                            onClick={ copyAccountToClipboard }
                            fontSize={['xs', 'sm', 'md']}
                            pl={[8]}
                            _hover={{
                                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                            }}
                        >
                            Copy address
                        </MenuItem>
                        <MenuItem 
                            onClick={ onClickDisconnect }
                            fontSize={['xs', 'sm', 'md']}
                            pl={[8]}
                            _hover={{
                                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                            }}
                        >
                            Disconnect
                        </MenuItem>
                    </MenuGroup>
                    <MenuGroup 
                        title='Balance'
                        fontSize={['xs', 'sm', 'md']}
                        borderBottom="2px"
                        borderColor="#BC9CFF"
                    >
                        <MenuItem
                            fontSize={['xs', 'sm', 'md']}
                            pl={[8]}
                            _hover={{
                                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                            }}
                        >
                            { ethBalance } ETH
                        </MenuItem>
                    </MenuGroup>
                </MenuList>
            </Menu>
        )
    }
}

export default ShowConnectionState