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
        alignItems="center" 
        h={setDefaultStyles ? "150px" : '100%'}
        w={setDefaultStyles ? "150px" : '100%'}
        maxH='100%'
        >
        <Image 
            src={ nft.thumbnail }
            alt={ nft.title || t`NFT image`}
            borderRadius="4px"
            maxH='100%'
            maxW='100%'
            objectFit="contain"
        />
    </Flex>
}

export default NFTImage