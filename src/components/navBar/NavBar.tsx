import { useWeb3React } from '@web3-react/core'
import {
    Container,
    Button,
    Card, 
    CardBody, 
    Text,
    ButtonGroup,
    Divider,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import ShowConnectionState from '../ShowConnectionState'

const NavBar = () => {

    return (
        <Box display="flex">
            <Box>LOGO</Box>
            <Box width="100%" textAlign="right">
                <ShowConnectionState />
            </Box>
            
        </Box>
    )
}

export default NavBar