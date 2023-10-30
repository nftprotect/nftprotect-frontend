import { useEnsName } from 'wagmi';
import { formatAddress } from '../utils/helpers';

interface AddressDisplayProps {
    address: string;
    formatNumber?: number;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, formatNumber = 4 }) => {
    const { data: ensName } = useEnsName({ address } as any);

    return <>{ensName || formatAddress(address, formatNumber)}</>;
};

export default AddressDisplay;