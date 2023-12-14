import { BigNumber } from '@ethersproject/bignumber'

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

export const createDisputeLink = (disputeId: BigNumber | string) => {
    return `https://resolve.kleros.io/cases/${disputeId.toString()}`
}