import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import ConnectButton from "./ConnectButton";

const LoginScreen = () => 
    <Flex
        w="100%"
        h={{ base: "calc(100vh - 120px)" }}
        justifyContent="center"
        alignItems="center"
        bgImage="url('/images/startPageBanner.png')"
        bgRepeat="no-repeat"
        bgPosition="top center"
        // bgSize="auto 100%"
        bgSize="cover"
    >
    <Flex flexDir="column" alignItems="center">
        <Image
            src="/images/logoBlue.svg"
            alt="Logo"
            h={{ base: "75px" }}
            mb={{ base: "40px" }}
        />
        <Text
            fontFamily="Lexend"
            fontSize={{ base: "44px" }}
            lineHeight={{ base: "42px" }}
            fontWeight={{ base: "900" }}
            letterSpacing={{ base: "0.04em" }}
            textAlign="center"
        >
            <Trans>Connect your wallet<br/>& get protected</Trans>
        </Text>
        <Box mt={10}>
            <Box w={{ base: "14rem", sm: "16rem" }}>
                <ConnectButton buttonVariant={"primaryLight"} />
            </Box>
        </Box>
    </Flex>
</Flex>

export default LoginScreen;