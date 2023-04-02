import ConnectMetamask from './ConnectMetamask'
import ConnectWalletConnect from './ConnectWalletConnect'

import {
    Box,
    Flex,
    Heading,
    Text,
} from '@chakra-ui/react'
import { Trans } from '@lingui/macro'

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
                    <Trans>Available wallets</Trans>
                </Heading>
            </Box>
            
            
            <Flex 
                flexDirection="column"
                alignItems="center"
                px={[4, 8]}
            >
                { (typeof window.ethereum !== 'undefined') && <ConnectMetamask/> }
                <ConnectWalletConnect/>
            </Flex>
            <Text
                fontSize={['xs', 'sm', 'md']}
                px={[4, 8]}
                py={[4, 8]}
                mt={4}
            >
                <Trans>Choosing to connect indicates that you have accepted <a href='https://go.nftprotect.app/terms'>Terms of Service</a> and <a href='https://go.nftprotect.app/policy'>Privacy Policy</a></Trans>
            </Text>

        </Flex>

)}

export default ChooseWalletCard