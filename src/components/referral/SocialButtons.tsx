import { useReferralLink } from "../../hooks/useReferralLink";
import { 
    Box, Image 
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import {
    TelegramShareButton,
    TelegramIcon,
    WhatsappShareButton,
    WhatsappIcon,
    TwitterShareButton,
    TwitterIcon,
    FacebookMessengerShareButton,
    FacebookMessengerIcon,
    EmailShareButton,
  } from 'next-share';

const SocialButtons = () => {
    const referralLink = useReferralLink() || 'No referral link available';

    const title = t`Here is a link to NFT Protect - an dapp that will protect your NFTs from theft`;
    const spacing = "0.8rem";

    return (
        <Box display="flex" alignItems="center">
            <Box mr={spacing}>
                <TelegramShareButton
                    url={ referralLink }
                    title={ title }
                >
                    <TelegramIcon size={48} round />
                </TelegramShareButton>
            </Box>

            <Box mr={spacing}>
                <WhatsappShareButton
                    url={ referralLink }
                    title={ title }
                    separator=": "
                >
                    <WhatsappIcon size={48} round />
                </WhatsappShareButton>
            </Box>

            <Box mr={spacing}>
                <TwitterShareButton
                    url={ referralLink }
                    title={ title }
                >
                    <TwitterIcon size={48} round />
                </TwitterShareButton>
            </Box>

            <Box mr={spacing}>
                <FacebookMessengerShareButton
                    url={ referralLink }
                    appId={process.env.FACEBOOK_APP_ID || ''}
                >
                    <FacebookMessengerIcon size={48} round />
                </FacebookMessengerShareButton>
            </Box>

            <Box>
                <EmailShareButton
                    url={ referralLink }
                    subject={ t`NFT Protect registration link` }
                    body={t`Register with my referral link to get a coupon for free protection!`}
                >
                    <Image src='/images/icons-social/email.svg' w='48px' h='48px'/>
                </EmailShareButton>
            </Box>
        </Box>
    );
};

export default SocialButtons;