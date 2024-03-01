import { useEnsName } from 'wagmi';
import { formatAddress } from '../utils/helpers';
import { useEffect } from 'react';

interface AddressDisplayProps {
    address: string;
    formatNumber?: number;
}
const nullAddress = '0x0000000000000000000000000000000000000000'

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, formatNumber = 4 }) => {
    
    const normalizedAddress = address.startsWith('0x') ? address as `0x{string}` : nullAddress;
    const { data: ensName, error } = useEnsName({ address: normalizedAddress });

    useEffect(() => {
        console.log('ENS', address, ensName, error)
    }, [ensName, error])

    return <>{ensName || formatAddress(address, formatNumber)}</>;
};

export default AddressDisplay;