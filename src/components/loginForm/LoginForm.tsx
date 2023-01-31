import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ConnectMetamask from './ConnectMetamask'
import ConnectWalletConnect from './ConnectWalletConnect'
import { useEffect } from 'react'
import {
    Box,
    Button,
    Card, 
    CardBody,
    Flex,
    Heading,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    useDisclosure,
} from '@chakra-ui/react'
import {} from '@chakra-ui/transition'

const LoginForm = () => {

    const { active } = useWeb3React<Web3Provider>()
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (active) {
            onClose()
        }
    })

    return (
        <>
        <Button 
            onClick={onOpen}
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="13px"
            fontSize={['xs', 'sm', 'md']}
            py={[2, 4]}
            px={[3, 6]}
            my={2}
            mr={2}
            bg="linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)"
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
        >Connect Wallet
        </Button>
        
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent
                minW={{base: "90vw", sm: "70vw", xl: "50vw"}}
            >
                <ModalHeader>Login with wallet</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex 
                        flexWrap={{base: 'wrap', md: 'nowrap'}}
                    >
                        <Card>
                            <CardBody>
                                <Flex
                                    flexDirection="row" 
                                    justifyContent="flex-start"
                                    alignItems="center"
                                    mb={[2, 4]}
                                >
                                    <Image
                                        src='/images/logo.svg' 
                                        alt='Logo'
                                        minW="20px"
                                        w={['20px', '41px']}
                                        mr={[2, 4]}
                                    />
                                    <Heading
                                        as='h3'
                                        fontSize={['lg', 'xl', '2xl', '3xl']}
                                        my={4}
                                        color="#1F2041"
                                    >Get Started
                                    </Heading>
                                </Flex>

                                <Heading
                                    as='h4'
                                    fontSize={['md', 'lg', 'xl', '2xl']}
                                    mb={2}
                                    color="#1F2041"
                                >Connect your wallet
                                </Heading>
                                <Text
                                    fontSize={['xs', 'sm', 'md']}
                                >Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.
                                </Text>

                                {/* <Text><b>2</b></Text>
                                <Text><b>Approve Connection</b></Text>
                                <Text>Please approve the connection in your wallet and authorize access to continue.</Text> */}
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody>
                                <Flex
                                    m={{base: 0, sm: 4} }
                                    flexDirection="column"
                                >
                                    <Heading
                                        fontSize={['md', 'lg', 'xl', '2xl']}
                                        mb={2}
                                        color="#1F2041"
                                    >
                                        Available wallets
                                    </Heading>
                                    
                                    <ConnectMetamask />
                                    <ConnectWalletConnect />

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
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}

export default LoginForm