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