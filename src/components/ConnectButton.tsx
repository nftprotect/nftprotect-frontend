import { Button } from "@chakra-ui/react";
import { Trans, t } from '@lingui/macro'
import { Wallet, Swap } from '@web3uikit/icons';
import { useSwitchChain } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { useAppContext } from "../context/AppContextProvider";

interface ConnectButtonInterface {
    chainId?: number,
    buttonVariant?: string
}

const ConnectButton = ({
    chainId,
    buttonVariant = 'primaryLight'
}: ConnectButtonInterface) => {

    const { active, isCorrectChain } = useAppContext() 
    const { switchChain } = useSwitchChain()

    if (active) {
        return (
            <Button 
                variant={buttonVariant}
                leftIcon={<Wallet fontSize="1.375rem" />}
            >
                <Trans>Wallet Connected</Trans>
            </Button>
        );
    } else {
        if (isCorrectChain) {
            return <ConnectKitButton.Custom>
                {({ show }) => {
                    return (
                        <Button 
                            variant={buttonVariant}
                            onClick={show}
                            leftIcon={<Wallet fontSize="1.375rem" />}
                        >
                            <Trans>Connect Wallet</Trans>
                        </Button>
                    );
                }}
            </ConnectKitButton.Custom>
        } else if (chainId && switchChain) {
            return <Button
                variant={buttonVariant}
                leftIcon={<Swap fontSize="1.375rem" />}
                onClick={() => {
                    switchChain({chainId})
                }}
            >
                <Trans>Switch network</Trans>
            </Button>
        } else {
            return <Trans>Invalid network state</Trans>
        }
    }
}

export default ConnectButton;