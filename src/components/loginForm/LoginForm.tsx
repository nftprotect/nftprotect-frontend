import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ConnectWallet from './ConnectWallet/ConnectWallet'
import ApproveConnection from './ApproveConnection'
import DIDVerification from './DIDVerification'

import { useEffect, useState } from 'react'
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
            bg="none"
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
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalCloseButton />
                <ModalBody p="0">
                    <Wizard>
                        <ConnectWallet/>
                        <ApproveConnection active={active} />
                        <DIDVerification />
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}

export default LoginForm