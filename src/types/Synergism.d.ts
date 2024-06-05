import type Decimal from 'break_eternity.js'
import type { BlueberryUpgrade } from '../BlueberryUpgrades'
import type { WowCubes, WowHypercubes, WowPlatonicCubes, WowTesseracts } from '../CubeExperimental'
import type { HepteractCraft } from '../Hepteracts'
import type { Category, ResetHistoryEntryUnion } from '../History'
import type { OcteractUpgrade } from '../Octeracts'
import type { IPlatBaseCost } from '../Platonic'
import type { QuarkHandler } from '../Quark'
import type { SingularityUpgrade } from '../singularity'
import type { SingularityChallenge, singularityChallengeData } from '../SingularityChallenges'
import type {
  AmbrosiaGenerationCache,
  AmbrosiaLuckAdditiveMultCache,
  AmbrosiaLuckCache,
  BlueberryInventoryCache
} from '../StatCache'
import type { Tabs } from '../Tabs'

export interface Player {
  firstPlayed: string
  worlds: QuarkHandler
  coins: Decimal
  coinsThisPrestige: Decimal
  coinsThisTranscension: Decimal
  coinsThisReincarnation: Decimal
  coinsTotal: Decimal

  firstOwnedCoin: Decimal
  firstGeneratedCoin: Decimal
  firstCostCoin: Decimal
  firstProduceCoin: number

  secondOwnedCoin: Decimal
  secondGeneratedCoin: Decimal
  secondCostCoin: Decimal
  secondProduceCoin: number

  thirdOwnedCoin: Decimal
  thirdGeneratedCoin: Decimal
  thirdCostCoin: Decimal
  thirdProduceCoin: number

  fourthOwnedCoin: Decimal
  fourthGeneratedCoin: Decimal
  fourthCostCoin: Decimal
  fourthProduceCoin: number

  fifthOwnedCoin: Decimal
  fifthGeneratedCoin: Decimal
  fifthCostCoin: Decimal
  fifthProduceCoin: number

  firstOwnedDiamonds: Decimal
  firstGeneratedDiamonds: Decimal
  firstCostDiamonds: Decimal
  firstProduceDiamonds: number

  secondOwnedDiamonds: Decimal
  secondGeneratedDiamonds: Decimal
  secondCostDiamonds: Decimal
  secondProduceDiamonds: number

  thirdOwnedDiamonds: Decimal
  thirdGeneratedDiamonds: Decimal
  thirdCostDiamonds: Decimal
  thirdProduceDiamonds: number

  fourthOwnedDiamonds: Decimal
  fourthGeneratedDiamonds: Decimal
  fourthCostDiamonds: Decimal
  fourthProduceDiamonds: number

  fifthOwnedDiamonds: Decimal
  fifthGeneratedDiamonds: Decimal
  fifthCostDiamonds: Decimal
  fifthProduceDiamonds: number

  firstOwnedMythos: Decimal
  firstGeneratedMythos: Decimal
  firstCostMythos: Decimal
  firstProduceMythos: number

  secondOwnedMythos: Decimal
  secondGeneratedMythos: Decimal
  secondCostMythos: Decimal
  secondProduceMythos: number

  thirdOwnedMythos: Decimal
  thirdGeneratedMythos: Decimal
  thirdCostMythos: Decimal
  thirdProduceMythos: number

  fourthOwnedMythos: Decimal
  fourthGeneratedMythos: Decimal
  fourthCostMythos: Decimal
  fourthProduceMythos: number

  fifthOwnedMythos: Decimal
  fifthGeneratedMythos: Decimal
  fifthCostMythos: Decimal
  fifthProduceMythos: number

  firstOwnedParticles: Decimal
  firstGeneratedParticles: Decimal
  firstCostParticles: Decimal
  firstProduceParticles: number

  secondOwnedParticles: Decimal
  secondGeneratedParticles: Decimal
  secondCostParticles: Decimal
  secondProduceParticles: number

  thirdOwnedParticles: Decimal
  thirdGeneratedParticles: Decimal
  thirdCostParticles: Decimal
  thirdProduceParticles: number

  fourthOwnedParticles: Decimal
  fourthGeneratedParticles: Decimal
  fourthCostParticles: Decimal
  fourthProduceParticles: number

  fifthOwnedParticles: Decimal
  fifthGeneratedParticles: Decimal
  fifthCostParticles: Decimal
  fifthProduceParticles: number

