import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Button } from '@chakra-ui/react'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { ERC721ABI } from '../../pages/abi/ERC721ABI';
import { ERC1155ABI } from '../../pages/abi/ERC1155ABI';
import { nftpContractAddress } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
}

const SecureNFTButton = (props: ButtonInitialData) => {

    const nft = props.nft
    const metadata = props.metadata
    const { chainId, account, setError, library, connector } = useWeb3React<Web3Provider>()
    const abi = (nft.contractType === 'ERC721') ?
        ERC721ABI :
        (nft.contractType === 'ERC1155') ?
        ERC1155ABI :
        null

    const secureNFT = () => {
        const contractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId

        console.log(contractAddress, tokenId, metadata)

        if (abi === null) {
            console.log('Unknown NFT type: ', nft)
            return
        }

        const contract: Contract = new Contract(contractAddress, abi, library)
        library?.getCode(contractAddress).then( (result: string ) => {
            //check whether it is a contract
            if(result === '0x') return

            // do actions with contract

        })
    }

    return (
        <Button
            type='button'
            onClick={ secureNFT }
        >
            <Sandbox fontSize='20px'/>
        </Button>
    )
}

export default SecureNFTButton