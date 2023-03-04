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

import { Trans } from '@lingui/react'

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
                bgColor="#5F38C8"
                color="#FFF"
                boxSizing="border-box"
            >
                <Image 
                    src='/images/logomark.svg' 
                    alt='Logo' 
                    w={['45px', '45px', '75px']}
                    mb={[2, 4]}
                />
                <Heading
                    fontSize={['lg', 'xl', '2xl']}
                    mb={[4, 8]}
                >
                    <Trans id='CW-getStarted'>Get Started</Trans>
                </Heading>
                <Heading
                    fontSize={['md', 'lg', 'xl']}
                    mb={2}
                >
                    <Trans id='CW-step1-head'>Connect your wallet</Trans>
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                >
                    <Trans id='CW-step1-desc'>Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.</Trans>
                </Text>
            </Flex>
            
            <ChooseWalletCard/>

        </Flex>
)}

export default ConnectWallet