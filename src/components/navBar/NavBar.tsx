import {
    Box,
    Text,
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
            mt={12}
            p={0}
        >
            <nav key="navBar">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap={{base: 'wrap', md: 'nowrap'}}
                    m={[3, 6]}
                >
                    <Image
                        src='/images/logo.svg'
                        alt='Logo'
                        h={{base: '30px', md: 'auto'}}
                    />
                    <Flex mx={[0, 0, 6, 10]}>
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