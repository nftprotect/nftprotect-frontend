import ConnectWallet from './ConnectWallet/ConnectWallet'
import ApproveConnection from './ApproveConnection'
import DIDVerification from './DIDVerification'
import { Wizard } from 'react-use-wizard';
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
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="13px"
            fontSize={['xs', 'sm', 'md']}
            py={[2, 4]}
            px={[3, 6]}
            my={2}
            mr={2}
            bg="none"
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
        >
            Connect Wallet
        </Button> }
        
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay />
            
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