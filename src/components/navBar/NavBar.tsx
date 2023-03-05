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
            maxW="2200px"
            p={[3, 6]}
        >
            <nav key="navBar">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap={{base: 'wrap', md: 'nowrap'}}
                    
                >
                    <Flex flexDirection="row" flexWrap="nowrap" alignItems="center">
                        <Image
                            src='/images/logomark.svg'
                            alt='Logo'
                            mr={[2]}
                            h='48px'
                        />
                        <Image
                            src='/images/logotype.svg'
                            alt='Brand'
                            display={{base: 'none', md: 'flex'}}
                            mt={["5px"]}
                            h='30px'
                        />
                    </Flex>
                    
                    <Flex 
                        py={[4, 0]}
                    >
                        <LocaleMenu/>
                        <MainMenu />
                        <LoginForm/>
                        { active && <NetworkMenu /> }
                        { active && <ShowConnectionState /> }
                    </Flex>
                </Flex>
            </nav>
        </Box>
    )
}

export default NavBar