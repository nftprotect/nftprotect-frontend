import NFT from "../../classes/NFT"
import { Flex, Image } from "@chakra-ui/react"
import { t } from "@lingui/macro"

const NFTImage = ({ nft, setDefaultStyles = true }: { nft: NFT, setDefaultStyles?: boolean }) => {
    return <Flex
        borderRadius={{base: "16px"}}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.1)"
        overflow="hidden"
        my={setDefaultStyles ? {base: "20px"} : undefined}
        justifyContent="center"
        h={setDefaultStyles ? "150px" : undefined}
        w={setDefaultStyles ? "150px" : undefined}
    >
        <Image 
            src={ nft.thumbnail }
            alt={ nft.title || t`NFT image`}
            borderRadius="1rem"
        />
    </Flex>
}

export default NFTImage