import ConnectWallet from './ConnectWallet/ConnectWallet'
import ApproveConnection from './ApproveConnection'
import DIDVerification from './DIDVerification'
import { Wizard } from 'react-use-wizard';
import { Wallet } from '@web3uikit/icons'
import {
    Button,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    useDisclosure,
} from '@chakra-ui/react'
import { useAppContext } from '../../context/AppContextProvider';

const LoginForm = () => {
    const { active } = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure

    return (
        <>
        { !active && <Button 
            onClick={onOpen}
            leftIcon={<Wallet fontSize='20px'/>}
            border="1px solid #FFF"
            borderRadius="16px"
            fontSize={['xs', 'sm', 'md']}
            py={[2, 4]}
            px={[3, 6]}
            mr={2}
            bg="none"
            _hover={{
                bgColor: "rgba(255, 255, 255, 0.15)"
            }}
            _active={{
                bgColor: "rgba(255, 255, 255, 0.15)"
            }}
        >
            Connect Wallet
        </Button> }
        
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay 
                bg='blackAlpha.800'
                backdropFilter='blur(10px)'
            />
            
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalCloseButton />
                <ModalBody p="0">
                    <Wizard>
                        <ConnectWallet/>
                        <ApproveConnection disclosure={disclosure}/>
                        <DIDVerification disclosure={disclosure}/>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}

export default LoginForm