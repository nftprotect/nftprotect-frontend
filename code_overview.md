The NFTProtect application uses [ConnectKit](https://docs.family.co/connectkit). This library is built on wagmi/viem and fully implements all the functionality related to account connection and network switching, including all necessary dialog boxes.

# ConnectKit Integration

ConnectKit is connected in `_app.tsx` as follows:

```typescript
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { supportedChains } from '../config'

// Forming the config
const chains = supportedChains.map(it => it.wagmiId)
const connectKitConfig = getDefaultConfig({
    // Required API Keys (from .env)
    infuraId: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    // Required
    appName: "NFT Protect",
    // Optional
    autoConnect: true,
    chains,
    appDescription: "NFT Protect is an application that allows you to protect your NFTs and be sure of their safety without fear of theft.",
    appUrl: "https://dev.nftprotect.app",
    appIcon: "https://dev.nftprotect.app/images/logoBlue.svg",
});
const config = createConfig(connectKitConfig);

// Wrapping our application with providers using the config
return (
    <WagmiConfig config={config}>
         <ConnectKitProvider>
            <AppContextProvider>
                ...
            </AppContextProvider>
        </ConnectKitProvider>
    </WagmiConfig>
) 
```

ConnectKit also provides a component for the connection button, we have it wrapped with the `ConnectButton.tsx` component, which in addition to custom styling, displays the network switch button if the wrong network is selected. This is enough for the wallet connection functionality to appear in the application.

# AppContextProvider

In our application, there is a context provider `context/AppContextProvider.tsx`. Before switching from web3-react to connectkit, it essentially served as a wrapper over the useWeb3React hook, providing the application with some additional data, such as the contracts used in the application and some information for configuring the application, loaded from them.

Now part of the functionality in this provider is left for compatibility, as the application mostly still works on ethers.js. Specifically for this, in `AppContextProvider`, the client objects from wagmi are transformed into provider from ethers.js:

```typescript
import { clientToProvider } from '../utils/ethers';

...
const publicClient = usePublicClient(chainId ? {chainId} : undefined)
const publicProvider = clientToProvider(publicClient)
const {
    data: walletClient,
    isSuccess: walletClientActive
} = useWalletClient()
const { 
    address: account,
    isConnected: active,
    isDisconnected
} = useAccount()
const { chain } = useNetwork()
const isCorrectChain = !chainId || !chain || (chainId === chain?.id)
const currentClient = walletClientActive && walletClient && isCorrectChain ? 
    walletClient : 
    publicClient
const providedLibrary = clientToProvider(currentClient)
```

The `providedLibrary` object is then used in other application components still using ethers.js. The `clientToProvider` function is written based on recommendations from [wagmi documentation](https://wagmi.sh/react/ethers-adapters).

Also inside this provider, network switching is implemented through the `setChainId(chainId: number)` method. If a `chainId` different from the current network is passed, the public client for the specified network will be used as the client until the user switches the network to the correct one. This functionality is used, for example, on requestId pages, as we need to display data from a specific known network in advance.

The `AppContextProvider` still contains methods implemented through ethers.js and requiring rework using [wagmi hooks](https://wagmi.sh/react/hooks/useContractWrite) / [wagmi core](https://wagmi.sh/core/actions/writeContract):
- `setDidState`
- `setCurrentFee`
- `couponsBalanceLoader`

The full list of parameters returned by the `useAppContext` hook is described by the interface:

```typescript
export interface AppContextInterface {
    active: boolean, // Account is active (WalletClient is connected and the wallet network matches the required one)
    isCorrectChain: boolean, // Wallet network matches the required one
    account: string | null | undefined, // Connected wallet
    client: WalletClient|PublicClient,  // Current used Client (wagmi)
    library: BaseProvider,  // Current used provider (ethers.js)
    defaultChain: any | undefined,  // Default network (object from config)
    currentChain: any | undefined,  // Current network (object from config)
    nftProtectContract: Contract,   // Various contracts used follow
    arbRegistryContract: Contract,
    dynamicArbRegistryContract: Contract,
    referrerAddress: string,        // Referrer address, currently set to null as it is not used
    didRegistered: boolean | undefined, // User has a registered DID (gitcoin passport, proof of humanity etc.)
    currentBlock: number | undefined, // Current block. Should be removed as it is provided by wagmi
    baseTokenPrice: number | undefined, // Price of the main token in dollars
    fee: number | undefined,    // Cost of NFT protection
    couponsBalance: number | undefined, // Coupons balance
    setChainId: Function    // Function to set the current network
}
```

# useArbitrableProxy, useMinters
The useArbitrableProxy hook implements interaction with the ArbitrableProxy and Arbitrator (Kleros) contracts. The main methods of this hook are:
- `listEvidences`: returns a list of evidences for a given dispute.
- `getPeriod`: returns the current period of the dispute.
- `isRuled`: checks if a decision has already been made on the dispute.
- `submitEvidence`: allows to submit evidence for the dispute.

The useMinters hook implements interaction with the SimpleMinter contracts for minting test NFTs. The main method of this hook is mint, which takes the type of NFT ('ERC721' or 'ERC1155'), the amount and the URI of the token. Depending on the type of NFT, the method calls the corresponding contract for minting.

These hooks are implemented similarly and are currently implemented using ethers.js. Their logic is as simple as possible.
These hooks need to be migrated to use [wagmi hooks](https://wagmi.sh/react/hooks/useContractWrite) / [wagmi core](https://wagmi.sh/core/actions/writeContract), instead of ethers.js methods.

# classes/NFT.ts

The `NFT` class serves to represent individual NFTs. It implements the `NFTInterface` from the `alchemy-sdk` library.
In subsequent versions of the application (using v2 contracts) this class will be almost completely rewritten.

## Constructor

The class constructor takes the following parameters:

- `alchemyNFT`: an NFT object obtained from the Alchemy API.
- `context`: the application context returned by `AppContextProvider`.
- `otherProps`: additional properties that can be added to the NFT object.

Inside the constructor, the main properties of the NFT object are initialized with values from `alchemyNFT`. Additional properties can be added through `otherProps`.

```typescript
constructor(alchemyNFT: NFTInterface, context: AppContextInterface, otherProps?: any) {
    this.tokenId = alchemyNFT.tokenId;
    this.tokenType = alchemyNFT.tokenType;
    this.contract = alchemyNFT.contract;
    this.title = alchemyNFT.title || alchemyNFT.contract.name || '';
    this.description = alchemyNFT.description;
    this.timeLastUpdated = alchemyNFT.timeLastUpdated;
    this.metadataError = alchemyNFT.metadataError;
    this.tokenUri = alchemyNFT.tokenUri;
    this.rawMetadata = alchemyNFT.rawMetadata;
    this.media = alchemyNFT.media;
    this.spamInfo = alchemyNFT.spamInfo;
    this.thumbnail = this.media && this.media[0] &&  this.media[0].gateway || '/images/noImage.png'
    this.context = context
    this.events = new EventTarget();

    if (otherProps) {
        Object.assign(this, otherProps);
    }
}
```
Passing context here is not a very good approach, in particular because it requires constant recreation of NFT objects when the context changes.
As I see it, all the functionality that relies on data from the context inside this class needs to be rewritten to use [wagmi core](https://wagmi.sh/core/actions/writeContract). Passing data from the context should be completely avoided.

## Main methods

- `isPNFT()`: Returns `true` if the NFT is a pNFT issued by NFTProtect.
- `isOwnedBy(address: string)`: Returns `true` if the NFT belongs to the specified address.
- `isMintedBy(address: string)`: Returns `true` if the NFT was created by the specified contract.
- `loadOwnerAddress()`: Loads the NFT owner's address.
- `loadTokenAmount()`: Loads the amount of NFT tokens.
- `loadInitialData()`: Launches functions to load initial additional data - owner address and token amount.
- `loadPendingRequest()`: Loads the request (request), if it exists.
- `loadAnotherData()`: Launches functions to load secondary data (original NFT data and request, if any).
- `addEventListener(eventType: string, listener: EventListener)`: Adds an event listener.
- `removeEventListener(eventType: string, listener: EventListener)`: Removes an event listener.

## Events in the NFT.ts class

The following events are used in the NFT class:

- `InitialNFTDataLoaded`: This event is generated when the initial NFT data is loaded, namely the owner's address and the number of tokens (for ERC1155).

- `OriginalNFTDataLoaded`: This event is generated when the original NFT data associated with the current pNFT is loaded.

- `PendingRequestLoaded`: This event is generated when the request data for the current token is loaded, if any.

These events are used to notify other parts of the application that certain data has been loaded or updated.