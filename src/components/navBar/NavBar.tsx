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
import ShowConnectionState from './ShowConnectionState'
import NetworkMenu from './NetworkMenu'


const NavBar = () => {

    return (
        <nav style={{width: "100%"}}>
            <Box float = "left">LOGO</Box>
            <Box float = "right">
                <Box display="flex">
                    <NetworkMenu />
                    <ShowConnectionState />
                </Box>
            </Box>
        </nav>
    )
}

export default NavBar