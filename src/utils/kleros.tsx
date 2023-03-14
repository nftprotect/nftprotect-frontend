interface MetaEvidence {
    title: string,
    category: string | undefined,
    description: string | undefined,
    claimant: string,
    defendant: string,
    question: string,
    ruling: {[P in string]: string|undefined},
    fileURI: string
}

// Generates data for metaEvidence.json file
export const generateMetaEvidence = ({
    title,
    category,
    description,
    claimant,
    defendant,
    question,
    ruling,
    fileURI
}:MetaEvidence) => {
    const aliases:any = {}
    aliases[claimant] = 'Claimant'
    aliases[defendant] = 'Defendant'
    const rulingTitles = Object.keys(ruling)
    let rulingDescriptions = Object.values(ruling)
    rulingDescriptions = rulingDescriptions[0] ? 
        rulingDescriptions.map((item) => item || '') :
        []

    return {
        title,
        category,
        description,
        aliases,
        question,
        rulingOptions: {
            type: "single-select",
            titles: rulingTitles,
            descriptions: rulingDescriptions 
        },
        fileURI,
        dynamicScriptURI: "/ipfs/QmZZHwVaXWtvChdFPG4UeXStKaC9aHamwQkNTEAfRmT2Fj"
    }
}

// Generate extra data to interact with Kleros contract
export const generateArbitratorExtraData = (subcourtID: string, noOfVotes: string) => `0x${parseInt(subcourtID, 10).toString(16).padStart(64, "0") + parseInt(noOfVotes, 10).toString(16).padStart(64, "0")}`;

// An enum of Kleros courts
export enum KlerosCourts {
    General,
    Blockchain,
    NonTechnical,
    TokenListing,
    Technical,
    MarketingServices,
    EnglishLanguage,
    VideoProduction,
    Onboarding,
    Curation,
    DataAnalysis,
    StatisticalModeling,
    CurationMedium,
    SpanishEnglishTranslation,
    FrenchEnglishTranslation,
    PortugueseEnglishTranslation,
    GermanEnglishTranslation,
    RussianEnglishTranslation,
    KoreanEnglishTranslation,
    JapaneseEnglishTranslation,
    TurkishEnglishTranslation,
    ChineseEnglishTranslation,
    CorteGeneralEnEspanol,
    HumanityCourt
}

export const klerosCases = {
    arbitrateOwnershipAdjustment: {
        title: "Request for ownership adjustment in case of Bona Fide Transfer",
        category: "NFT Protect",
        question: "To ensure the pNFT was acquired in a Bona Fide Transfer, therefore pNFT must be burned, and the Original must be sent to the pNFT owner.",
        ruling: {
            "Refuse to arbitrate": "If the Criteria for accepting claim are not met, jurors must choose to refuse to arbitrate",
            "pNFT was acquired in a Bona Fide Transfer": `The ruling in favor of pNFT Owner (the Claimant)
If the pNFT Owner has acquired pNFT in a Bona Fide Transfer, the Protocol must adjust ownership of the Original NFT to the Claimant, and the pNFT must be burned`,
            "pNFT was not acquired in a Bona Fide Transfer": `The ruling in favor of the Original Owner (the Defendant)
If the pNFT Owner has not acquired pNFT in a Bona Fide Transfer, the Claimant's dispute claim will be refused, and the Original will remain with the current owner`
        }
    }
}