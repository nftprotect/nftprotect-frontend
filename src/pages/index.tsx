import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import NFTView from '../components/nftView/NFTView'
import CheckUrlPopup from '../components/popups/CheckUrlPopup'

import {
    Container,
    Heading,
    Image,
    Text,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

const Home: NextPage = () => {
    const { active } = useWeb3React<Web3Provider>()

    if ( active ) {
        return (
            <>
                <CheckUrlPopup />
                <Container 
                    maxW="2200px"
                    mx={["10em"]}
                    p={['10em']}
                >
                    <NavBar />
                    <main>
                        <NFTView />
                    </main>
                </Container>
            </>
        )
    } else {
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
                        
                        <LoginForm />

                    </Container >
                    
                </Container>
            </>
        )
    }
}

export default Home