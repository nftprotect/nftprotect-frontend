import type { NextPage } from "next";
import {
  chakra,
  Container,
  Heading,
  Image,
  Flex,
  Text,
  Button,
  Box,
  Grid,
  GridItem,
  ChakraBaseProvider,
} from "@chakra-ui/react";
import { useAppContext } from "../context/AppContextProvider";
import NFTView from "../components/nftView/NFTView";
import Footer from "../components/footer/Footer";
import ShowNotifications from "../components/notifications/ShowNotifications";
import { useNotifications } from "../hooks/useNotifications";
import { Trans, t } from "@lingui/macro";
import { GetStaticProps } from "next";
import { loadTranslation } from "../utils/lingui";
import Head from "next/head";
import NavBar from "../components/navBar/NavBar";

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadTranslation(
    ctx.locale!,
    process.env.NODE_ENV === "production"
  );

  return {
    props: {
      translation,
    },
  };
};

const FourFour: NextPage = () => {
  return (
    <>
      <Head>
        <meta name="404" content={t`Page Not Found`} />
        <title>{t`404`}</title>
      </Head>
      <Grid
        templateAreas={`"nav"
                            "main"
                            "footer"`}
        gridTemplateRows={"60px 1fr 60px"}
        gridTemplateColumns={"1fr"}
        maxW="1920px"
        minH="100vh"
        p={0}
        mx="auto"
        flexDirection="column"
        position="relative"
      >
        <GridItem
          area={"nav"}
          position="sticky"
          top="0"
          zIndex="1"
          bgColor="brand.light"
          color="#FFF"
          w="100%"
          display="flex"
        >
          <NavBar />
        </GridItem>

        <GridItem area={"main"}>
          <chakra.main>
            <Flex
              direction={"row"}
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
              <Box padding={[10, 30, 40, 100]}>
                <Heading fontSize={"100px"}>404</Heading>
                <Heading fontSize={"44px"}>page not found</Heading>
                <Text fontSize={"20px"} paddingTop={10} paddingBottom={10}>
                  Page doesn&apos;t exist or was removed. We suggest you back
                  home.
                </Text>
                <Button background="#1316DD" width="183px">
                  <Text color="white">Back to homepage</Text>
                </Button>
              </Box>
              <Box flex={1} />
            </Flex>
          </chakra.main>
        </GridItem>

        <GridItem area={"footer"}>
          <Footer />
        </GridItem>
      </Grid>
    </>
  );
};

export default FourFour;