  firstOwnedAnts: Decimal
  firstGeneratedAnts: Decimal
  firstCostAnts: Decimal
  firstProduceAnts: number

  secondOwnedAnts: Decimal
  secondGeneratedAnts: Decimal
  secondCostAnts: Decimal
  secondProduceAnts: number

  thirdOwnedAnts: Decimal
  thirdGeneratedAnts: Decimal
  thirdCostAnts: Decimal
  thirdProduceAnts: number

  fourthOwnedAnts: Decimal
  fourthGeneratedAnts: Decimal
  fourthCostAnts: Decimal
  fourthProduceAnts: number

  fifthOwnedAnts: Decimal
  fifthGeneratedAnts: Decimal
  fifthCostAnts: Decimal
  fifthProduceAnts: number

  sixthOwnedAnts: Decimal
  sixthGeneratedAnts: Decimal
  sixthCostAnts: Decimal
  sixthProduceAnts: number

  seventhOwnedAnts: Decimal
  seventhGeneratedAnts: Decimal
  seventhCostAnts: Decimal
  seventhProduceAnts: number

  eighthOwnedAnts: Decimal
  eighthGeneratedAnts: Decimal
  eighthCostAnts: Decimal
  eighthProduceAnts: number

  ascendBuilding1: {
    cost: number
    owned: number
    generated: Decimal
    multiplier: number
  }
  ascendBuilding2: {
    cost: number
    owned: number
    generated: Decimal
    multiplier: number
  }
  ascendBuilding3: {
    cost: number
    owned: number
    generated: Decimal
    multiplier: number
  }
  ascendBuilding4: {
    cost: number
    owned: number
    generated: Decimal
    multiplier: number
  }
  ascendBuilding5: {
    cost: number
    owned: number
    generated: Decimal
    multiplier: number
  }

  multiplierCost: Decimal
  multiplierBought: Decimal

  acceleratorCost: Decimal
  acceleratorBought: Decimal

  acceleratorBoostBought: Decimal
  acceleratorBoostCost: Decimal

  upgrades: number[]

  prestigeCount: Decimal
  transcendCount: Decimal
  reincarnationCount: Decimal

  prestigePoints: Decimal
  transcendPoints: Decimal
  reincarnationPoints: Decimal

  prestigeShards: Decimal
  transcendShards: Decimal
  reincarnationShards: Decimal

  toggles: Record<number, boolean>

  challengecompletions: Decimal[]
  highestchallengecompletions: Decimal[]
  challenge15Exponent: Decimal
  highestChallenge15Exponent: Decimal

  retrychallenges: boolean
  currentChallenge: {
    transcension: number
    reincarnation: number
    ascension: number
  }
  researchPoints: Decimal
  obtainiumtimer: Decimal
  obtainiumpersecond: Decimal
  maxobtainiumpersecond: Decimal
  maxobtainium: Decimal
  // Ignore the first index. The other 25 are shaped in a 5x5 grid similar to the production appearance
  researches: number[]

  unlocks: {
    coinone: boolean
    cointwo: boolean
    cointhree: boolean
    coinfour: boolean
    prestige: boolean
    generation: boolean
    transcend: boolean
    reincarnate: boolean
    rrow1: boolean
    rrow2: boolean
    rrow3: boolean
    rrow4: boolean
  }
  achievements: number[]

  achievementPoints: number

  prestigenomultiplier: boolean
  prestigenoaccelerator: boolean
  transcendnomultiplier: boolean
  transcendnoaccelerator: boolean
  reincarnatenomultiplier: boolean
  reincarnatenoaccelerator: boolean
  prestigenocoinupgrades: boolean
  transcendnocoinupgrades: boolean
  transcendnocoinorprestigeupgrades: boolean
  reincarnatenocoinupgrades: boolean
  reincarnatenocoinorprestigeupgrades: boolean
  reincarnatenocoinprestigeortranscendupgrades: boolean
  reincarnatenocoinprestigetranscendorgeneratorupgrades: boolean

  crystalUpgrades: Decimal[]
  crystalUpgradesCost: Decimal[]

  runelevels: Decimal[]
  runeexp: Decimal[]
  runeshards: Decimal
  maxofferings: Decimal
  offeringpersecond: Decimal

  prestigecounter: Decimal
  transcendcounter: Decimal
  reincarnationcounter: Decimal
  offlinetick: number

