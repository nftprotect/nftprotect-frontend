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
    EmailIcon,
  } from 'next-share';

const SocialButtons = () => {
    const referralLink = useReferralLink() || 'No referral link available';

    const title = t`Here is a link to NFT Protect - an dapp that will protect your NFTs from theft`;

    return (
        <Box>
            <TelegramShareButton
                url={ referralLink }
                title={ title }
            >
                <TelegramIcon size={48} round />
            </TelegramShareButton>

            <WhatsappShareButton
                url={ referralLink }
                title={ title }
                separator=":: "
                >
                <WhatsappIcon size={48} round />
            </WhatsappShareButton>

            <TwitterShareButton
                url={ referralLink }
                title={ title }
            >
                <TwitterIcon size={48} round />
            </TwitterShareButton>

            <FacebookMessengerShareButton
                url={ referralLink }
                appId={process.env.FACEBOOK_APP_ID || ''}
            >
                <FacebookMessengerIcon size={48} round />
            </FacebookMessengerShareButton>

            <EmailShareButton
                url={ referralLink }
                subject={ t`` }
                body={t`Register with my referral link to get a coupon for free protection!\n`}
                >
                {/* <EmailIcon size={48} round /> */}
                <Image src='/images/socialMediaIcons/email.svg' w='48px' h='48px'/>
            </EmailShareButton>
        </Box>
    );
};

export default SocialButtons;