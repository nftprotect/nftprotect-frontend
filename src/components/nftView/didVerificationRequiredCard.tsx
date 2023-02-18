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

    <Container 
                bg="red.200"
                maxW="2200px"
            >
                <Flex
                    justifyContent="space-between"
                    px={["0", "3rem"]}
                    py={[4]}
                    flexDirection={{base: 'column', sm: 'row'}}
                >
                    <Flex>
                        <Box mr={[4]} >
                            <AlertTriangle fontSize='2em' />
                        </Box>
                        
                        <Flex flexDirection="column" mr={4}>
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                                Verify DID
                            </Heading>
                            <Text fontSize={['xs', 'sm', 'md']} mb={[4]}>
                                Пока вы не прошли верификацию DID вы можете только запросить оригинал, если у вас есть WNFT
                            </Text>
                        </Flex>

                    </Flex>
                    <Button 
                        onClick={ () => (window.open('https://passport.gitcoin.co/', '_blank')) }
                        alignSelf="center"
                        border="2px solid"
                        borderColor="gray.700"
                        borderRadius="13px"
                        fontSize={['2xs', 'xs', 'sm', 'md']}
                        py={[2, 4]}
                        px={[3, 6]}
                        whiteSpace="break-spaces"
                        bg="none"
                        w={['15em']}
                        _hover={{
                            borderColor: "#FFF",
                            color: "#FFF"
                        }}
                    >
                        Proceed to DID
                    </Button>
                </Flex>
            </Container>
)}

export default DIDVerificationRequiredCard