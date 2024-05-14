import React, { useEffect, useRef } from 'react';
import { createConfig, http, useEnsAvatar } from 'wagmi';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { wagmiGatewayUrls } from '../../config';
import jazzicon from '@metamask/jazzicon';

interface AvatarProps {
    address: string;
    name: string | undefined;
    size?: number;
}

const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
})

const Avatar: React.FC<AvatarProps> = ({ address, name, size = 42 }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const { data: ensAvatar, error } = useEnsAvatar({
        name: normalize(name || ''),
        gatewayUrls: wagmiGatewayUrls,
        chainId: mainnet.id,
        config
    });

    useEffect(() => {
        console.log('ENS Avatar:', ensAvatar, error);
    }, [ensAvatar, error])

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = ''; // Clear the container
            ref.current.appendChild(jazzicon(size, parseInt(address.slice(2, 10), 16)));
        }
    }, [address, size]);

    if (!name || !ensAvatar) {
        return <div ref={ref} style={{ width: size, height: size, borderRadius: '50%' }} />;
    }

    return <img src={ensAvatar} alt={name} style={{ width: size, height: size, borderRadius: '50%' }} />;
};

export default Avatar;