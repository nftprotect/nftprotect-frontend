import { useEffect, useState } from 'react'
import { formatEther } from "@ethersproject/units"
import { copyTextToClipboard } from '../../utils/helpers'
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
    VisuallyHiddenInput
} from '@chakra-ui/react'
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons'
import { Copy, Off } from '@web3uikit/icons'
import Davatar from '@davatar/react'
import { t, Trans } from '@lingui/macro'
import { useAppContext } from '../../context/AppContextProvider'
import { BigNumber } from '@ethersproject/bignumber'
import { useDisconnect } from 'wagmi'
import AddressDisplay from '../AddressDisplay'

const ShowConnectionState = () => {

    const { account, active, library, couponsBalance, baseTokenPrice } = useAppContext()
    const { disconnect } = useDisconnect()
    const [ethBalance, setEthBalance] = useState<number | undefined>(undefined)

    useEffect(() => {
        if(active && account){
            library?.getBalance(account).then((result: BigNumber)=>{
                setEthBalance(Number(formatEther(result)))
            })
        }
    })

    const onClickDisconnect = () => {
        disconnect()
    }

    const copyAccountToClipboard = () => {
        copyTextToClipboard(account || '', '#addressHolder').then(() => alert('Copied!'))
    }

    return (
        <>
        <VisuallyHiddenInput id='addressHolder' value={account || ''} readOnly></VisuallyHiddenInput>
        <Menu>
            <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />}
                variant="primaryDark"
                textTransform="none"
                fontWeight="400"
                py={[2, 4]}
                px={[3, 6]}
            >
                {active && typeof account === 'string' ? (
                    <p><AddressDisplay address={account}/></p>
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
                                    border="2px"
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
                                { <AddressDisplay address={account||''}/> }
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
                                        bgColor="gray.200"
                                        cursor="pointer"
                                        _hover={{
                                            bg: "brand.light",
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
                                        bgColor="gray.200"
                                        cursor="pointer"
                                        _hover={{
                                            bg: "brand.light",
                                            color: "#FFF"
                                        }}
                                    >
                                        <Off onClick={ onClickDisconnect }/>
                                    </Flex>
                                </Tooltip>
                            </Flex>
                        </Flex>
                        <Box textAlign="center">
                            <Text fontSize={['24px']}>
                                { ethBalance?.toFixed(4) } ETH
                            </Text>
                            { baseTokenPrice && ethBalance && <Text fontSize={['14px']} color="text.muted">
                                ${ (ethBalance * baseTokenPrice).toFixed(2) } USD
                            </Text> }
                        </Box>
                        <Box textAlign="center">
                            <Text fontSize={['24px']}>
                                { (couponsBalance !== undefined) ? t`${ couponsBalance } coupons` : t`Fetching balance…` }
                            </Text>
                            <Text fontSize={['14px']} color="text.muted">
                                <Trans>for free protection</Trans>
                            </Text>
                        </Box>
                        { }
                    </CardBody>
                </Card>
            </MenuList>
        </Menu>
    </>
    )
}

export default ShowConnectionState