  prestigeamount: Decimal
  transcendamount: Decimal
  reincarnationamount: Decimal

  fastestprestige: Decimal
  fastesttranscend: Decimal
  fastestreincarnate: Decimal

  resettoggle1: number
  resettoggle2: number
  resettoggle3: number
  resettoggle4: number

  tesseractAutoBuyerToggle: number
  tesseractAutoBuyerAmount: number

  coinbuyamount: number
  crystalbuyamount: number
  mythosbuyamount: number
  particlebuyamount: number
  offeringbuyamount: number
  tesseractbuyamount: number

  shoptoggles: {
    coin: boolean
    prestige: boolean
    transcend: boolean
    generators: boolean
    reincarnate: boolean
  }
  tabnumber: number
  subtabNumber: number

  // create a Map with keys defaulting to boolean
  codes: Map<number, boolean>

  loaded1009: boolean
  loaded1009hotfix1: boolean
  loaded10091: boolean
  loaded1010: boolean
  loaded10101: boolean

  shopUpgrades: {
    offeringPotion: number
    obtainiumPotion: number
    offeringEX: number
    offeringAuto: number
    obtainiumEX: number
    obtainiumAuto: number
    instantChallenge: number
    antSpeed: number
    cashGrab: number
    shopTalisman: number
    seasonPass: number
    challengeExtension: number
    challengeTome: number
    cubeToQuark: number
    tesseractToQuark: number
    hypercubeToQuark: number
    seasonPass2: number
    seasonPass3: number
    chronometer: number
    infiniteAscent: number
    calculator: number
    calculator2: number
    calculator3: number
    calculator4: number
    calculator5: number
    calculator6: number
    calculator7: number
    constantEX: number
    powderEX: number
    chronometer2: number
    chronometer3: number
    seasonPassY: number
    seasonPassZ: number
    challengeTome2: number
    instantChallenge2: number
    cubeToQuarkAll: number
    cashGrab2: number
    seasonPassLost: number
    chronometerZ: number
    powderAuto: number
    offeringEX2: number
    obtainiumEX2: number
    challenge15Auto: number
    extraWarp: number
    autoWarp: number
    improveQuarkHept: number
    improveQuarkHept2: number
    improveQuarkHept3: number
    improveQuarkHept4: number
    shopImprovedDaily: number
    shopImprovedDaily2: number
    shopImprovedDaily3: number
    shopImprovedDaily4: number
    offeringEX3: number
    obtainiumEX3: number
    improveQuarkHept5: number
    seasonPassInfinity: number
    chronometerInfinity: number
    shopSingularityPenaltyDebuff: number
    shopAmbrosiaLuckMultiplier4: number
    shopOcteractAmbrosiaLuck: number
    shopAmbrosiaGeneration1: number
    shopAmbrosiaGeneration2: number
    shopAmbrosiaGeneration3: number
    shopAmbrosiaGeneration4: number
    shopAmbrosiaLuck1: number
    shopAmbrosiaLuck2: number
    shopAmbrosiaLuck3: number
    shopAmbrosiaLuck4: number
    shopCashGrabUltra: number
    shopAmbrosiaAccelerator: number
    shopEXUltra: number
  }
  shopConfirmationToggle: boolean
  shopBuyMaxToggle: boolean | 'TEN' | 'ANY'
  shopHideToggle: boolean
  autoPotionTimer: Decimal
  autoPotionTimerObtainium: Decimal

  autoSacrificeToggle: boolean
  autoBuyFragment: boolean
  autoFortifyToggle: boolean
  autoEnhanceToggle: boolean
  autoResearchToggle: boolean
  researchBuyMaxToggle: boolean
  autoResearchMode: 'cheapest' | 'manual'
  autoResearch: number
  autoSacrifice: number
  sacrificeTimer: Decimal
  quarkstimer: Decimal
  goldenQuarksTimer: Decimal

  antPoints: Decimal
  antUpgrades: (null | number)[]
  antSacrificePoints: Decimal
  antSacrificeTimer: Decimal
  antSacrificeTimerReal: Decimal

  talismanLevels: number[]
  talismanRarity: number[]
  talismanOne: (null | number)[]
  talismanTwo: (null | number)[]
  talismanThree: (null | number)[]
  talismanFour: (null | number)[]
  talismanFive: (null | number)[]
  talismanSix: (null | number)[]
  talismanSeven: (null | number)[]
  talismanShards: Decimal
  commonFragments: Decimal
  uncommonFragments: Decimal
  rareFragments: Decimal
  epicFragments: Decimal
  legendaryFragments: Decimal
  mythicalFragments: Decimal

