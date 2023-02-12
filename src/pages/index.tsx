import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import CheckUrlPopup from '../components/popups/CheckUrlPopup'
import {
    Container,
    Heading,
    Image,
    Text,
    Box
} from '@chakra-ui/react'
import { useAppContext } from '../context/AppContextProvider'
import NFTView from '../components/nftView/NFTView'

const Home: NextPage = () => {

    const { active } = useAppContext()

    let innerPart = <div/>
    if ( active ) {
        innerPart = <NFTView />
    } else {
        innerPart = (
            <>
            <Image
                my={[2, 4]}
                w="100%"
                src='/images/banner1.png' alt='Home page banner'
                backgroundColor="rgba(255, 255, 255, .9)"
            />

            <Container mt={[6, 20]} centerContent>
                <Heading
                    as='h3'
                    textAlign="center"
                    fontSize={['lg']}
                    mb={4}
                    color="#1F2041"
                >
                    Please connect your wallet
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                    textAlign="center"
                    color="rgba(31, 32, 65, .9)"
                >
                    Please connect your wallet to see your NFT and wNFT (or ... to protect your NFT)
                </Text>
                <Text
                    fontSize={['xs', 'sm', 'md']} 
                    textAlign="center"
                    color="rgba(31, 32, 65, .9)"
                    mb={[4, 6]}
                >
                    View only permissions. We will never do anything without your permission
                </Text>
            </Container >
            </>
        )
    }

    return (
        <>
        <CheckUrlPopup />
        <Container 
            id="startPageContainer"
            mt={12}
            p={0}
            maxW="2200px"
        >
            <NavBar />
            <main>
                {innerPart}
                <Box width='100%' textAlign='center'>
                    <LoginForm/>
                </Box>
            </main>
        </Container>
    </>
    )
}

export default Home