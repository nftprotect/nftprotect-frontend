import { useEnsName } from 'wagmi';
import { formatAddress } from '../utils/helpers';
import { useEffect } from 'react';
import { mainnet } from 'wagmi/chains';
import { http, createConfig } from 'wagmi'

interface AddressDisplayProps {
    address: string;
    formatNumber?: number;
}
const nullAddress = '0x0000000000000000000000000000000000000000'

// Config pointing to public http provider for ENS resolving
const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
})

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, formatNumber = 4 }) => {
    
    const normalizedAddress = address.startsWith('0x') ? address as `0x${string}` : nullAddress;
    const { data: ensName, error } = useEnsName({ address: normalizedAddress, chainId: mainnet.id, config });

    useEffect(() => {
        console.log('ENS', address, ensName, error)
    }, [ensName, error])

    return <>{ensName || formatAddress(address, formatNumber)}</>;
};

export default AddressDisplay;