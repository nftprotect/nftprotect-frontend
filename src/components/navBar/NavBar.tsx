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
import LoginForm from '../loginForm/LoginForm'
import { LocaleMenu } from './LocaleMenu'

const NavBar = () => {

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
            
            <Flex flexWrap="wrap">
                { (process.env.NODE_ENV !== 'production') && 
                    <Box ml={{base: "1.25rem"}}>
                        <LocaleMenu/> 
                    </Box>
                }
                {/* <Box mr={[2, 4]}>
                    <MainMenu />
                </Box> */}
                { !active && <Box ml={{base: "1.25rem"}}>
                    <LoginForm buttonVariant={'primaryDark'} />
                </Box> }
                <Box ml={{base: "1.25rem"}}>
                    { active && <NetworkMenu /> }
                </Box>
                <Box ml={{base: "1.25rem"}}>
                    { active && <ShowConnectionState /> }
                </Box>
            </Flex>
        </chakra.nav>
    )
}

export default NavBar