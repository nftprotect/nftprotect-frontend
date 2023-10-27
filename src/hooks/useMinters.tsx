import { useContext, useEffect, useMemo, useRef } from "react";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import { Contract } from "@ethersproject/contracts";
import SimpleNFTMinter721ABI from "../abi/SimpleNFTMinter721ABI";
import SimpleNFTMinter1155ABI from "../abi/SimpleNFTMinter1155ABI";
import { simpleMinters } from "../config";
import { Web3Provider } from "@ethersproject/providers";

export const useMinters = () => {
    const currentContext = useContext(AppContext)
    if (!currentContext) {
        throw new Error(
            "useMinters has to be used within <AppContext.Provider>"
        );
    }
    const { currentChain, active, library, nftProtectContract, arbRegistryContract, currentBlock } = useAppContext()
    const minter721Contract = useMemo(() => {
        const address = simpleMinters.find(it => it.chainId === currentChain?.id)?.contracts?.ERC721
        if (address) {
            return new Contract(
                address,
                SimpleNFTMinter721ABI, 
                active ? (library as Web3Provider).getSigner() : library
            )
        } else {
            console.error('Contract for simple minter 721 not found!')
            return undefined
        }
    }, [currentChain])

    const minter1155Contract = useMemo(() => {
        const address = simpleMinters.find(it => it.chainId === currentChain?.id)?.contracts?.ERC1155
        if (address) {
            return new Contract(
                address,
                SimpleNFTMinter1155ABI, 
                active ? (library as Web3Provider).getSigner() : library
            )
        } else {
            console.error('Contract for simple minter 721 not found!')
            return undefined
        }
    }, [currentChain])

    const mint = async ( 
        type: 'ERC721'|'ERC1155',
        amount: number,
        tokenURI: string
    ): Promise<any> => {
        if (type === 'ERC721') {
            if (minter721Contract) {
                return minter721Contract.mint(tokenURI)
            }
        } else {
            if (minter1155Contract) {
                return minter1155Contract.mint(amount, tokenURI)
            }
        }
    }

    return {
        mint
    }
}