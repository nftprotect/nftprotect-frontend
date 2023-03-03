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
import { Trans } from '@lingui/react'

const ChooseWalletCard = ({nextStep}: any) => {

    return(

        <Flex
            flexDirection="column"
            justifyContent="space-between"
            my={[4, 4, 0] }
        >
            <Box w="100%" textAlign="center">
                <Heading
                    fontSize={['md', 'lg', 'xl']}
                    mt={["0.5rem"]}
                    mb={[4, 4, 0] }
                    pb={[2]}
                    alignSelf="center"
                    borderBottom="2px dotted #C3D4FF"
                >
                    <Trans id='choosewallet-avalable'> Available wallets</Trans>
                </Heading>
            </Box>
            
            
            <Flex 
                flexDirection="column"
                alignItems="center"
                px={[4, 8]}
            >
                <ConnectMetamask/>
                <ConnectWalletConnect/>
            </Flex>
            <Text
                fontSize={['xs', 'sm', 'md']}
                px={[4, 8]}
                py={[4, 8]}
                mt={4}
            >
                <Trans id='choosewallet-terms'> Choosing to connect indicates that you have accepted <b><a href='#'>Terms of Service or Privacy Policy</a></b></Trans>
            </Text>

        </Flex>

)}

export default ChooseWalletCard