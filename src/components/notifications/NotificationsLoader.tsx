import { useEffect } from "react"
import { useAppContext } from "../../context/AppContextProvider"
import { ReqStatus, TokenGraphData, useNftProtectGraph } from "../../hooks/useNftProtectGraph"
import { useNotifications } from "../../hooks/useNotifications"
import { Heading, Text } from "@chakra-ui/react"
import { Trans } from "@lingui/macro"
import { formatAddress } from "../../utils/helpers"

const NotificationsLoader = () => {

    const { account, active } = useAppContext()
    const { listTokensReceived, listTokensTransfered } = useNftProtectGraph()
    const { addNotifications } = useNotifications()

    const generateNotificationId = (nft: TokenGraphData) => {
        const requestPart = nft.latestRequest ? 
            `${nft.latestRequest.id}-${nft.latestRequest.type}-${nft.latestRequest.status}` :
            'none'
        return `${nft.id}-${requestPart}`
    }

    const loadNotifications = async () => {
        console.log('GRAPH LOAD')
        if (account) {
            // All pNFTs received by account
            const receivedNfts = await listTokensReceived(account)
            // All pNfts transfered from account
            const transferedNfts = await listTokensTransfered(account)
            console.log('GRAPH TOKENS', receivedNfts, transferedNfts)
            receivedNfts.forEach(nft => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {
                        addNotifications([
                            {
                                id: notificationId, 
                                children:
                                    <div>
                                        <Heading 
                                            fontSize={{base: "0.875rem"}}
                                            mb={{base: "0.625rem"}}
                                        >
                                            <Trans>User ${formatAddress(nft.originalOwnerAddress)} has transferred the original NFT to you</Trans>
                                        </Heading>
                                        <Text
                                            fontSize={{base: "0.625rem"}}
                                        > 
                                            <Trans>We recommend protecting it using NFT Protect</Trans>
                                        </Text>
                                    </div>, 
                                severity: 0,
                                dateCreated: request.updateDate
                            }
                        ])
                    } else if (nft.latestRequest.status === ReqStatus.Disputed) {

                    } else if (nft.latestRequest.status === ReqStatus.Initial) {

                    } else if (nft.latestRequest.status === ReqStatus.Rejected) {

                    }
                } else {
                    // NFT has no pending request
                    addNotifications([
                        {
                            id: notificationId, 
                            children:
                                <div>
                                    <Heading 
                                        fontSize={{base: "0.875rem"}}
                                        mb={{base: "0.625rem"}}
                                    >
                                        <Trans>User ${formatAddress(nft.ownerAddress)} has transferred the original NFT to you</Trans>
                                    </Heading>
                                    <Text
                                        fontSize={{base: "0.625rem"}}
                                    > 
                                        <Trans>Would you like to request the original NFT?</Trans>
                                    </Text>
                                </div>, 
                            severity: 0,
                            dateCreated: new Date() // TODO: search for transaction
                        }
                    ])
                }

            })
            transferedNfts.forEach(nft => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {

                    } else if (request.status === ReqStatus.Disputed) {

                    } else if (request.status === ReqStatus.Initial) {
                        addNotifications([
                            {
                                id: notificationId, 
                                children:
                                    <div>
                                        <Heading 
                                            fontSize={{base: "0.875rem"}}
                                            mb={{base: "0.625rem"}}
                                        >
                                            <Trans>User ${formatAddress(nft.ownerAddress, 4)} requested the original NFT from you</Trans>
                                        </Heading>
                                        <Text
                                            fontSize={{base: "0.625rem"}}
                                        > 
                                            <Trans>Would you like to transfer the original NFT to the new owner?</Trans>
                                        </Text>
                                    </div>, 
                                severity: 0,
                                dateCreated: request.updateDate
                            }
                        ])
                    } else if (nft.latestRequest.status === ReqStatus.Rejected) {

                    }
                } else {
                    // NFT has no pending request

                }

            })
        }
    }

    useEffect(() => { loadNotifications() }, [account, active])


    return <></>
}

export default NotificationsLoader