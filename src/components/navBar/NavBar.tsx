import {
    Box,
    Container,
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
            maxW="2800px"
            mt={12}
            p={0}
        >
            <nav key="navBar">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    my={[3, 6]}
                >
                    <Flex ml={[2, 4, 6, 10]}>
                        <Image
                            src='/images/logo.svg'
                            alt='Logo'
                            minW="40px"
                        />
                    </Flex>
                    <Flex mx={[2, 4, 6, 10]}>
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