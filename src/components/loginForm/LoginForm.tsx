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
import { Trans } from '@lingui/react'

const LoginForm = () => {
    const { active } = useAppContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure

    return (
        <>
        { !active && 
            <Button 
                variant='monochrome-transparent'
                onClick={onOpen}
                leftIcon={<Wallet fontSize='20px'/>}
            >
                <Trans id='buttonConnectWallet'> Connect Wallet</Trans>
            </Button> 
        }
        
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay 
                bg='blackAlpha.700'
                backdropFilter='blur(10px)'
            />
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
                border="2px solid #000"
                borderRadius="30px"
                overflow="hidden"
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