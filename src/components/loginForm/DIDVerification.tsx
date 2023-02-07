import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Card, 
    CardBody,
    Flex,
    Heading,
    Text,
    SimpleGrid,
    useDisclosure,
} from '@chakra-ui/react'

const DIDVerification = () => {

    const DIDVerificationOptions = [
        {
            header: 'GTC',
            content: 'Connect your wallet to confirm GTC possession',
            buttonTitle: 'Verify ownership'
        },
        {
            header: 'GTC Staking',
            content: 'Connect your wallet to verify your staked amount. This accesses ypur Passport data',
            buttonTitle: 'Verify account'
        },
        {
            header: 'Gitcoin Grants',
            content: 'Connect Github account to review your donation activity on Gitcoin (Up to GR15.)',
            buttonTitle: 'Connect account'
        },
        {
            header: 'Twitter',
            content: 'Connect your Twitter account to verify stamp details.',
            buttonTitle: 'Connect account'
        },
        {
            header: 'Discord',
            content: 'Connect your Discord account to verify stamp details.',
            buttonTitle: 'Connect account'
        },
        {
            header: 'Google',
            content: 'Connect your Google account to verify stamp details.',
            buttonTitle: 'Connect account'
        },
        {
            header: 'Github',
            content: 'Connect your Github account to verify stamp details.',
            buttonTitle: 'Connect account'
        },
        {
            header: 'Facebook',
            content: 'Connect your Facebook account to verify stamp details.',
            buttonTitle: 'Connect account'
        },
    ]

    return(
        <Flex
            flexDirection="column"
        >
            <Flex
                flexDirection="column"
                mb={[4, 8]}
            >
                <Heading
                    as='h4'
                    fontSize={['md', 'xl', '2xl']}
                    mb={[2, 4]}
                    color="#1F2041"
                >
                    Пройдите верификацию DID
                </Heading>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                    my={[2]}
                >
                    Чтобы воспользоваться всеми функциями приложения, пройдите верификацию DID.
                </Text>
                <Text
                    fontSize={['xs', 'sm', 'md']}
                    my={[2]}
                >
                    Пока вы не прошли DID, единственная доступная функция - запросить права на оригинал при приобретении wNFT.
                </Text>
            </Flex>

            <SimpleGrid
                minChildWidth={['8em', '10em', '12em']}
                spacing='1em'
            >
                { DIDVerificationOptions.map(({ header, content, buttonTitle }) => (
                    <Card key='header'>
                        <CardBody
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Heading 
                                    as="h5" 
                                    fontSize={['sm', 'md', 'xl']}
                                    mb={[2, 4]}
                                >
                                    {header}
                                </Heading>
                                <Text 
                                    fontSize={['xs', 'sm', 'md']}
                                    mb={[2, 4]}
                                >
                                    {content}
                                </Text>
                            </Box>

                            <Button
                                fontSize={['xs', 'sm', 'md']}
                                minW="10em"
                                bg="none"
                                border="2px"
                                borderColor="#BC9CFF"
                                borderRadius="13px"
                                _active={{
                                    borderRadius: "13px",
                                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    color: "#FFF"
                                }}
                                _hover={{
                                    borderRadius: "13px",
                                    bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                    color: "#FFF"
                                }}
                            >
                                {buttonTitle}
                            </Button>
                        </CardBody>
                    </Card>
                )) }

            </SimpleGrid>

        </Flex>
    )
}

export default DIDVerification