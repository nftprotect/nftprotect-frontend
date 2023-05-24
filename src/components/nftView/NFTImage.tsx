import NFT from "../../classes/NFT"
import { Flex, Image } from "@chakra-ui/react"
import { t } from "@lingui/macro"

const NFTImage = ({ nft }: { nft: NFT }) => {
    return <Flex
        borderRadius={{base: "16px"}}
        filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
        overflow="hidden"
        my={{base: "20px"}}
        justifyContent="center"
        h="150px"
        w="150px"
    >
        <Image 
            src={ nft.thumbnail }
            alt={ nft.title || t`NFT image`}
            borderRadius="1rem"
        />
    </Flex>
}

export default NFTImage