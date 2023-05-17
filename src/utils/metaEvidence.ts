import { t } from "@lingui/macro"

export const metaEvidenceTypes = [
    // Ultra
    // {
    //     label: 'burn',
    //     value: '0'
    // }, {
    //     label: 'adjustOwnership',
    //     value: '1'
    // }, {
    //     label: 'askOwnershipAdjustment',
    //     value: '2'
    // }, {
    //     label: 'answerOwnershipAdjustment',
    //     value: '3'
    // }, 
    {
        label: t`Bona fide transfer`,
        value: '4',
        page: {
            title: t`Ownership adjustment in case of bona fide transfer`,
            summary: t`The Claimant claims that he purchased the pNFT bona fide but the owner of the original NFT refused to transfer him the original.`,
            policyURL: 'https://cloudflare-ipfs.com/ipfs/QmbaUb1TLEj8ZLrjfSiXfn6aqycZRVGfPzSSUVj7MRjR8M/nftprotect-policy-bonafide-transfer.pdf',
            claimantText: t`Claimant acquired the pNFT through this transaction:`,
            claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
            defendantText: t`Defendant was the Original Owner of the NFT and insured it through the Protocol:`,
            defendantTooltip: t`The Defendant is the party that has aquired the pNFT and is challenged.`
        }
    }, {
        label: t`Incorrect address`,
        value: '5',
        page: {
            title: t`Ownership restoration in case of loss of pNFT due to a sending to an incorrect address`,
            summary: t`The Claimant claims that he lost his pNFT due to a sending to an incorrect address.`,
            policyURL: 'https://cloudflare-ipfs.com/ipfs/QmedeZXJcuK6ynaEdT2igAqsVpFenP2u2NGPX6ThuDhwQg/nftprotect-policy-incorrect-address.pdf',
            claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
            claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
            defendantText: t`Defendant acquired the pNFT through this transaction:`,
            defendantTooltip: t`The Defendant is the party that has aquired the pNFT and is challenged.`
        }
    }, {
        label: t`Phishing attack`,
        value: '6',
        page: {
            title: t`Ownership restoration in case of loss of pNFT in phishing attack`,
            summary: t`The Claimant claims that he lost his pNFT due to a phishing attack.`,
            policyURL: 'https://cloudflare-ipfs.com/ipfs/QmaFLVL6a861bnwpr4jKhUN5oq7YXdsMaQfD74SiVDtmaJ/nftprotect-policy-phishing-attack.pdf',
            claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
            claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
            defendantText: t`Defendant acquired the pNFT through this transaction:`,
            defendantTooltip: t`The Defendant is the party that has aquired the pNFT and is challenged.`
        }
    }, {
        label: t`Protocol breach`,
        value: '7',
        page: {
            title: t`Ownership restoration in case of loss of pNFT in a protocol breach`,
            summary: t`The Claimant claims that he lost his pNFT due to a protocol breach.`,
            policyURL: 'https://cloudflare-ipfs.com/ipfs/QmfXtwDKxLXaN8CfbKoWHU7H1jsU5tzmHPyK4KnNgYfwtx/nftprotect-policy-protocol-breach.pdf',
            claimantText: t`Claimant was the Original Owner of the NFT and insured it through the Protocol:`,
            claimantText2: t`Claimant sent pNFT to partner protocol:`,
            claimantTooltip: t`The Claimant is the party that has lost the pNFT but retained control of the Original NFT (Original Owner)`,
            defendantText: t`The pNFT was transfered out of the protocol:`,
            defendantTooltip: t`The Defendant is a smart contract.`        }
    }
]