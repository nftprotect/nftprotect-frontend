import {
    Box,
    Container,
    Button,
    Heading,
    Flex,
    Text,
    useDisclosure
} from '@chakra-ui/react'
import { AlertTriangle } from '@web3uikit/icons'

const DIDVerificationRequiredCard = () => {

return (
    <Flex
        flexDirection='column'
        justifyItems="flex-start"
        my={[4, 8]}
    >
        <Flex alignItems="center" >
            <Box mr={[4]} color="#FF0000">
                <AlertTriangle fontSize='4em' />
            </Box>
            <Text fontSize={['sm', 'md', 'lg', 'xl']} color="#FF0000" fontWeight="600">
                Unless DID verification is done the only option available is to <i>request original NFT</i>
            </Text>
        </Flex>

        <Box>
            <Button 
                onClick={ () => (window.open('https://passport.gitcoin.co/', '_blank')) }
                textTransform="uppercase"
                borderRadius="16px"
                boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)"
                fontSize={['sm', 'md', 'lg', 'xl']}
                py={[2, 4]}
                px={[3, 6]}
                mt={[4]}
                color="#FFF"
                bgColor="#FF0000"
                w={['15em']}
                _hover={{
                    border: "2px solid #FF0000",
                    bg: "none",
                    color: "#000"
                }}
                _active={{
                    border: "2px solid #FF0000",
                    bg: "none",
                    color: "#000"
                }}
            >Proceed to DID
            </Button>
        </Box>
    </Flex>
)}

export default DIDVerificationRequiredCard