  buyTalismanShardPercent: number

  autoAntSacrifice: boolean
  autoAntSacTimer: number
  autoAntSacrificeMode: number
  antMax: boolean

  ascensionCount: Decimal
  ascensionCounter: Decimal
  ascensionCounterReal: Decimal
  ascensionCounterRealReal: Decimal
  autoOpenCubes: boolean
  openCubes: number
  autoOpenTesseracts: boolean
  openTesseracts: number
  autoOpenHypercubes: boolean
  openHypercubes: number
  autoOpenPlatonicsCubes: boolean
  openPlatonicsCubes: number
  cubeUpgrades: [null, ...Decimal[]]
  cubeUpgradesBuyMaxToggle: boolean
  autoCubeUpgradesToggle: boolean
  autoPlatonicUpgradesToggle: boolean
  platonicUpgrades: number[]
  saveOfferingToggle: boolean
  wowCubes: WowCubes
  wowTesseracts: WowTesseracts
  wowHypercubes: WowHypercubes
  wowPlatonicCubes: WowPlatonicCubes
  wowAbyssals: Decimal
  wowOcteracts: Decimal
  totalWowOcteracts: Decimal
  cubeBlessings: {
    accelerator: Decimal
    multiplier: Decimal
    offering: Decimal
    runeExp: Decimal
    obtainium: Decimal
    antSpeed: Decimal
    antSacrifice: Decimal
    antELO: Decimal
    talismanBonus: Decimal
    globalSpeed: Decimal
  }
  tesseractBlessings: {
    accelerator: Decimal
    multiplier: Decimal
    offering: Decimal
    runeExp: Decimal
    obtainium: Decimal
    antSpeed: Decimal
    antSacrifice: Decimal
    antELO: Decimal
    talismanBonus: Decimal
    globalSpeed: Decimal
  }
  hypercubeBlessings: {
    accelerator: Decimal
    multiplier: Decimal
    offering: Decimal
    runeExp: Decimal
    obtainium: Decimal
    antSpeed: Decimal
    antSacrifice: Decimal
    antELO: Decimal
    talismanBonus: Decimal
    globalSpeed: Decimal
  }
  platonicBlessings: {
    cubes: Decimal
    tesseracts: Decimal
    hypercubes: Decimal
    platonics: Decimal
    hypercubeBonus: Decimal
    taxes: Decimal
    scoreBonus: Decimal
    globalSpeed: Decimal
  }
  ascendShards: Decimal
  autoAscend: boolean
  autoAscendMode: string
  autoAscendThreshold: number
  roombaResearchIndex: number
  ascStatToggles: Record<number, boolean>

  prototypeCorruptions: number[]
  usedCorruptions: number[]
  corruptionLoadouts: Record<number, number[]>
  corruptionLoadoutNames: string[]
  corruptionShowStats: boolean

  constantUpgrades: [null, ...Decimal[]]
  history: Record<Category, ResetHistoryEntryUnion[]>
  historyShowPerSecond: boolean

  autoChallengeRunning: boolean
  autoChallengeIndex: number
  autoChallengeToggles: boolean[]
  autoChallengeStartExponent: number
  autoChallengeTimer: Record<string, number>

  runeBlessingLevels: Decimal[]
  runeSpiritLevels: Decimal[]
  runeBlessingBuyAmount: number
  runeSpiritBuyAmount: number

  autoTesseracts: boolean[]

  saveString: string
  exporttest: string | boolean

  dayCheck: Date | null
  dayTimer: number
  cubeOpenedDaily: Decimal
  cubeQuarkDaily: Decimal
  tesseractOpenedDaily: Decimal
  tesseractQuarkDaily: Decimal
  hypercubeOpenedDaily: Decimal
  hypercubeQuarkDaily: Decimal
  platonicCubeOpenedDaily: Decimal
  platonicCubeQuarkDaily: Decimal
  loadedOct4Hotfix: boolean
  loadedNov13Vers: boolean
  loadedDec16Vers: boolean
  loadedV253: boolean
  loadedV255: boolean
  loadedV297Hotfix1: boolean
  loadedV2927Hotfix1: boolean
  loadedV2930Hotfix1: boolean
  loadedV2931Hotfix1: boolean
  loadedV21003Hotfix1: boolean
  loadedV21007Hotfix1: boolean
  version: string

