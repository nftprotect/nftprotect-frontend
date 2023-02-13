import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from "@ethersproject/units"
import { formatAddress, copyTextToClipboard } from '../../utils/helpers'
import {
    Box,
    Button,
    Card,
    CardBody,
    Flex,
    Image,
    Menu,
    MenuButton,
    MenuList,
    Text,
    Tooltip,
} from '@chakra-ui/react'
import { ChevronDownIcon, CopyIcon,  } from '@chakra-ui/icons'
import { Copy, Off } from '@web3uikit/icons'
import CouponBalance from './CouponBalance'
import Davatar from '@davatar/react'

const ShowConnectionState = () => {

    const { account, active, deactivate, library } = useWeb3React<Web3Provider>()
    const [ethBalance, setEthBalance] = useState<number | undefined>(undefined)

    useEffect(() => {
        if(active && account){
            library?.getBalance(account).then((result)=>{
                setEthBalance(Number(formatEther(result)))
            })
        }
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

            <MenuList 
                p="0"
                w={[300, 300]}
            >
                <Card
                    w="100%"
                    h="100%"
                    fontSize={['xs', 'sm', 'md']}
                >
                    <CardBody>
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            mb={[8]}
                        >
                            <Flex
                                alignItems="center"
                                flexWrap="nowrap"
                            >
                                <Box
                                    mr={[4]}
                                    border="4px"
                                    borderColor="#BC9CFF"
                                    borderRadius={['2em']}
                                >
                                    { active && <Davatar
                                        size={42}
                                        address={account || ''}
                                        // provider={library?.provider}
                                        // graphApiKey={apiKey}
                                        generatedAvatarType='jazzicon' // 'jazzicon' or 'blockies'
                                    /> }
                                </Box>

                                <Text fontSize={['16px']}>
                                { formatAddress(account || '', 4) }
                                </Text>
                            </Flex>

                            <Flex>
                                <Tooltip label="Copy" bg="none" color="#1A202C">
                                    <Flex
                                        justifyContent="center"
                                        alignItems="center"
                                        w="2em"
                                        h="2em"
                                        p={[1]}
                                        borderRadius="1em"
                                        bgColor="rgba(211, 211, 211, .6)"
                                        cursor="pointer"
                                        _hover={{
                                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                            color: "#FFF"
                                        }}
                                    >   
                                        <CopyIcon onClick={ copyAccountToClipboard } />
                                    </Flex>
                                </Tooltip>
                                <Tooltip label="Disconnect" bg="none" color="#1A202C">
                                    <Flex
                                        justifyContent="center"
                                        alignItems="center"
                                        w="2em"
                                        h="2em"
                                        p={[1]}
                                        mx={[1]}
                                        borderRadius="1em"
                                        bgColor="rgba(211, 211, 211, .6)"
                                        cursor="pointer"
                                        _hover={{
                                            bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                            color: "#FFF"
                                        }}
                                    >
                                        <Off onClick={ onClickDisconnect }/>
                                    </Flex>
                                </Tooltip>
                            </Flex>
                        </Flex>
                        <Box textAlign="center">
                            <Text fontSize={['14px']}>
                                ETH Balance
                            </Text>
                            <Text fontSize={['24px']}>
                                { ethBalance?.toFixed(4) } ETH
                            </Text>
                        </Box>
                        <Box textAlign="center">
                            <Text fontSize={['14px']}>
                                Coupon Balance
                            </Text>
                            <Text fontSize={['24px']}>
                                <CouponBalance />
                            </Text>
                        </Box>
                    </CardBody>
                </Card>
            </MenuList>
        </Menu>
    )
}

export default ShowConnectionState