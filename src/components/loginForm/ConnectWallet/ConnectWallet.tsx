import ChooseWalletCard from './ChooseWalletCard'

import {
    Box,
    Card,
    CardBody,
    Flex,
    Heading,
    Text,
} from '@chakra-ui/react'

const ConnectWallet = ({nextStep}: any) => {

    return (
        <Flex
            flexWrap={{base: 'wrap', md: 'nowrap'}}
        >
            <Card mb={[4, 8]}>
                <CardBody>
                    <Heading
                        as='h4'
                        fontSize={['md', 'xl', '2xl']}
                        mb={2}
                        color="#1F2041"
                    >Connect your wallet
                    </Heading>
                    <Text
                        fontSize={['xs', 'sm', 'md']}
                    >Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.
                    </Text>
                </CardBody>
            </Card>
            
            <ChooseWalletCard nextStep={nextStep} />

        </Flex>
)}

export default ConnectWallet