  rngCode: number
  skillCode?: number
  promoCodeTiming: {
    time: number
  }

  hepteractCrafts: {
    chronos: HepteractCraft
    hyperrealism: HepteractCraft
    quark: HepteractCraft
    challenge: HepteractCraft
    abyss: HepteractCraft
    accelerator: HepteractCraft
    acceleratorBoost: HepteractCraft
    multiplier: HepteractCraft
  }
  overfluxOrbs: Decimal
  overfluxOrbsAutoBuy: boolean
  overfluxPowder: Decimal
  dailyPowderResetUses: number
  autoWarpCheck: boolean

  singularityCount: number
  highestSingularityCount: number
  singularityCounter: Decimal
  goldenQuarks: Decimal
  quarksThisSingularity: Decimal
  totalQuarksEver: Decimal
  hotkeys: Record<number, string[]>
  theme: string
  iconSet: number
  notation: string

  singularityUpgrades: Record<keyof typeof singularityData, SingularityUpgrade>
  octeractUpgrades: Record<keyof typeof octeractData, OcteractUpgrade>
  dailyCodeUsed: boolean
  hepteractAutoCraftPercentage: number
  octeractTimer: Decimal

  insideSingularityChallenge: boolean
  singularityChallenges: Record<
    keyof typeof singularityChallengeData,
    SingularityChallenge
  >

  ambrosia: number
  lifetimeAmbrosia: number
  blueberryTime: Decimal
  visitedAmbrosiaSubtab: boolean
  spentBlueberries: number
  blueberryUpgrades: Record<
    keyof typeof blueberryUpgradeData,
    BlueberryUpgrade
  >
  blueberryLoadouts: Record<number, BlueberryOpt>
  blueberryLoadoutMode: BlueberryLoadoutMode

  ultimateProgress: Decimal
  ultimatePixels: Decimal

  caches: {
    ambrosiaLuckAdditiveMult: AmbrosiaLuckAdditiveMultCache
    ambrosiaLuck: AmbrosiaLuckCache
    ambrosiaGeneration: AmbrosiaGenerationCache
    blueberryInventory: BlueberryInventoryCache
  }

  /**
   * When the player last exported the save.
   */
  lastExportedSave: number
}

export interface GlobalVariables {
  runediv: number[]
  runeexpbase: number[]
  runeMaxLvl: Decimal
  upgradeCosts: number[]

  // Mega list of Variables to be used elsewhere
  crystalUpgradesCost: number[]
  crystalUpgradeCostIncrement: number[]
  researchBaseCosts: number[]

  researchMaxLevels: number[]

  ticker: number

  costDivisor: Decimal

  freeAccelerator: Decimal
  totalAccelerator: Decimal
  freeAcceleratorBoost: Decimal
  totalAcceleratorBoost: Decimal
  acceleratorPower: Decimal
  acceleratorEffect: Decimal
  acceleratorEffectDisplay: Decimal
  generatorPower: Decimal

  freeMultiplier: Decimal
  totalMultiplier: Decimal
  multiplierPower: Decimal
  multiplierEffect: Decimal
  challengeOneLog: Decimal
  freeMultiplierBoost: Decimal
  totalMultiplierBoost: Decimal

  globalCoinMultiplier: Decimal
  totalCoinOwned: Decimal
  prestigeMultiplier: Decimal
  buildingPower: Decimal
  reincarnationMultiplier: Decimal

  coinOneMulti: Decimal
  coinTwoMulti: Decimal
  coinThreeMulti: Decimal
  coinFourMulti: Decimal
  coinFiveMulti: Decimal

  globalCrystalMultiplier: Decimal
  globalMythosMultiplier: Decimal
  grandmasterMultiplier: Decimal

  atomsMultiplier: Decimal

  mythosBuildingPower: Decimal
  challengeThreeMultiplier: Decimal
  totalMythosOwned: Decimal

  prestigePointGain: Decimal
  challengeFivePower: Decimal

  transcendPointGain: Decimal
  reincarnationPointGain: Decimal

  produceFirst: Decimal
  produceSecond: Decimal
  produceThird: Decimal
  produceFourth: Decimal
  produceFifth: Decimal
  produceTotal: Decimal

  produceFirstDiamonds: Decimal
  produceSecondDiamonds: Decimal
  produceThirdDiamonds: Decimal
  produceFourthDiamonds: Decimal
  produceFifthDiamonds: Decimal
  produceDiamonds: Decimal

