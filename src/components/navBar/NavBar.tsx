import {
    Box,
    Container,
    Flex,
    Image,
} from '@chakra-ui/react'
import ShowConnectionState from './ShowConnectionState'
import NetworkMenu from './NetworkMenu'
import MainMenu from './MainMenu'

const NavBar = () => {

    return (
        <Box 
            maxW="2800px"
            p={0}
        >
            <nav>
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
                        <NetworkMenu />
                        <ShowConnectionState />
                    </Flex>
                </Flex>
            </nav>
        </Box>
    )
}

export default NavBar