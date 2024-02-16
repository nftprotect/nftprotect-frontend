import { useEffect, useState } from 'react'
import { formatEther } from "@ethersproject/units"
import { copyTextToClipboard } from '../../utils/helpers'
import {
    Box,
    Button,
    Card,
    CardBody,
    Flex,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuList,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    Tooltip,
    VisuallyHiddenInput,
    useClipboard
} from '@chakra-ui/react'
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons'
import Davatar from '@davatar/react'
import { t, Trans } from '@lingui/macro'
import { useAppContext } from '../../context/AppContextProvider'
import { BigNumber } from '@ethersproject/bignumber'
import { useDisconnect } from 'wagmi'
import AddressDisplay from '../AddressDisplay'
import { useRouter } from 'next/router'
import Link from 'next/link'

const ShowConnectionState = () => {

    const { account, active, library, couponsBalance, baseTokenPrice } = useAppContext()
    const { disconnect } = useDisconnect()
    const [ethBalance, setEthBalance] = useState<number | undefined>(undefined)
    const { hasCopied, onCopy } = useClipboard(account || '');
    const router = useRouter();

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
                                <Tooltip label={t`Copy`} bg="white" color="#1A202C">
                                <Popover isOpen={hasCopied}>
                                    <PopoverTrigger>
                                        <IconButton
                                            boxShadow="0"
                                            w="2.5rem"
                                            h="2.5rem"
                                            aria-label={t`Copy`}
                                            icon={<Image src='/images/commonIcons/copy.svg'/>}
                                            variant='ghost'
                                            onClick={onCopy}
                                        />
                                    </PopoverTrigger>
                                    <PopoverContent w='5.5rem'>
                                        <PopoverArrow />
                                        <PopoverBody textAlign={'center'}><Trans>Copied!</Trans></PopoverBody>
                                    </PopoverContent>
                                </Popover>
                                </Tooltip>
                                <Tooltip label={t`Disconnect`} bg="white" color="#1A202C">
                                    <IconButton
                                        boxShadow="0"
                                        w="2.5rem"
                                        h="2.5rem"
                                        aria-label={ t`Disconnect` }
                                        icon={<Image src='/images/commonIcons/logout.svg'/>}
                                        variant='ghost'
                                        onClick={ onClickDisconnect }
                                    />
                                </Tooltip>
                            </Flex>
                        </Flex>
                        <Box mb='1rem'>
                            <Text fontSize={['16px']} fontWeight={600}>
                                <Trans>Balance</Trans>
                            </Text>
                            <Text fontSize={['36px']}>
                                { ethBalance?.toFixed(4) } ETH
                            </Text>
                            { baseTokenPrice && ethBalance && <Text fontSize={['16px']} color="text.muted">
                                ${ (ethBalance * baseTokenPrice).toFixed(2) } USD
                            </Text> }
                        </Box>
                        <Box>
                            <Text fontSize={['16px']} fontWeight={600}>
                                <Trans>Coupons</Trans>
                            </Text>
                            <Text fontSize={['36px']}>
                                { (couponsBalance !== undefined) ? t`${ couponsBalance } coupons` : t`Fetching balance…` }
                            </Text>
                            <Text fontSize={['16px']} color="text.muted">
                                <Trans>
                                    Want a coupon for free NFT protection? Complete the <Link color="blue" href="https://galxe.com/nftprotect" target='_blank'>
                                        <Text color="#2D7BD6" textDecoration={'underline'}>quest</Text>
                                    </Link>
                                </Trans>
                            </Text>
                        </Box>
                        <Box mt="1rem">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Flex alignItems="center">
                                    <Image src='/images/commonIcons/referral.svg' mr={2}/>
                                    <Text fontSize={['16px']}>
                                        <Trans>Referral program</Trans>
                                    </Text>
                                </Flex>
                                <Tooltip label={t`Referral program`} bg="white" color="#1A202C">
                                    <IconButton
                                        boxShadow="0"
                                        w="2.5rem"
                                        h="2.5rem"
                                        aria-label={ t`Referral program` }
                                        icon={<Image src='/images/commonIcons/filter.svg'/>}
                                        variant='ghost'
                                        onClick={ ()=>{
                                            router.push('/referral');
                                        } }
                                    />
                                </Tooltip>
                                
                            </Flex>
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