  produceFirstMythos: Decimal
  produceSecondMythos: Decimal
  produceThirdMythos: Decimal
  produceFourthMythos: Decimal
  produceFifthMythos: Decimal
  produceMythos: Decimal

  produceFirstParticles: Decimal
  produceSecondParticles: Decimal
  produceThirdParticles: Decimal
  produceFourthParticles: Decimal
  produceFifthParticles: Decimal
  produceParticles: Decimal

  producePerSecond: Decimal
  producePerSecondDiamonds: Decimal
  producePerSecondMythos: Decimal
  producePerSecondParticles: Decimal

  uFourteenMulti: Decimal
  uFifteenMulti: Decimal
  tuSevenMulti: number
  currentTab: Tabs

  researchfiller1: string
  researchfiller2: string

  ordinals: readonly [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    ...string[]
  ]
  cardinals: string[]

  challengeBaseRequirements: number[]

  prestigeamount: number
  taxdivisor: Decimal
  taxdivisorcheck: Decimal
  runemultiplierincrease: {
    one: number
    two: number
    three: number
    four: number
    five: number
  }

  mythosupgrade13: Decimal
  mythosupgrade14: Decimal
  mythosupgrade15: Decimal
  challengefocus: number

  maxexponent: Decimal

  effectiveLevelMult: Decimal
  optimalOfferingTimer: Decimal
  optimalObtainiumTimer: Decimal

  runeSum: Decimal

  globalAntMult: Decimal
  antMultiplier: Decimal

  antOneProduce: Decimal
  antTwoProduce: Decimal
  antThreeProduce: Decimal
  antFourProduce: Decimal
  antFiveProduce: Decimal
  antSixProduce: Decimal
  antSevenProduce: Decimal
  antEightProduce: Decimal

  antCostGrowth: number[]

  antUpgradeBaseCost: number[]
  antUpgradeCostIncreases: number[]

  bonusant1: Decimal
  bonusant2: Decimal
  bonusant3: Decimal
  bonusant4: Decimal
  bonusant5: Decimal
  bonusant6: Decimal
  bonusant7: Decimal
  bonusant8: Decimal
  bonusant9: Decimal
  bonusant10: Decimal
  bonusant11: Decimal
  bonusant12: Decimal

  rune1level: Decimal
  rune2level: Decimal
  rune3level: Decimal
  rune4level: Decimal
  rune5level: Decimal
  rune1Talisman: Decimal
  rune2Talisman: Decimal
  rune3Talisman: Decimal
  rune4Talisman: Decimal
  rune5Talisman: Decimal

  talisman1Effect: [null, ...Decimal[]]
  talisman2Effect: [null, ...Decimal[]]
  talisman3Effect: [null, ...Decimal[]]
  talisman4Effect: [null, ...Decimal[]]
  talisman5Effect: [null, ...Decimal[]]
  talisman6Effect: [null, ...Decimal[]]
  talisman7Effect: [null, ...Decimal[]]

  talisman6Power: number
  talisman7Quarks: number

  runescreen: string
  settingscreen: string

  talismanResourceObtainiumCosts: number[]
  talismanResourceOfferingCosts: number[]

  talismanLevelCostMultiplier: number[]

  talismanPositiveModifier: [null, ...number[]]
  talismanNegativeModifier: [null, ...number[]]

  commonTalismanEnhanceCost: [null, ...number[]]
  uncommonTalismanEnchanceCost: [null, ...number[]]
  rareTalismanEnchanceCost: [null, ...number[]]
  epicTalismanEnhanceCost: [null, ...number[]]
  legendaryTalismanEnchanceCost: [null, ...number[]]
  mythicalTalismanEnchanceCost: [null, ...number[]]

  talismanRespec: number

  obtainiumGain: Decimal

  mirrorTalismanStats: [null, ...number[]]
  antELO: Decimal
  effectiveELO: Decimal

  timeWarp: boolean

  blessingMultiplier: Decimal
  spiritMultiplier: Decimal
  runeBlessings: Decimal[]
  runeSpirits: Decimal[]

  effectiveRuneBlessingPower: Decimal[]
  effectiveRuneSpiritPower: Decimal[]

  blessingBaseCost: number
  spiritBaseCost: number

  triggerChallenge: number

  prevReductionValue: Decimal

