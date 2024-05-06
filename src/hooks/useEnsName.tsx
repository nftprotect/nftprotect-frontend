import { useEnsName as useWagmiEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

// Config pointing to public http provider for ENS resolving
const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
});

const useEnsName = (address: `0x${string}`) => {
    const { data, error } = useWagmiEnsName({ address, chainId: mainnet.id, config });

    useEffect(() => {
        if (error) {
            console.error('Error fetching ENS name:', error);
        }
    }, [error]);

    return data?.toString();
};

export default useEnsName;