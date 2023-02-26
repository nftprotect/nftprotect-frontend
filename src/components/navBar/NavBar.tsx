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

const NavBar = () => {

    const { active } = useAppContext()

    return (
        <Box
            bgColor="#000"
            color="#FFF"
            maxW="2800px"
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
                            h={{base: '48px', sm: 'auto'}}
                        />
                        <Image
                            src='/images/logotype.svg'
                            alt='Brand'
                            display={{base: 'none', md: 'flex'}}
                            h={{base: '48px', sm: 'auto'}}
                        />
                    </Flex>
                    
                    <Flex 
                        py={[4, 0]}
                    >
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