  buildingSubTab: BuildingSubtab
  // number000 of each before Diminishing Returns
  blessingbase: [null, ...number[]]
  blessingDRPower: [null, ...number[]]
  giftbase: number[]
  giftDRPower: number[]
  benedictionbase: [null, ...number[]]
  benedictionDRPower: [null, ...number[]]
  // 10 Million of each before Diminishing returns on first number 200k for second, and 10k for the last few
  platonicCubeBase: number[]
  platonicDRPower: number[]

  cubeBonusMultiplier: [null, ...Decimal[]]
  tesseractBonusMultiplier: [null, ...Decimal[]]
  hypercubeBonusMultiplier: [null, ...Decimal[]]
  platonicBonusMultiplier: Decimal[]

  autoOfferingCounter: Decimal

  researchOrderByCost: number[]

  viscosityPower: number[]
  lazinessMultiplier: number[]
  hyperchallengedMultiplier: number[]
  illiteracyPower: number[]
  deflationMultiplier: number[]
  extinctionMultiplier: number[]
  droughtMultiplier: number[]
  financialcollapsePower: number[]

  corruptionPointMultipliers: number[]

  ascendBuildingProduction: {
    first: Decimal
    second: Decimal
    third: Decimal
    fourth: Decimal
    fifth: Decimal
  }
  freeUpgradeAccelerator: Decimal
  freeUpgradeMultiplier: Decimal

  acceleratorMultiplier: Decimal
  multiplierMultiplier: Decimal

  constUpgradeCosts: [null, ...number[]]

  globalConstantMult: Decimal
  autoTalismanTimer: number

  autoChallengeTimerIncrement: Decimal
  corruptionTrigger: number

  challenge15Rewards: {
    cube1: Decimal
    ascensions: Decimal
    coinExponent: Decimal
    taxes: Decimal
    obtainium: Decimal
    offering: Decimal
    accelerator: Decimal
    multiplier: Decimal
    runeExp: Decimal
    runeBonus: Decimal
    cube2: Decimal
    transcendChallengeReduction: Decimal
    reincarnationChallengeReduction: Decimal
    antSpeed: Decimal
    bonusAntLevel: Decimal
    cube3: Decimal
    talismanBonus: Decimal
    globalSpeed: Decimal
    blessingBonus: Decimal
    constantBonus: Decimal
    cube4: Decimal
    spiritBonus: Decimal
    score: Decimal
    quarks: Decimal
    hepteractUnlocked: Decimal
    cube5: Decimal
    powder: Decimal
    exponent: Decimal
    freeOrbs: Decimal
    ascensionSpeed: Decimal
  }

  autoResetTimers: {
    prestige: Decimal
    transcension: Decimal
    reincarnation: Decimal
    ascension: Decimal
  }

  timeMultiplier: Decimal
  upgradeMultiplier: Decimal

  historyCountMax: number

  isEvent: boolean
  shopEnhanceVision: boolean

  eventClicked: boolean

  ambrosiaTimer: Decimal
  TIME_PER_AMBROSIA: Decimal

  currentSingChallenge: keyof Player['singularityChallenges'] | undefined
}

export interface SynergismEvents {
  achievement: [number]
  historyAdd: [Category, ResetHistoryEntryUnion]
  promocode: [string]
  boughtPlatonicUpgrade: [IPlatBaseCost]
  openPlatonic: [number]
}

// If changing these, make reset tiers on top, then challenge types, then specific actions
export type resetNames =
  | 'prestige'
  | 'transcension'
  | 'reincarnation'
  | 'ascension'
  | 'singularity'
  | 'transcensionChallenge'
  | 'reincarnationChallenge'
  | 'ascensionChallenge'
  | 'acceleratorBoost'

// If adding new cube types add them below the last listed type. Thank you
export type cubeNames =
  | 'cubes'
  | 'tesseracts'
  | 'hypercubes'
  | 'platonics'
  | 'hepteracts'

export type BuildingSubtab =
  | 'coin'
  | 'diamond'
  | 'mythos'
  | 'particle'
  | 'tesseract'

export type ZeroToFour = 0 | 1 | 2 | 3 | 4

export type OneToFive = 1 | 2 | 3 | 4 | 5

export type ZeroToSeven = ZeroToFour | 5 | 6 | 7

export type FirstToFifth = GlobalVariables['ordinals'][ZeroToFour]

export type FirstToEighth = GlobalVariables['ordinals'][ZeroToSeven]
