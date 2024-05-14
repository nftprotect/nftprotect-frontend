import useEnsName from '../hooks/useEnsName';
import { formatAddress } from '../utils/helpers';

interface AddressDisplayProps {
    address: string;
    formatNumber?: number;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, formatNumber = 4 }) => {
    
    const ensName = useEnsName(address as `0x${string}`);

    return <>{ensName || formatAddress(address, formatNumber)}</>;
};

export default AddressDisplay;