import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,

} from '@chakra-ui/react'
import { Trans } from '@lingui/macro'

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
                <Trans>Please complete DID verification</Trans>
            </Heading>
            <Box 
                fontSize={['xs', 'sm', 'md']}
                p={[4, 8]}
            >
                <Text mb={[2, 4]}>
                <Trans>To access all the features of the application, please complete DID verification.</Trans>
                </Text>
                <Text>
                <Trans>Until you complete DID verification, the only available function is to request rights to the original when purchasing pNFT.</Trans>
                </Text>
            </Box>

            <Button 
                onClick={goToExternalPage}
                variant="primaryLight"
                alignSelf="center"
                w={['15em']}
            ><Trans>Proceed to DID</Trans>
            </Button>
        </Flex>
    )
}

export default DIDVerification