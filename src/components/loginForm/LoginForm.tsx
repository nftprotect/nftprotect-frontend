import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ConnectMetamask from './ConnectMetamask'
import ConnectWalletConnect from './ConnectWalletConnect'
import { useEffect } from 'react'
import { 
    Button,
    Card, 
    CardBody, 
    Text,
    ButtonGroup,
    Divider,
    Box,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'

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
        <Button onClick={onOpen}>Connect Wallet</Button>
        
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="full"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Login with wallet</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Card 
                    direction='row'
                    overflow='hidden'
                    variant='outline'
                    align='center'
                >
                    <CardBody>
                        <Box textAlign='center'>
                            <Text>Логотип NFT Protect</Text>
                            <Text>и пояснительный текст что делать</Text>
                            <Divider m='1em'/>
                            <Text><b>GET STARTED</b></Text>
                            <Text><b>1</b></Text>
                            <Text><b>Connect your wallet</b></Text>
                            <Text>Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.</Text>
                            <Text><b>2</b></Text>
                            <Text><b>Approve Connection</b></Text>
                            <Text>Please approve the connection in your wallet and authorize access to continue.</Text>
                        </Box>
                    </CardBody>
                    <CardBody>
                        <Box textAlign='center'>
                            <Text>
                                Выбор через какой кошелек подключиться. 
                            </Text>
                            <Text>
                                Доступные кошельки: MetaMask и WalletConnect
                            </Text>
                            <br />
                            <ButtonGroup
                                size='sm' isAttached variant='outline'
                            >
                                <ConnectMetamask />
                                <ConnectWalletConnect />
                            </ButtonGroup>
                            <br /><br />
                            <Box>
                                <Text>
                                    Choosing to connect indicates that you have accepted <b><a href='#'>Terms of ServicePrivacy Policy</a></b>
                                </Text>
                            </Box>
                        </Box>
                    </CardBody>
                </Card>
            </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}

export default LoginForm