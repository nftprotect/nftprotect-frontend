import { useReadContract } from 'wagmi';
import { supportedChains } from '../config';
import NFTProtectABI from '../abi/NFTProtectABI';
import { BigNumber } from '@ethersproject/bignumber';
import { ActionRequest } from '../classes/NFT';

export const useGetToken = (chainId: number, tokenId: BigNumber) => {
  const chainConfig = supportedChains.find(chain => chain.id === chainId);

  if (!chainConfig) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const contractConfig = {
    address: chainConfig.nftpContractAddress as `0x${string}`,
    abi: NFTProtectABI,
    chainId: chainConfig.id,
  };

  return useReadContract({
    ...contractConfig,
    functionName: 'tokens',
    args: [tokenId.toString()],
  });
};


export const useGetRequest = (chainId: number, requestId: BigNumber) => {
  const chainConfig = supportedChains.find(chain => chain.id === chainId);

  if (!chainConfig) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const contractConfig = {
    address: chainConfig.nftpContractAddress as `0x${string}`,
    abi: NFTProtectABI,
    chainId: chainConfig.id,
  };

  const { data }: {data: any} = useReadContract({
    ...contractConfig,
    functionName: 'requests',
    args: [requestId.toString()],
  });

  if (data) {
    const actionRequest: ActionRequest = {
        ...data,
      id: BigNumber.from(data.id),
      tokenId: BigNumber.from(data.tokenId),
      newowner: data.newowner,
      timeout: BigNumber.from(data.timeout),
      arbitratorId: Number(data.arbitratorId),
      localDisputeId: BigNumber.from(data.localDisputeId),
      externalDisputeId: BigNumber.from(data.externalDisputeId),
      metaevidence: Number(data.metaevidence),
    };
    return actionRequest;
  }
  return undefined;
};