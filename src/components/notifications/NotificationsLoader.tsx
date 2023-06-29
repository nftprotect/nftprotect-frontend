import { useEffect } from "react"
import { useAppContext } from "../../context/AppContextProvider"
import { ReqStatus, ReqType, TokenGraphData, useNftProtectGraph } from "../../hooks/useNftProtectGraph"
import { useNotifications } from "../../hooks/useNotifications"
import { Heading, Text, Link } from "@chakra-ui/react"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import { Trans } from "@lingui/macro"
import { formatAddress, timestampToDate } from "../../utils/helpers"
import { useAlchemy } from "../../hooks/useAlchemy"
import { BigNumber } from '@ethersproject/bignumber'
import NFT, { ActionRequest } from "../../classes/NFT"
import { createDisputeLink } from "../../utils/kleros"

const CommonNotificationBody = ({
    header,
    message
}:{
    header: JSX.Element,
    message: JSX.Element
}) => <div>
        <Heading 
            fontSize={{base: "0.875rem"}}
            mb={{base: "0.625rem"}}
        >
            ${header}
        </Heading>
        <Text
            fontSize={{base: "0.625rem"}}
        > 
            ${message}
        </Text>
    </div>

const NotificationsLoader = () => {
    const context = useAppContext()
    const { account, active, currentChain, nftProtectContract } = context
    const { listTokensReceived, listTokensTransfered } = useNftProtectGraph()
    const { addNotification } = useNotifications()
    //const { getNftMetadata } = useAlchemy(currentChain?.alchemyId)


    const generateNotificationId = (nft: TokenGraphData) => {
        const requestPart = nft.latestRequest ? 
            `${nft.latestRequest.id}-${nft.latestRequest.type}-${nft.latestRequest.status}` :
            'none'
        return `${nft.id}-${requestPart}`
    }

    const loadRequest = async (requestId: BigNumber): Promise<ActionRequest> => {
        const request = await nftProtectContract.requests(requestId)
        return {id: requestId, ...request}
    }

    const loadNotifications = async () => {
        if (account) {
            // All pNFTs received by account
            const receivedNfts = await listTokensReceived(account)
            // All pNfts transfered from account
            const transferedNfts = await listTokensTransfered(account)
            console.log('GRAPH TOKENS', receivedNfts, transferedNfts)
            receivedNfts.forEach(async (nft) => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    const loadedRequest = await loadRequest(request.id)
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {
                        if (loadedRequest.externalDisputeId) {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 19. Original NFT received by request with dispute
                                addNotification({
                                    id: notificationId, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>
                                                    The Arbitrator’s ruling on the dispute 
                                                    <Link
                                                        isExternal 
                                                        rel="noreferrer"
                                                        href={createDisputeLink(loadedRequest.externalDisputeId)}
                                                        whiteSpace="nowrap"
                                                        display="flex"
                                                        alignItems="center"
                                                    >
                                                        #{loadedRequest.externalDisputeId.toString()}
                                                        <ExternalLinkIcon fontSize='16px' ml="5px" />
                                                    </Link>
                                                    is now in effect.
                                                </Trans>
                                            }
                                            message={
                                                <Trans>{`The original NFT is now yours. We recommend protecting it using NFT Protect.`}</Trans>
                                            }
                                        />, 
                                    severity: 0,
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.Burn) {
                                // 30.2 pNFT burn accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>
                                                    <Link
                                                        isExternal 
                                                        rel="noreferrer"
                                                        href={createDisputeLink(loadedRequest.externalDisputeId)}
                                                        whiteSpace="nowrap"
                                                        display="flex"
                                                        alignItems="center"
                                                    >
                                                        Dispute #{loadedRequest.externalDisputeId.toString()}
                                                        <ExternalLinkIcon fontSize='16px' ml="5px" />
                                                    </Link>
                                                    decision is now in force.
                                                </Trans>
                                            }
                                            message={
                                                <Trans>{`Your pNFT has been burned.`}</Trans>
                                            }
                                        />, 
                                    severity: 0,
                                    dateCreated: request.updateDate
                                })
                            }
                        } else {
                            // 22. Original NFT received by request without dispute
                            addNotification({
                                id: notificationId, 
                                children: 
                                    <CommonNotificationBody
                                        header={
                                            <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has transferred the original NFT to you.</Trans>
                                        }
                                        message={
                                            <Trans>We recommend protecting it using NFT Protect.</Trans>
                                        }
                                    />,
                                severity: 0,
                                dateCreated: request.updateDate
                            })
                        }
                    } else if (request.status === ReqStatus.Disputed) {

                    } else if (request.status === ReqStatus.Initial) {
                        // If request timeout expired
                        if (loadedRequest.timeout) {
                            const timeoutDate = timestampToDate(loadedRequest.timeout.toNumber())
                            if (timeoutDate <= new Date()) {
                                // 4. Original NFT request timeout
                                addNotification({
                                    id: notificationId, 
                                    children:
                                        <CommonNotificationBody
                                            header={
                                                <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has not responded.</Trans>
                                            }
                                            message={
                                                <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                            }
                                        />,
                                    severity: 0,
                                    dateCreated: timeoutDate
                                })
                            } else {
                                // 1. Request sent to the original NFT owner
                                addNotification({
                                    id: notificationId, 
                                    children:
                                        <CommonNotificationBody
                                            header={
                                                <Trans>Request sent to the original NFT owner.</Trans>
                                            }
                                            message={
                                                <></>
                                            }
                                        />,
                                    severity: 0,
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    } else if (request.status === ReqStatus.Rejected) {
                        if (loadedRequest.externalDisputeId) {
                            // 20. Original NFT rejected by request with dispute
                            addNotification({
                                id: notificationId, 
                                children: 
                                    <CommonNotificationBody
                                        header={
                                            <Trans>
                                                The Arbitrator’s ruling on the dispute 
                                                <Link
                                                    isExternal 
                                                    rel="noreferrer"
                                                    href={createDisputeLink(loadedRequest.externalDisputeId)}
                                                    whiteSpace="nowrap"
                                                    display="flex"
                                                    alignItems="center"
                                                >
                                                    #{loadedRequest.externalDisputeId.toString()}
                                                    <ExternalLinkIcon fontSize='16px' ml="5px" />
                                                </Link>
                                                is now in effect.
                                            </Trans>
                                        }
                                        message={
                                            <Trans>{`Your pNFT is now burned. You can't pretend to original NFT.`}</Trans>
                                        }
                                    />, 
                                severity: 0,
                                dateCreated: request.updateDate
                            })
                        } else {
                            // 3. Original NFT request rejected without dispute
                            addNotification({
                                id: notificationId, 
                                children:
                                    <CommonNotificationBody
                                        header={
                                            <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has refused to transfer the original NFT to you.</Trans>
                                        }
                                        message={
                                            <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                        }
                                    />,
                                severity: 0,
                                dateCreated: request.updateDate
                            })
                        }
                    }
                } else {
                    // NFT has no pending request
                    // 0. pNFT received
                    addNotification({
                        id: notificationId, 
                        children:
                            <CommonNotificationBody
                                header={
                                    <Trans>You have received a pNFT! </Trans>
                                }
                                message={
                                    <Trans>Would you like to request the original NFT?</Trans>
                                }
                            />,
                        severity: 0,
                        dateCreated: new Date() // TODO: search for transaction
                    })
                }

            })
            transferedNfts.forEach(async (nft) => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    const loadedRequest = await loadRequest(request.id)
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {
                        if (loadedRequest.externalDisputeId) {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 30.1 Original NFT request accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>
                                                    <Link
                                                        isExternal 
                                                        rel="noreferrer"
                                                        href={createDisputeLink(loadedRequest.externalDisputeId)}
                                                        whiteSpace="nowrap"
                                                        display="flex"
                                                        alignItems="center"
                                                    >
                                                        Dispute #{loadedRequest.externalDisputeId.toString()}
                                                        <ExternalLinkIcon fontSize='16px' ml="5px" />
                                                    </Link>
                                                    decision is now in force.
                                                </Trans>
                                            }
                                            message={
                                                <Trans>{`The original NFT has been transferred to the new owner ${formatAddress(loadedRequest.newowner, 4)}.`}</Trans>
                                            }
                                        />, 
                                    severity: 0,
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    } else if (request.status === ReqStatus.Disputed) {

                    } else if (request.status === ReqStatus.Initial) {
                        // 21. Request to transfer original received
                        addNotification({
                            id: notificationId, 
                            children:
                                <CommonNotificationBody
                                    header={
                                        <Trans>User ${formatAddress(nft.ownerAddress, 4)} is requesting the original NFT.</Trans>
                                    }
                                    message={
                                        <Trans>Do you want to transfer the original NFT to them?</Trans>
                                    }
                                />,
                            severity: 0,
                            dateCreated: request.updateDate
                        })
                    } else if (request.status === ReqStatus.Rejected) {

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