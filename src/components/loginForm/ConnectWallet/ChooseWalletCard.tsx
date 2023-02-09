import ConnectMetamask from './ConnectMetamask'
import ConnectWalletConnect from './ConnectWalletConnect'

import {
    Box,
    Card,
    CardBody,
    Flex,
    Heading,
    Text,
} from '@chakra-ui/react'

const ChooseWalletCard = ({nextStep}: any) => {

    return(
        <Card mb={[4, 8]}>
            <CardBody>
                <Flex
                    m={{base: 0} }
                    flexDirection="column"
                >
                    <Heading
                        fontSize={['md', 'xl', '2xl']}
                        mb={2}
                        color="#1F2041"
                    >
                        Available wallets
                    </Heading>
                    
                    <ConnectMetamask/>
                    <ConnectWalletConnect/>

                    <Box
                        justify-self="end"
                    >
                        <Text
                            fontSize={['xs', 'sm']}
                            mt={4}
                        >Choosing to connect indicates that you have accepted <b><a href='#'>Terms of ServicePrivacy Policy</a></b>
                        </Text>
                    </Box>
                </Flex>
            </CardBody>
        </Card>
)}

export default ChooseWalletCard