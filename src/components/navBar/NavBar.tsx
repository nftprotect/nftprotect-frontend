import {
    Box,
    Text,
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
        <Box
            position="sticky"
            top="0"
            zIndex="1"
            bgColor="#000"
            color="#FFF"
            w="100%"
            maxW="1920px"
            px={[3, 6]}
            py="0.375rem"
        >
            <nav key="navBar">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap='wrap'
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
                        {/* <LocaleMenu/> */}
                        <MainMenu />
                        <LoginForm buttonVariant={'light-outline'} />
                        { active && <NetworkMenu /> }
                        { active && <ShowConnectionState /> }
                    </Flex>
                </Flex>
            </nav>
        </Box>
    )
}

export default NavBar