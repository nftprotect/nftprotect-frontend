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

        <Box w={['15em']}>
            <Button 
                onClick={ () => (window.open('https://passport.gitcoin.co/', '_blank')) }
                variant='danger'
                mt={[4]}
            >Proceed to DID
            </Button>
        </Box>
    </Flex>
)}

export default DIDVerificationRequiredCard