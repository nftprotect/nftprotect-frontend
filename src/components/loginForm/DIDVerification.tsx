import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,

} from '@chakra-ui/react'

const DIDVerification = ({disclosure}: any) => {
    function goToExternalPage() {
        window.open('https://passport.gitcoin.co/', '_blank')
    }

    return(

        <Flex
            flexDirection="column"
        >
            <Heading
                fontSize={['md', 'lg', 'xl']}
                mt={["0.5rem"]}
                mb={[4, 4, 0] }
                pb={[2]}
                alignSelf="center"
            >
                Пройдите верификацию DID
            </Heading>
            <Box 
                fontSize={['xs', 'sm', 'md']}
                p={[4, 8]}
            >
                <Text mb={[2, 4]}>
                    Чтобы воспользоваться всеми функциями приложения, пройдите верификацию DID.
                </Text>
                <Text>
                    Пока вы не прошли DID, единственная доступная функция - запросить права на оригинал при приобретении wNFT.
                </Text>
            </Box>

            <Button 
                onClick={goToExternalPage}
                alignSelf="center"
                border="2px"
                borderColor="#BC9CFF"
                borderRadius="13px"
                fontSize={['xs', 'sm', 'md']}
                py={[2, 4]}
                px={[3, 6]}
                my={[4, 8]}
                bg="none"
                w={['15em']}
                _hover={{
                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                    color: "#FFF"
                }}
            >Proceed to DID
            </Button>
        </Flex>
    )
}

export default DIDVerification