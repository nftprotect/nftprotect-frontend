import {
    chakra,
    Box,
    Flex,
    Image,
} from '@chakra-ui/react'
import ShowConnectionState from './ShowConnectionState'
import NetworkMenu from './NetworkMenu'
import MainMenu from './MainMenu'
import { useAppContext } from '../../context/AppContextProvider'
import { LocaleMenu } from './LocaleMenu'
import ConnectButton from '../ConnectButton'
import { default as NextLink } from 'next/link' 

const NavBar = ({showConnectButton = true}: {showConnectButton?: boolean}) => {

    const { active } = useAppContext()

    return (
        <chakra.nav
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap='wrap'
            w="100%"
            px={[3, 6]}
            py={{base: "10px"}}
        >
            <NextLink href="/">
                <Flex flexDirection="row" flexWrap="nowrap" alignItems="center">
                    <Image
                        src='/images/logomark.svg'
                        alt='Logo'
                        mr={[2]}
                        h='35px'
                    />
                    <Image
                        src='/images/logotype.svg'
                        alt='Brand'
                        display={{base: 'none', md: 'flex'}}
                        mt={["5px"]}
                        h='20px'
                    />
                </Flex>
            </NextLink>
            
            <Flex flexWrap="wrap">
                { (process.env.NODE_ENV !== 'production') && 
                    <Box ml={{base: "1.25rem"}}>
                        <LocaleMenu/> 
                    </Box>
                }
                {/* <Box mr={[2, 4]}>
                    <MainMenu />
                </Box> */}
                { !active && showConnectButton && <Box ml={{base: "1.25rem"}}>
                    <ConnectButton buttonVariant={'primaryDark'}/>
                </Box> }
                { active && <Box ml={{base: "1.25rem"}}>
                   <NetworkMenu />
                </Box> }
                { active && <Box ml={{base: "1.25rem"}}>
                    <ShowConnectionState />
                </Box> }
            </Flex>
        </chakra.nav>
    )
}

export default NavBar