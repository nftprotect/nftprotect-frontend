import { useEffect, useState } from 'react'
import { formatEther } from "@ethersproject/units"
import { copyTextToClipboard, formatAddress } from '../../utils/helpers'
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
    useClipboard,
    Link
} from '@chakra-ui/react'
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons'
import { t, Trans } from '@lingui/macro'
import { useAppContext } from '../../context/AppContextProvider'
import { BigNumber } from '@ethersproject/bignumber'
import { useDisconnect } from 'wagmi'
import AddressDisplay from '../AddressDisplay'
import { useRouter } from 'next/router'
import useEnsName from '../../hooks/useEnsName'
import Avatar from './Avatar'

const ShowConnectionState = () => {

    const { account, active, library, baseTokenPrice } = useAppContext()
    const { disconnect } = useDisconnect()
    const [ethBalance, setEthBalance] = useState<number | undefined>(undefined)
    const { hasCopied, onCopy } = useClipboard(account || '');
    const ensName = useEnsName(account as `0x${string}`);
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
                    <p>{ ensName || formatAddress(account, 4) }</p>
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
                                    { active && <Avatar address={account!} name={ensName} size={42} /> }
                                </Box>

                                <Text fontSize={['16px']}>
                                { <AddressDisplay address={account||''}/> }
                                </Text>
                            </Flex>

                            <Flex>
                                <Popover isOpen={hasCopied}>
                                    <PopoverTrigger>
                                        <Tooltip label={t`Copy`} bg="white" color="#1A202C">
                                        <IconButton
                                            boxShadow="0"
                                            w="2.5rem"
                                            h="2.5rem"
                                            aria-label={t`Copy`}
                                            icon={<Image src='/images/icons-common/copy.svg'/>}
                                            variant='ghost'
                                            onClick={onCopy}
                                        />
                                        </Tooltip>
                                    </PopoverTrigger>
                                    <PopoverContent w='5.5rem'>
                                        <PopoverArrow />
                                        <PopoverBody textAlign={'center'}><Trans>Copied!</Trans></PopoverBody>
                                    </PopoverContent>
                                </Popover>
                                <Tooltip label={t`Disconnect`} bg="white" color="#1A202C">
                                    <IconButton
                                        boxShadow="0"
                                        w="2.5rem"
                                        h="2.5rem"
                                        aria-label={ t`Disconnect` }
                                        icon={<Image src='/images/icons-common/logout.svg'/>}
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
                            { baseTokenPrice && ethBalance && <Text fontSize={['16px']} fontWeight={"100"} color="text.muted" mt='-0.5rem'>
                                ~ ${ (ethBalance * baseTokenPrice).toFixed(2) } USD
                            </Text> }
                        </Box>
                        <Box mt="1rem">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Flex alignItems="center">
                                    <Image src='/images/icons-common/referral.svg' mr={2}/>
                                    <Text 
                                        fontSize={['16px']}
                                        cursor={'pointer'}
                                        onClick={ ()=>{
                                            router.push('/referral');
                                        } }
                                    >
                                        <Trans>Referral program</Trans>
                                    </Text>
                                </Flex>
                                <Tooltip label={t`Referral program`} bg="white" color="#1A202C">
                                    <IconButton
                                        boxShadow="0"
                                        w="2.5rem"
                                        h="2.5rem"
                                        aria-label={ t`Referral program` }
                                        icon={<Image src='/images/icons-common/filter.svg'/>}
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