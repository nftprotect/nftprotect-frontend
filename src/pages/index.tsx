import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import ShowConnectionState from '../components/ShowConnectionState'
import { 
    Card, 
    CardBody,
    Heading,
    Text,
    Box,
} from '@chakra-ui/react'

const Home: NextPage = () => {
    return (
        <div >
            <main className={styles.main}>
                <Card 
                    direction='row'
                    overflow='hidden'
                    variant='unstyled'
                    align='center'
                >
                    <CardBody textAlign="center">
                        <Box>SOME IMAGE HERE</Box>
                        <Heading as='h3' size='lg'>Please connect your wallet</Heading>
                        <Box>
                            <Text>Please connect your wallet to see your NFT and wNFT (or ... to protect your NFT)</Text>
                            <Text>View only permissions. We will never do anything without your permission</Text>
                        </Box>
                        <br></br>
                        <LoginForm />
                    </CardBody>
                </Card>
                <ShowConnectionState />
            </main>
        </div>
    )
}

export default Home