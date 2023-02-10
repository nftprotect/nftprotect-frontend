import ChooseWalletCard from './ChooseWalletCard'

import {
    Box,
    Card,
    CardBody,
    Image,
    Flex,
    Heading,
    Text,
} from '@chakra-ui/react'

const ConnectWallet = () => {

    return (
        <Flex
            flexWrap={{base: 'wrap', md: 'nowrap'}}
        >
            <Flex
                flexDirection="column"
                w={{base: '100%', md: '50%'}}
                px={[4, 8]}
                py={[4, 8]}
                bgColor="#C3D4FF"
                boxSizing="border-box"
            >
                <Image 
                    src='/images/logo-blue.svg' 
                    alt='Logo' 
                    w={['45px', '45px', '75px']}
                    mb={[2, 4]}
                />
                <Heading
                    fontSize={['lg', 'xl', '2xl']}
                    mb={[4, 8]}
                >Get Started
                </Heading>
                <Heading
                    fontSize={['md', 'lg', 'xl']}
                    mb={2}
                >Connect your wallet
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                >Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.
                </Text>
            </Flex>
            
            <ChooseWalletCard/>

        </Flex>
)}

export default ConnectWallet