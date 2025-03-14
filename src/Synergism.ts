import '@ungap/custom-elements'
import Decimal from 'break_eternity.js'
import LZString from 'lz-string'

import {
  autoAscensionChallengeSweepUnlock,
  CalcECC,
  challenge15ScoreMultiplier,
  challengeDisplay,
  challengeRequirement,
  getChallengeConditions,
  getMaxChallenges,
  getNextChallenge,
  highestChallengeRewards,
  runChallengeSweep
} from './Challenges'
import { btoa, cleanString, sortWithIndices, sumContentsDecimal, sumContentsNumber } from './Utility'
import { blankGlobals, Globals as G } from './Variables'

import {
  achievementaward,
  ascensionAchievementCheck,
  buildingAchievementCheck,
  challengeachievementcheck,
  resetachievementcheck
} from './Achievements'
import { antSacrificePointsToMultiplier, autoBuyAnts, calculateCrumbToCoinExp } from './Ants'
import { autoUpgrades } from './Automation'
import type { TesseractBuildings } from './Buy'
import {
  buyCrystalUpgrades,
  buyGoldenQuarkBuilding,
  buyMax,
  buyMaxAccels,
  buyMaxBoostAccel,
  buyMaxMuls,
  buyParticleBuilding,
  buyRuneBonusLevels,
  buyTesseractBuilding,
  calculateTessBuildingsInBudget,
  getCost,
  getParticleCostq,
  getReductionValue
} from './Buy'
import {
  calculateAcceleratorMultiplier,
  calculateAnts,
  calculateCorruptionPoints,
  calculateCubeBlessings,
  calculateGoldenQuarkGain,
  calculateObtainium,
  calculateOfferings,
  calculateOffline,
  calculateRuneLevels,
  calculateSigmoidExponential,
  calculateTimeAcceleration,
  calculateTotalAcceleratorBoost,
  calculateTotalCoinOwned,
  constantEffects,
  dailyResetCheck,
  exitOffline
} from './Calculate'
import {
  corrChallengeMinimum,
  corruptionButtonsAdd,
  corruptionLoadoutSaveLoad,
  corruptionLoadoutTableCreate,
  corruptionLoadoutTableUpdate,
  corruptionStatsUpdate,
  maxCorruptionLevel,
  updateCorruptionLoadoutNames
} from './Corruptions'
import { updateCubeUpgradeBG } from './Cubes'
import { generateEventHandlers } from './EventListeners'
import { addTimers, automaticTools } from './Helper'
import { resetHistoryRenderAllTables } from './History'
import { calculateHypercubeBlessings } from './Hypercubes'
import { calculatePlatonicBlessings } from './PlatonicCubes'
import { buyResearch, maxRoombaResearchIndex, updateResearchBG } from './Research'
import { autoResearchEnabled } from './Research'
import {
  reset,
  resetrepeat,
  singularity,
  updateAutoCubesOpens,
  updateAutoReset,
  updateSingularityAchievements,
  updateSingularityGlobalPerks,
  updateTesseractAutoBuyAmount
} from './Reset'
import { getRuneEffective, redeemShards } from './Runes'
import { c15RewardUpdate } from './Statistics'
import {
  buyTalismanEnhance,
  buyTalismanLevels,
  calculateMaxTalismanLevel,
  toggleTalismanBuy,
  updateTalismanAppearance,
  updateTalismanInventory
} from './Talismans'
import { calculatetax } from './Tax'
import { calculateTesseractBlessings } from './Tesseracts'
import {
  autoCubeUpgradesToggle,
  autoPlatonicUpgradesToggle,
  toggleAntAutoSacrifice,
  toggleAntMaxBuy,
  toggleAscStatPerSecond,
  toggleauto,
  toggleAutoAscend,
  toggleAutoChallengeModeText,
  toggleChallenges,
  toggleShops,
  updateAutoChallenge,
  updateRuneBlessingBuyAmount
} from './Toggles'
import type { OneToFive, Player, resetNames, ZeroToFour } from './types/Synergism'
import {
  Alert,
  buttoncolorchange,
  changeTabColor,
  Confirm,
  htmlInserts,
  Notification,
  revealStuff,
  showCorruptionStatsLoadouts,
  updateAchievementBG,
  updateChallengeDisplay,
  updateChallengeLevel
} from './UpdateHTML'
import {
  ascendBuildingDR,
  buyConstantUpgrades,
  categoryUpgrades,
  getConstUpgradeMetadata,
  upgradeupdate
} from './Upgrades'
// import { LegacyShopUpgrades } from './types/LegacySynergism';
import i18next from 'i18next'
import localforage from 'localforage'
import { BlueberryUpgrade, blueberryUpgradeData, updateLoadoutHoverClasses } from './BlueberryUpgrades'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { lastUpdated, prod, testing, version } from './Config'
import { WowCubes, WowHypercubes, WowPlatonicCubes, WowTesseracts } from './CubeExperimental'
import { eventCheck } from './Event'
import {
  AbyssHepteract,
  AcceleratorBoostHepteract,
  AcceleratorHepteract,
  ChallengeHepteract,
  ChronosHepteract,
  hepteractEffective,
  HyperrealismHepteract,
  MultiplierHepteract,
  QuarkHepteract,
  toggleAutoBuyOrbs
} from './Hepteracts'
import { disableHotkeys } from './Hotkeys'
import { init as i18nInit } from './i18n'
import { handleLogin } from './Login'
import { octeractData, OcteractUpgrade } from './Octeracts'
import { updatePlatonicUpgradeBG } from './Platonic'
import { getQuarkBonus, QuarkHandler } from './Quark'
import { playerJsonSchema } from './saves/PlayerJsonSchema'
import { playerSchema } from './saves/PlayerSchema'
import { getFastForwardTotalMultiplier, singularityData, SingularityUpgrade } from './singularity'
import { SingularityChallenge, singularityChallengeData } from './SingularityChallenges'
import {
  AmbrosiaGenerationCache,
  AmbrosiaLuckAdditiveMultCache,
  AmbrosiaLuckCache,
  BlueberryInventoryCache,
  cacheReinitialize
} from './StatCache'
import { changeSubTab, changeTab, Tabs } from './Tabs'
import { settingAnnotation, toggleIconSet, toggleTheme } from './Themes'
import { clearTimeout, clearTimers, setInterval, setTimeout } from './Timers'
import type { PlayerSave } from './types/LegacySynergism'

export const player: Player = {
  firstPlayed: new Date().toISOString(),
  worlds: new QuarkHandler(new Decimal(0)),
  coins: new Decimal(100),
  coinsThisPrestige: new Decimal(100),
  coinsThisTranscension: new Decimal(100),
  coinsThisReincarnation: new Decimal(100),
  coinsTotal: new Decimal(100),

  firstOwnedCoin: new Decimal(0),
  firstGeneratedCoin: new Decimal(0),
  firstCostCoin: new Decimal(100),
  firstProduceCoin: new Decimal(0.25),

  secondOwnedCoin: new Decimal(0),
  secondGeneratedCoin: new Decimal(0),
  secondCostCoin: new Decimal(1000),
  secondProduceCoin: new Decimal(2.5),

  thirdOwnedCoin: new Decimal(0),
  thirdGeneratedCoin: new Decimal(0),
  thirdCostCoin: new Decimal(2e4),
  thirdProduceCoin: new Decimal(25),

  fourthOwnedCoin: new Decimal(0),
  fourthGeneratedCoin: new Decimal(0),
  fourthCostCoin: new Decimal(4e5),
  fourthProduceCoin: new Decimal(250),

  fifthOwnedCoin: new Decimal(0),
  fifthGeneratedCoin: new Decimal(0),
  fifthCostCoin: new Decimal(8e6),
  fifthProduceCoin: new Decimal(2500),

  firstOwnedDiamonds: new Decimal(0),
  firstGeneratedDiamonds: new Decimal(0),
  firstCostDiamonds: new Decimal(100),
  firstProduceDiamonds: new Decimal(0.05),

  secondOwnedDiamonds: new Decimal(0),
  secondGeneratedDiamonds: new Decimal(0),
  secondCostDiamonds: new Decimal(1e5),
  secondProduceDiamonds: new Decimal(0.0005),

  thirdOwnedDiamonds: new Decimal(0),
  thirdGeneratedDiamonds: new Decimal(0),
  thirdCostDiamonds: new Decimal(1e15),
  thirdProduceDiamonds: new Decimal(0.00005),

  fourthOwnedDiamonds: new Decimal(0),
  fourthGeneratedDiamonds: new Decimal(0),
  fourthCostDiamonds: new Decimal(1e40),
  fourthProduceDiamonds: new Decimal(0.000005),

  fifthOwnedDiamonds: new Decimal(0),
  fifthGeneratedDiamonds: new Decimal(0),
  fifthCostDiamonds: new Decimal(1e100),
  fifthProduceDiamonds: new Decimal(0.000005),

  firstOwnedMythos: new Decimal(0),
  firstGeneratedMythos: new Decimal(0),
  firstCostMythos: new Decimal(1),
  firstProduceMythos: new Decimal(1),

  secondOwnedMythos: new Decimal(0),
  secondGeneratedMythos: new Decimal(0),
  secondCostMythos: new Decimal(100),
  secondProduceMythos: new Decimal(0.01),

  thirdOwnedMythos: new Decimal(0),
  thirdGeneratedMythos: new Decimal(0),
  thirdCostMythos: new Decimal(1e4),
  thirdProduceMythos: new Decimal(0.001),

  fourthOwnedMythos: new Decimal(0),
  fourthGeneratedMythos: new Decimal(0),
  fourthCostMythos: new Decimal(1e8),
  fourthProduceMythos: new Decimal(0.0002),

  fifthOwnedMythos: new Decimal(0),
  fifthGeneratedMythos: new Decimal(0),
  fifthCostMythos: new Decimal(1e16),
  fifthProduceMythos: new Decimal(0.00004),

  firstOwnedParticles: new Decimal(0),
  firstGeneratedParticles: new Decimal(0),
  firstCostParticles: new Decimal(1),
  firstProduceParticles: new Decimal(0.25),

  secondOwnedParticles: new Decimal(0),
  secondGeneratedParticles: new Decimal(0),
  secondCostParticles: new Decimal(100),
  secondProduceParticles: new Decimal(0.2),

  thirdOwnedParticles: new Decimal(0),
  thirdGeneratedParticles: new Decimal(0),
  thirdCostParticles: new Decimal(1e4),
  thirdProduceParticles: new Decimal(0.15),

  fourthOwnedParticles: new Decimal(0),
  fourthGeneratedParticles: new Decimal(0),
  fourthCostParticles: new Decimal(1e8),
  fourthProduceParticles: new Decimal(0.1),

  fifthOwnedParticles: new Decimal(0),
  fifthGeneratedParticles: new Decimal(0),
  fifthCostParticles: new Decimal(1e16),
  fifthProduceParticles: new Decimal(0.5),

  firstOwnedAnts: new Decimal(0),
  firstGeneratedAnts: new Decimal(0),
  firstCostAnts: new Decimal('1e700'),
  firstProduceAnts: new Decimal(0.0001),

  secondOwnedAnts: new Decimal(0),
  secondGeneratedAnts: new Decimal(0),
  secondCostAnts: new Decimal(3),
  secondProduceAnts: new Decimal(0.00005),

  thirdOwnedAnts: new Decimal(0),
  thirdGeneratedAnts: new Decimal(0),
  thirdCostAnts: new Decimal(100),
  thirdProduceAnts: new Decimal(0.00002),

  fourthOwnedAnts: new Decimal(0),
  fourthGeneratedAnts: new Decimal(0),
  fourthCostAnts: new Decimal(1e4),
  fourthProduceAnts: new Decimal(0.00001),

  fifthOwnedAnts: new Decimal(0),
  fifthGeneratedAnts: new Decimal(0),
  fifthCostAnts: new Decimal(1e12),
  fifthProduceAnts: new Decimal(0.000005),

  sixthOwnedAnts: new Decimal(0),
  sixthGeneratedAnts: new Decimal(0),
  sixthCostAnts: new Decimal(1e36),
  sixthProduceAnts: new Decimal(0.000002),

  seventhOwnedAnts: new Decimal(0),
  seventhGeneratedAnts: new Decimal(0),
  seventhCostAnts: new Decimal(1e100),
  seventhProduceAnts: new Decimal(0.000001),

  eighthOwnedAnts: new Decimal(0),
  eighthGeneratedAnts: new Decimal(0),
  eighthCostAnts: new Decimal(1e300),
  eighthProduceAnts: new Decimal(0.00000001),

  ascendBuilding1: {
    cost: new Decimal(1),
    owned: new Decimal(0),
    multiplier: new Decimal(0.01),
    generated: new Decimal(0)
  },
  ascendBuilding2: {
    cost: new Decimal(10),
    owned: new Decimal(0),
    multiplier: new Decimal(0.01),
    generated: new Decimal(0)
  },
  ascendBuilding3: {
    cost: new Decimal(100),
    owned: new Decimal(0),
    multiplier: new Decimal(0.01),
    generated: new Decimal(0)
  },
  ascendBuilding4: {
    cost: new Decimal(1000),
    owned: new Decimal(0),
    multiplier: new Decimal(0.01),
    generated: new Decimal(0)
  },
  ascendBuilding5: {
    cost: new Decimal(10000),
    owned: new Decimal(0),
    multiplier: new Decimal(0.01),
    generated: new Decimal(0)
  },

  goldenFragments: new Decimal(0),

  gcBuilding1: {
    cost: new Decimal(100),
    owned: new Decimal(0),
    multiplier: new Decimal(1),
    generated: new Decimal(0)
  },
  gcBuilding2: {
    cost: new Decimal(1000),
    owned: new Decimal(0),
    multiplier: new Decimal(1),
    generated: new Decimal(0)
  },
  gcBuilding3: {
    cost: new Decimal(1e6),
    owned: new Decimal(0),
    multiplier: new Decimal(1),
    generated: new Decimal(0)
  },
  gcBuilding4: {
    cost: new Decimal(1e9),
    owned: new Decimal(0),
    multiplier: new Decimal(1),
    generated: new Decimal(0)
  },
  gcBuilding5: {
    cost: new Decimal(1e12),
    owned: new Decimal(0),
    multiplier: new Decimal(1),
    generated: new Decimal(0)
  },

  multiplierCost: new Decimal(1e4),
  multiplierBought: new Decimal(0),

  acceleratorCost: new Decimal(500),
  acceleratorBought: new Decimal(0),

  acceleratorBoostBought: new Decimal(0),
  acceleratorBoostCost: new Decimal(1000),

  upgrades: Array(141).fill(0) as number[],

  prestigeCount: new Decimal(0),
  transcendCount: new Decimal(0),
  reincarnationCount: new Decimal(0),

  prestigePoints: new Decimal(0),
  transcendPoints: new Decimal(0),
  reincarnationPoints: new Decimal(0),

  prestigeShards: new Decimal(0),
  transcendShards: new Decimal(0),
  reincarnationShards: new Decimal(0),

  toggles: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
    13: false,
    14: false,
    15: false,
    16: false,
    17: false,
    18: false,
    19: false,
    20: false,
    21: false,
    22: false,
    23: false,
    24: false,
    25: false,
    26: false,
    27: false,
    28: true,
    29: true,
    30: true,
    31: true,
    32: true,
    33: true,
    34: true,
    35: true,
    36: false,
    37: false,
    38: false,
    39: true,
    40: true,
    41: true,
    42: false,
    43: false
  },

  challengecompletions: [
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  highestchallengecompletions: [
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  challenge15Exponent: new Decimal(0),
  highestChallenge15Exponent: new Decimal(0),

  retrychallenges: false,
  currentChallenge: {
    transcension: 0,
    reincarnation: 0,
    ascension: 0
  },
  researchPoints: new Decimal(0),
  obtainiumtimer: new Decimal(0),
  obtainiumpersecond: new Decimal(0),
  maxobtainiumpersecond: new Decimal(0),
  maxobtainium: new Decimal(0),
  // Ignore the first index. The other 25 are shaped in a 5x5 grid similar to the production appearance
  // dprint-ignore
  researches: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],

  unlocks: {
    coinone: false,
    cointwo: false,
    cointhree: false,
    coinfour: false,
    prestige: false,
    generation: false,
    transcend: false,
    reincarnate: false,
    rrow1: false,
    rrow2: false,
    rrow3: false,
    rrow4: false
  },
  achievements: Array(281).fill(0) as number[],

  achievementPoints: 0,

  prestigenomultiplier: true,
  prestigenoaccelerator: true,
  transcendnomultiplier: true,
  transcendnoaccelerator: true,
  reincarnatenomultiplier: true,
  reincarnatenoaccelerator: true,
  prestigenocoinupgrades: true,
  transcendnocoinupgrades: true,
  transcendnocoinorprestigeupgrades: true,
  reincarnatenocoinupgrades: true,
  reincarnatenocoinorprestigeupgrades: true,
  reincarnatenocoinprestigeortranscendupgrades: true,
  reincarnatenocoinprestigetranscendorgeneratorupgrades: true,

  crystalUpgrades: [
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  crystalUpgradesCost: [
    new Decimal(7),
    new Decimal(15),
    new Decimal(20),
    new Decimal(40),
    new Decimal(100),
    new Decimal(200),
    new Decimal(500),
    new Decimal(1000)
  ],

  runelevels: [
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
    new Decimal(0),
    new Decimal(0)
  ],
  runeexp: [
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  runeshards: new Decimal(0),
  maxofferings: new Decimal(0),
  offeringpersecond: new Decimal(0),

  prestigecounter: new Decimal(0),
  transcendcounter: new Decimal(0),
  reincarnationcounter: new Decimal(0),
  offlinetick: 0,

  prestigeamount: new Decimal(0),
  transcendamount: new Decimal(0),
  reincarnationamount: new Decimal(0),

  fastestprestige: new Decimal(9999999999),
  fastesttranscend: new Decimal(99999999999),
  fastestreincarnate: new Decimal(999999999999),

  resettoggle1: 1,
  resettoggle2: 1,
  resettoggle3: 1,
  resettoggle4: 1,

  tesseractAutoBuyerToggle: 0,
  tesseractAutoBuyerAmount: 0,

  coinbuyamount: 1,
  crystalbuyamount: 1,
  mythosbuyamount: 1,
  particlebuyamount: 1,
  offeringbuyamount: 1,
  tesseractbuyamount: 1,

  shoptoggles: {
    coin: true,
    prestige: true,
    transcend: true,
    generators: true,
    reincarnate: true
  },
  tabnumber: 1,
  subtabNumber: 0,

  // create a Map with keys defaulting to false
  codes: new Map(Array.from({ length: 48 }, (_, i) => [i + 1, false])),

  loaded1009: true,
  loaded1009hotfix1: true,
  loaded10091: true,
  loaded1010: true,
  loaded10101: true,

  shopUpgrades: {
    offeringPotion: 1,
    obtainiumPotion: 1,
    offeringEX: 0,
    offeringAuto: 0,
    obtainiumEX: 0,
    obtainiumAuto: 0,
    instantChallenge: 0,
    antSpeed: 0,
    cashGrab: 0,
    shopTalisman: 0,
    seasonPass: 0,
    challengeExtension: 0,
    challengeTome: 0,
    cubeToQuark: 0,
    tesseractToQuark: 0,
    hypercubeToQuark: 0,
    seasonPass2: 0,
    seasonPass3: 0,
    chronometer: 0,
    infiniteAscent: 0,
    calculator: 0,
    calculator2: 0,
    calculator3: 0,
    calculator4: 0,
    calculator5: 0,
    calculator6: 0,
    calculator7: 0,
    constantEX: 0,
    powderEX: 0,
    chronometer2: 0,
    chronometer3: 0,
    seasonPassY: 0,
    seasonPassZ: 0,
    challengeTome2: 0,
    instantChallenge2: 0,
    cashGrab2: 0,
    chronometerZ: 0,
    cubeToQuarkAll: 0,
    offeringEX2: 0,
    obtainiumEX2: 0,
    seasonPassLost: 0,
    powderAuto: 0,
    challenge15Auto: 0,
    extraWarp: 0,
    autoWarp: 0,
    improveQuarkHept: 0,
    improveQuarkHept2: 0,
    improveQuarkHept3: 0,
    improveQuarkHept4: 0,
    shopImprovedDaily: 0,
    shopImprovedDaily2: 0,
    shopImprovedDaily3: 0,
    shopImprovedDaily4: 0,
    offeringEX3: 0,
    obtainiumEX3: 0,
    improveQuarkHept5: 0,
    seasonPassInfinity: 0,
    chronometerInfinity: 0,
    shopSingularityPenaltyDebuff: 0,
    shopAmbrosiaLuckMultiplier4: 0,
    shopOcteractAmbrosiaLuck: 0,
    shopAmbrosiaGeneration1: 0,
    shopAmbrosiaGeneration2: 0,
    shopAmbrosiaGeneration3: 0,
    shopAmbrosiaGeneration4: 0,
    shopAmbrosiaLuck1: 0,
    shopAmbrosiaLuck2: 0,
    shopAmbrosiaLuck3: 0,
    shopAmbrosiaLuck4: 0,
    shopCashGrabUltra: 0,
    shopAmbrosiaAccelerator: 0,
    shopEXUltra: 0
  },
  shopBuyMaxToggle: false,
  shopHideToggle: false,
  shopConfirmationToggle: true,
  autoPotionTimer: new Decimal(0),
  autoPotionTimerObtainium: new Decimal(0),

  autoSacrificeToggle: false,
  autoBuyFragment: false,
  autoFortifyToggle: false,
  autoEnhanceToggle: false,
  autoResearchToggle: false,
  researchBuyMaxToggle: false,
  autoResearchMode: 'manual',
  autoResearch: 0,
  autoSacrifice: 0,
  sacrificeTimer: new Decimal(0),
  quarkstimer: new Decimal(90000),
  goldenQuarksTimer: new Decimal(90000),

  antPoints: new Decimal(1),
  antUpgrades: [
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  antSacrificePoints: new Decimal(0),
  antSacrificeTimer: new Decimal(900),
  antSacrificeTimerReal: new Decimal(900),

  talismanLevels: [0, 0, 0, 0, 0, 0, 0],
  talismanRarity: [1, 1, 1, 1, 1, 1, 1],
  talismanOne: [null, -1, 1, 1, 1, -1],
  talismanTwo: [null, 1, 1, -1, -1, 1],
  talismanThree: [null, 1, -1, 1, 1, -1],
  talismanFour: [null, -1, -1, 1, 1, 1],
  talismanFive: [null, 1, 1, -1, -1, 1],
  talismanSix: [null, 1, 1, 1, -1, -1],
  talismanSeven: [null, -1, 1, -1, 1, 1],
  talismanShards: new Decimal(0),
  commonFragments: new Decimal(0),
  uncommonFragments: new Decimal(0),
  rareFragments: new Decimal(0),
  epicFragments: new Decimal(0),
  legendaryFragments: new Decimal(0),
  mythicalFragments: new Decimal(0),

  buyTalismanShardPercent: 10,

  autoAntSacrifice: false,
  autoAntSacTimer: 900,
  autoAntSacrificeMode: 0,
  antMax: false,

  ascensionCount: new Decimal(0),
  ascensionCounter: new Decimal(0),
  ascensionCounterReal: new Decimal(0),
  ascensionCounterRealReal: new Decimal(0),
  // dprint-ignore
  cubeUpgrades: [
    null,
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
  ],
  cubeUpgradesBuyMaxToggle: false,
  autoCubeUpgradesToggle: false,
  autoPlatonicUpgradesToggle: false,
  platonicUpgrades: [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ],
  wowCubes: new WowCubes(new Decimal(0)),
  wowTesseracts: new WowTesseracts(new Decimal(0)),
  wowHypercubes: new WowHypercubes(new Decimal(0)),
  wowPlatonicCubes: new WowPlatonicCubes(new Decimal(0)),
  saveOfferingToggle: false,
  wowAbyssals: new Decimal(0),
  wowOcteracts: new Decimal(0),
  totalWowOcteracts: new Decimal(0),
  cubeBlessings: {
    accelerator: new Decimal(0),
    multiplier: new Decimal(0),
    offering: new Decimal(0),
    runeExp: new Decimal(0),
    obtainium: new Decimal(0),
    antSpeed: new Decimal(0),
    antSacrifice: new Decimal(0),
    antELO: new Decimal(0),
    talismanBonus: new Decimal(0),
    globalSpeed: new Decimal(0)
  },
  tesseractBlessings: {
    accelerator: new Decimal(0),
    multiplier: new Decimal(0),
    offering: new Decimal(0),
    runeExp: new Decimal(0),
    obtainium: new Decimal(0),
    antSpeed: new Decimal(0),
    antSacrifice: new Decimal(0),
    antELO: new Decimal(0),
    talismanBonus: new Decimal(0),
    globalSpeed: new Decimal(0)
  },
  hypercubeBlessings: {
    accelerator: new Decimal(0),
    multiplier: new Decimal(0),
    offering: new Decimal(0),
    runeExp: new Decimal(0),
    obtainium: new Decimal(0),
    antSpeed: new Decimal(0),
    antSacrifice: new Decimal(0),
    antELO: new Decimal(0),
    talismanBonus: new Decimal(0),
    globalSpeed: new Decimal(0)
  },
  platonicBlessings: {
    cubes: new Decimal(0),
    tesseracts: new Decimal(0),
    hypercubes: new Decimal(0),
    platonics: new Decimal(0),
    hypercubeBonus: new Decimal(0),
    taxes: new Decimal(0),
    scoreBonus: new Decimal(0),
    globalSpeed: new Decimal(0)
  },

  hepteractCrafts: {
    chronos: ChronosHepteract,
    hyperrealism: HyperrealismHepteract,
    quark: QuarkHepteract,
    challenge: ChallengeHepteract,
    abyss: AbyssHepteract,
    accelerator: AcceleratorHepteract,
    acceleratorBoost: AcceleratorBoostHepteract,
    multiplier: MultiplierHepteract
  },

  ascendShards: new Decimal(0),
  autoAscend: false,
  autoAscendMode: 'c10Completions',
  autoAscendThreshold: 1,
  autoOpenCubes: false,
  openCubes: 0,
  autoOpenTesseracts: false,
  openTesseracts: 0,
  autoOpenHypercubes: false,
  openHypercubes: 0,
  autoOpenPlatonicsCubes: false,
  openPlatonicsCubes: 0,
  roombaResearchIndex: 0,
  ascStatToggles: {
    // false here means show per second
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  },

  prototypeCorruptions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  usedCorruptions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  corruptionLoadouts: {
    // If you add loadouts don't forget to add loadout names!
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  corruptionLoadoutNames: [
    'Loadout 1',
    'Loadout 2',
    'Loadout 3',
    'Loadout 4',
    'Loadout 5',
    'Loadout 6',
    'Loadout 7',
    'Loadout 8'
  ],
  corruptionShowStats: true,

  constantUpgrades: [
    null,
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0),
    new Decimal(0)
  ],
  history: { ants: [], ascend: [], reset: [], singularity: [] },
  historyShowPerSecond: false,

  autoChallengeRunning: false,
  autoChallengeIndex: 1,
  autoChallengeToggles: [
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false
  ],
  autoChallengeStartExponent: 10,
  autoChallengeTimer: {
    start: 10,
    exit: 2,
    enter: 2
  },

  runeBlessingLevels: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  runeSpiritLevels: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  runeBlessingBuyAmount: 0,
  runeSpiritBuyAmount: 0,

  autoTesseracts: [false, false, false, false, false, false],
  autoGoldenQuarks: [false, false, false, false, false, false],

  saveString: 'Synergism-$VERSION$-$TIME$.txt',
  exporttest: !testing,

  dayCheck: null,
  dayTimer: 0,
  cubeOpenedDaily: new Decimal(0),
  cubeQuarkDaily: new Decimal(0),
  tesseractOpenedDaily: new Decimal(0),
  tesseractQuarkDaily: new Decimal(0),
  hypercubeOpenedDaily: new Decimal(0),
  hypercubeQuarkDaily: new Decimal(0),
  platonicCubeOpenedDaily: new Decimal(0),
  platonicCubeQuarkDaily: new Decimal(0),
  overfluxOrbs: new Decimal(0),
  overfluxOrbsAutoBuy: false,
  overfluxPowder: new Decimal(0),
  dailyPowderResetUses: 1,
  autoWarpCheck: false,
  loadedOct4Hotfix: false,
  loadedNov13Vers: true,
  loadedDec16Vers: true,
  loadedV253: true,
  loadedV255: true,
  loadedV297Hotfix1: true,
  loadedV2927Hotfix1: true,
  loadedV2930Hotfix1: true,
  loadedV2931Hotfix1: true,
  loadedV21003Hotfix1: true,
  loadedV21007Hotfix1: true,
  version,
  rngCode: 0,
  promoCodeTiming: {
    time: 0
  },
  singularityCount: 0,
  highestSingularityCount: 0,
  singularityCounter: new Decimal(0),
  goldenQuarks: new Decimal(0),
  quarksThisSingularity: new Decimal(0),
  totalQuarksEver: new Decimal(0),
  hotkeys: {},
  theme: 'Dark Mode',
  iconSet: 0,
  notation: 'Default',

  singularityUpgrades: {
    goldenQuarks1: new SingularityUpgrade(
      singularityData.goldenQuarks1,
      'goldenQuarks1'
    ),
    goldenQuarks2: new SingularityUpgrade(
      singularityData.goldenQuarks2,
      'goldenQuarks2'
    ),
    goldenQuarks3: new SingularityUpgrade(
      singularityData.goldenQuarks3,
      'goldenQuarks3'
    ),
    starterPack: new SingularityUpgrade(
      singularityData.starterPack,
      'starterPack'
    ),
    wowPass: new SingularityUpgrade(singularityData.wowPass, 'wowPass'),
    cookies: new SingularityUpgrade(singularityData.cookies, 'cookies'),
    cookies2: new SingularityUpgrade(singularityData.cookies2, 'cookies2'),
    cookies3: new SingularityUpgrade(singularityData.cookies3, 'cookies3'),
    cookies4: new SingularityUpgrade(singularityData.cookies4, 'cookies4'),
    cookies5: new SingularityUpgrade(singularityData.cookies5, 'cookies5'),
    ascensions: new SingularityUpgrade(
      singularityData.ascensions,
      'ascensions'
    ),
    corruptionFourteen: new SingularityUpgrade(
      singularityData.corruptionFourteen,
      'corruptionFourteen'
    ),
    corruptionFifteen: new SingularityUpgrade(
      singularityData.corruptionFifteen,
      'corruptionFifteen'
    ),
    singOfferings1: new SingularityUpgrade(
      singularityData.singOfferings1,
      'singOfferings1'
    ),
    singOfferings2: new SingularityUpgrade(
      singularityData.singOfferings2,
      'singOfferings2'
    ),
    singOfferings3: new SingularityUpgrade(
      singularityData.singOfferings3,
      'singOfferings3'
    ),
    singObtainium1: new SingularityUpgrade(
      singularityData.singObtainium1,
      'singObtainium1'
    ),
    singObtainium2: new SingularityUpgrade(
      singularityData.singObtainium2,
      'singObtainium2'
    ),
    singObtainium3: new SingularityUpgrade(
      singularityData.singObtainium3,
      'singObtainium3'
    ),
    singCubes1: new SingularityUpgrade(
      singularityData.singCubes1,
      'singCubes1'
    ),
    singCubes2: new SingularityUpgrade(
      singularityData.singCubes2,
      'singCubes2'
    ),
    singCubes3: new SingularityUpgrade(
      singularityData.singCubes3,
      'singCubes3'
    ),
    singCitadel: new SingularityUpgrade(
      singularityData.singCitadel,
      'singCitadel'
    ),
    singCitadel2: new SingularityUpgrade(
      singularityData.singCitadel2,
      'singCitadel2'
    ),
    octeractUnlock: new SingularityUpgrade(
      singularityData.octeractUnlock,
      'octeractUnlock'
    ),
    singOcteractPatreonBonus: new SingularityUpgrade(
      singularityData.singOcteractPatreonBonus,
      'singOcteractPatreonBonus'
    ),
    intermediatePack: new SingularityUpgrade(
      singularityData.intermediatePack,
      'intermediatePack'
    ),
    advancedPack: new SingularityUpgrade(
      singularityData.advancedPack,
      'advancedPack'
    ),
    expertPack: new SingularityUpgrade(
      singularityData.expertPack,
      'expertPack'
    ),
    masterPack: new SingularityUpgrade(
      singularityData.masterPack,
      'masterPack'
    ),
    divinePack: new SingularityUpgrade(
      singularityData.divinePack,
      'divinePack'
    ),
    wowPass2: new SingularityUpgrade(singularityData.wowPass2, 'wowPass2'),
    potionBuff: new SingularityUpgrade(
      singularityData.potionBuff,
      'potionBuff'
    ),
    potionBuff2: new SingularityUpgrade(
      singularityData.potionBuff2,
      'potionBuff2'
    ),
    potionBuff3: new SingularityUpgrade(
      singularityData.potionBuff3,
      'potionBuff3'
    ),
    singChallengeExtension: new SingularityUpgrade(
      singularityData.singChallengeExtension,
      'singChallengeExtension'
    ),
    singChallengeExtension2: new SingularityUpgrade(
      singularityData.singChallengeExtension2,
      'singChallengeExtension2'
    ),
    singChallengeExtension3: new SingularityUpgrade(
      singularityData.singChallengeExtension3,
      'singChallengeExtension3'
    ),
    singQuarkImprover1: new SingularityUpgrade(
      singularityData.singQuarkImprover1,
      'singQuarkImprover1'
    ),
    singQuarkHepteract: new SingularityUpgrade(
      singularityData.singQuarkHepteract,
      'singQuarkHepteract'
    ),
    singQuarkHepteract2: new SingularityUpgrade(
      singularityData.singQuarkHepteract2,
      'singQuarkHepteract2'
    ),
    singQuarkHepteract3: new SingularityUpgrade(
      singularityData.singQuarkHepteract3,
      'singQuarkHepteract3'
    ),
    singOcteractGain: new SingularityUpgrade(
      singularityData.singOcteractGain,
      'singOcteractGain'
    ),
    singOcteractGain2: new SingularityUpgrade(
      singularityData.singOcteractGain2,
      'singOcteractGain2'
    ),
    singOcteractGain3: new SingularityUpgrade(
      singularityData.singOcteractGain3,
      'singOcteractGain3'
    ),
    singOcteractGain4: new SingularityUpgrade(
      singularityData.singOcteractGain4,
      'singOcteractGain4'
    ),
    singOcteractGain5: new SingularityUpgrade(
      singularityData.singOcteractGain5,
      'singOcteractGain5'
    ),
    wowPass3: new SingularityUpgrade(singularityData.wowPass3, 'wowPass3'),
    ultimatePen: new SingularityUpgrade(
      singularityData.ultimatePen,
      'ultimatePen'
    ),
    platonicTau: new SingularityUpgrade(
      singularityData.platonicTau,
      'platonicTau'
    ),
    platonicAlpha: new SingularityUpgrade(
      singularityData.platonicAlpha,
      'platonicAlpha'
    ),
    platonicDelta: new SingularityUpgrade(
      singularityData.platonicDelta,
      'platonicDelta'
    ),
    platonicPhi: new SingularityUpgrade(
      singularityData.platonicPhi,
      'platonicPhi'
    ),
    singFastForward: new SingularityUpgrade(
      singularityData.singFastForward,
      'singFastForward'
    ),
    singFastForward2: new SingularityUpgrade(
      singularityData.singFastForward2,
      'singFastForward2'
    ),
    singAscensionSpeed: new SingularityUpgrade(
      singularityData.singAscensionSpeed,
      'singAscensionSpeed'
    ),
    singAscensionSpeed2: new SingularityUpgrade(
      singularityData.singAscensionSpeed2,
      'singAscensionSpeed2'
    ),
    oneMind: new SingularityUpgrade(singularityData.oneMind, 'oneMind'),
    wowPass4: new SingularityUpgrade(singularityData.wowPass4, 'wowPass4'),
    offeringAutomatic: new SingularityUpgrade(
      singularityData.offeringAutomatic,
      'offeringAutomatic'
    ),
    blueberries: new SingularityUpgrade(
      singularityData.blueberries,
      'blueberries'
    ),
    singAmbrosiaLuck: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck,
      'singAmbrosiaLuck'
    ),
    singAmbrosiaLuck2: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck2,
      'singAmbrosiaLuck2'
    ),
    singAmbrosiaLuck3: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck3,
      'singAmbrosiaLuck3'
    ),
    singAmbrosiaLuck4: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck4,
      'singAmbrosiaLuck4'
    ),
    singAmbrosiaGeneration: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration,
      'singAmbrosiaGeneration'
    ),
    singAmbrosiaGeneration2: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration2,
      'singAmbrosiaGeneration2'
    ),
    singAmbrosiaGeneration3: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration3,
      'singAmbrosiaGeneration3'
    ),
    singAmbrosiaGeneration4: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration4,
      'singAmbrosiaGeneration4'
    )
  },

  octeractUpgrades: {
    octeractStarter: new OcteractUpgrade(
      octeractData.octeractStarter,
      'octeractStarter'
    ),
    octeractGain: new OcteractUpgrade(
      octeractData.octeractGain,
      'octeractGain'
    ),
    octeractGain2: new OcteractUpgrade(
      octeractData.octeractGain2,
      'octeractGain2'
    ),
    octeractQuarkGain: new OcteractUpgrade(
      octeractData.octeractQuarkGain,
      'octeractQuarkGain'
    ),
    octeractQuarkGain2: new OcteractUpgrade(
      octeractData.octeractQuarkGain2,
      'octeractQuarkGain2'
    ),
    octeractCorruption: new OcteractUpgrade(
      octeractData.octeractCorruption,
      'octeractCorruption'
    ),
    octeractGQCostReduce: new OcteractUpgrade(
      octeractData.octeractGQCostReduce,
      'octeractGQCostReduce'
    ),
    octeractExportQuarks: new OcteractUpgrade(
      octeractData.octeractExportQuarks,
      'octeractExportQuarks'
    ),
    octeractImprovedDaily: new OcteractUpgrade(
      octeractData.octeractImprovedDaily,
      'octeractImprovedDaily'
    ),
    octeractImprovedDaily2: new OcteractUpgrade(
      octeractData.octeractImprovedDaily2,
      'octeractImprovedDaily2'
    ),
    octeractImprovedDaily3: new OcteractUpgrade(
      octeractData.octeractImprovedDaily3,
      'octeractImprovedDaily3'
    ),
    octeractImprovedQuarkHept: new OcteractUpgrade(
      octeractData.octeractImprovedQuarkHept,
      'octeractImprovedQuarkHept'
    ),
    octeractImprovedGlobalSpeed: new OcteractUpgrade(
      octeractData.octeractImprovedGlobalSpeed,
      'octeractImprovedGlobalSpeed'
    ),
    octeractImprovedAscensionSpeed: new OcteractUpgrade(
      octeractData.octeractImprovedAscensionSpeed,
      'octeractImprovedAscensionSpeed'
    ),
    octeractImprovedAscensionSpeed2: new OcteractUpgrade(
      octeractData.octeractImprovedAscensionSpeed2,
      'octeractImprovedAscensionSpeed2'
    ),
    octeractImprovedFree: new OcteractUpgrade(
      octeractData.octeractImprovedFree,
      'octeractImprovedFree'
    ),
    octeractImprovedFree2: new OcteractUpgrade(
      octeractData.octeractImprovedFree2,
      'octeractImprovedFree2'
    ),
    octeractImprovedFree3: new OcteractUpgrade(
      octeractData.octeractImprovedFree3,
      'octeractImprovedFree3'
    ),
    octeractImprovedFree4: new OcteractUpgrade(
      octeractData.octeractImprovedFree4,
      'octeractImprovedFree4'
    ),
    octeractSingUpgradeCap: new OcteractUpgrade(
      octeractData.octeractSingUpgradeCap,
      'octeractSingUpgradeCap'
    ),
    octeractOfferings1: new OcteractUpgrade(
      octeractData.octeractOfferings1,
      'octeractOfferings1'
    ),
    octeractObtainium1: new OcteractUpgrade(
      octeractData.octeractObtainium1,
      'octeractObtainium1'
    ),
    octeractAscensions: new OcteractUpgrade(
      octeractData.octeractAscensions,
      'octeractAscensions'
    ),
    octeractAscensions2: new OcteractUpgrade(
      octeractData.octeractAscensions2,
      'octeractAscensions2'
    ),
    octeractAscensionsOcteractGain: new OcteractUpgrade(
      octeractData.octeractAscensionsOcteractGain,
      'octeractAscensionsOcteractGain'
    ),
    octeractFastForward: new OcteractUpgrade(
      octeractData.octeractFastForward,
      'octeractFastForward'
    ),
    octeractAutoPotionSpeed: new OcteractUpgrade(
      octeractData.octeractAutoPotionSpeed,
      'octeractAutoPotionSpeed'
    ),
    octeractAutoPotionEfficiency: new OcteractUpgrade(
      octeractData.octeractAutoPotionEfficiency,
      'octeractAutoPotionEfficiency'
    ),
    octeractOneMindImprover: new OcteractUpgrade(
      octeractData.octeractOneMindImprover,
      'octeractOneMindImprover'
    ),
    octeractAmbrosiaLuck: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck,
      'octeractAmbrosiaLuck'
    ),
    octeractAmbrosiaLuck2: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck2,
      'octeractAmbrosiaLuck2'
    ),
    octeractAmbrosiaLuck3: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck3,
      'octeractAmbrosiaLuck3'
    ),
    octeractAmbrosiaLuck4: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck4,
      'octeractAmbrosiaLuck4'
    ),
    octeractAmbrosiaGeneration: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration,
      'octeractAmbrosiaGeneration'
    ),
    octeractAmbrosiaGeneration2: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration2,
      'octeractAmbrosiaGeneration2'
    ),
    octeractAmbrosiaGeneration3: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration3,
      'octeractAmbrosiaGeneration3'
    ),
    octeractAmbrosiaGeneration4: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration4,
      'octeractAmbrosiaGeneration4'
    )
  },

  dailyCodeUsed: false,
  hepteractAutoCraftPercentage: 50,
  octeractTimer: new Decimal(0),
  insideSingularityChallenge: false,

  singularityChallenges: {
    noSingularityUpgrades: new SingularityChallenge(
      singularityChallengeData.noSingularityUpgrades,
      'noSingularityUpgrades'
    ),
    oneChallengeCap: new SingularityChallenge(
      singularityChallengeData.oneChallengeCap,
      'oneChallengeCap'
    ),
    noOcteracts: new SingularityChallenge(
      singularityChallengeData.noOcteracts,
      'noOcteracts'
    ),
    limitedAscensions: new SingularityChallenge(
      singularityChallengeData.limitedAscensions,
      'limitedAscensions'
    ),
    noAmbrosiaUpgrades: new SingularityChallenge(
      singularityChallengeData.noAmbrosiaUpgrades,
      'noAmbrosiaUpgrades'
    )
  },

  ambrosia: new Decimal(0),
  lifetimeAmbrosia: new Decimal(0),
  blueberryTime: new Decimal(0),
  visitedAmbrosiaSubtab: false,
  spentBlueberries: 0,
  blueberryUpgrades: {
    ambrosiaTutorial: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaTutorial,
      'ambrosiaTutorial'
    ),
    ambrosiaQuarks1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarks1,
      'ambrosiaQuarks1'
    ),
    ambrosiaCubes1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubes1,
      'ambrosiaQuarks1'
    ),
    ambrosiaLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuck1,
      'ambrosiaLuck1'
    ),
    ambrosiaCubeQuark1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubeQuark1,
      'ambrosiaCubeQuark1'
    ),
    ambrosiaLuckQuark1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuckQuark1,
      'ambrosiaLuckQuark1'
    ),
    ambrosiaLuckCube1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuckCube1,
      'ambrosiaLuckCube1'
    ),
    ambrosiaQuarkCube1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarkCube1,
      'ambrosiaQuarkCube1'
    ),
    ambrosiaCubeLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubeLuck1,
      'ambrosiaCubeLuck1'
    ),
    ambrosiaQuarkLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarkLuck1,
      'ambrosiaQuarkLuck1'
    ),
    ambrosiaQuarks2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarks2,
      'ambrosiaQuarks2'
    ),
    ambrosiaCubes2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubes2,
      'ambrosiaQuarks2'
    ),
    ambrosiaLuck2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuck2,
      'ambrosiaLuck2'
    ),
    ambrosiaPatreon: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaPatreon,
      'ambrosiaPatreon'
    ),
    ambrosiaObtainium1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaObtainium1,
      'ambrosiaObtainium1'
    ),
    ambrosiaOffering1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaOffering1,
      'ambrosiaOffering1'
    ),
    ambrosiaHyperflux: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaHyperflux,
      'ambrosiaHyperflux'
    )
  },

  blueberryLoadouts: {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {}
  },
  blueberryLoadoutMode: 'saveTree',

  ultimateProgress: new Decimal(0),
  ultimatePixels: new Decimal(0),

  caches: {
    ambrosiaLuckAdditiveMult: new AmbrosiaLuckAdditiveMultCache(),
    ambrosiaLuck: new AmbrosiaLuckCache(),
    ambrosiaGeneration: new AmbrosiaGenerationCache(),
    blueberryInventory: new BlueberryInventoryCache()
  },

  lastExportedSave: 0
}

export const blankSave = Object.assign({}, player, {
  codes: new Map(Array.from({ length: 48 }, (_, i) => [i + 1, false]))
})

// The main cause of the double singularity bug was caused by a race condition
// when the game was saving just as the user was entering a Singularity. To fix
// this, hopefully, we disable saving the game when in the prompt or currently
// entering a Singularity.
export const saveCheck = { canSave: true }

export const saveSynergy = async (button?: boolean): Promise<boolean> => {
  if (Decimal.isNaN(player.coins)) {
    throw new Error('the save is fucked')
  }
  player.offlinetick = Date.now()
  player.loaded1009 = true
  player.loaded1009hotfix1 = true

  const p = playerJsonSchema.parse(player)
  const save = btoa(JSON.stringify(p))

  if (save !== null) {
    const saveBlob = new Blob([save], { type: 'text/plain' })

    // Should prevent overwritting of localforage that is currently used
    if (!saveCheck.canSave) {
      return false
    }

    localStorage.setItem('Synergysave2', save)
    await localforage.setItem<Blob>('Synergysave2', saveBlob)
  } else {
    await Alert(i18next.t('testing.errorSaving'))
    return false
  }

  if (button) {
    const el = DOMCacheGetOrSet('saveinfo')
    el.textContent = i18next.t('testing.gameSaved')
    setTimeout(() => (el.textContent = ''), 4000)
  }

  return true
}

const loadSynergy = async () => {
  const save = (await localforage.getItem<Blob>('Synergysave2'))
    ?? localStorage.getItem('Synergysave2')

  const saveString = typeof save === 'string' ? save : await save?.text()
  const data = saveString
    ? (JSON.parse(atob(saveString)) as PlayerSave & Record<string, unknown>)
    : null

  if (testing || !prod) {
    Object.defineProperties(window, {
      player: { value: player },
      G: { value: G },
      Decimal: { value: Decimal },
      i18n: { value: i18next }
    })

    if (data && testing) {
      data.exporttest = false
    }
  }

  Object.assign(G, { ...blankGlobals })

  if (data) {
    if ((data.exporttest === false || data.exporttest === 'NO!') && !testing) {
      return Alert(i18next.t('testing.saveInLive2'))
    }

    // size before loading
    const size = player.codes.size

    const oldPromoKeys = Object.keys(data).filter((k) => k.includes('offerpromo'))
    if (oldPromoKeys.length > 0) {
      oldPromoKeys.forEach((k) => {
        const value = data[k]
        const num = +k.replace(/[^\d]/g, '')
        player.codes.set(num, Boolean(value))
      })
    }

    console.log(playerSchema.safeParse(data))
    const validatedPlayer = playerSchema.safeParse(data)

    if (validatedPlayer.success) {
      Object.assign(player, validatedPlayer.data)
    } else {
      console.error(validatedPlayer.error)
      console.warn('PLAYER DATA:')
      console.log(data)
      clearTimers()
      return
    }

    updateLoadoutHoverClasses()

    player.lastExportedSave = data.lastExportedSave ?? 0

    if (data.offerpromo24used !== undefined) {
      player.codes.set(25, false)
    }

    // sets all non-existent codes to default value false
    if (player.codes.size < size) {
      for (let i = player.codes.size + 1; i <= size; i++) {
        if (!player.codes.has(i)) {
          player.codes.set(i, false)
        }
      }
    }

    // sets all non-existent codes to default value false
    if (player.codes.size < size) {
      for (let i = player.codes.size + 1; i <= size; i++) {
        if (!player.codes.has(i)) {
          player.codes.set(i, false)
        }
      }
    }
    
    // TODO(@KhafraDev): remove G.currentSingChallenge
    // fix current sing challenge blank
    if (player.insideSingularityChallenge) {
      const challenges = Object.keys(player.singularityChallenges);
      for (let i = 0; i < challenges.length; i++) {
        if (player.singularityChallenges[challenges[i]].enabled) {
          G.currentSingChallenge = singularityChallengeData[challenges[i]].HTMLTag;
          break;
        }
      }
    }

    if (!('rngCode' in data)) {
      player.rngCode = 0
    }

    if (data.loaded1009 === undefined || !data.loaded1009) {
      player.loaded1009 = false
    }
    if (data.loaded1009hotfix1 === undefined || !data.loaded1009hotfix1) {
      player.loaded1009hotfix1 = false
    }
    if (data.loaded10091 === undefined) {
      player.loaded10091 = false
    }
    if (data.loaded1010 === undefined) {
      player.loaded1010 = false
    }
    if (data.loaded10101 === undefined) {
      player.loaded10101 = false
    }

    if (typeof player.researches[76] === 'undefined') {
      player.codes.set(13, false)
      player.researches.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      player.achievements.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      player.maxofferings = player.runeshards
      player.maxobtainium = player.researchPoints
      player.researchPoints = player.researchPoints.add(51200 * player.researches[50])
      player.researches[50] = 0
    }

    player.maxofferings = player.maxofferings || 0
    player.maxobtainium = player.maxobtainium || 0
    player.runeshards = player.runeshards || 0
    player.researchPoints = player.researchPoints || 0

    if (
      !data.loaded1009
      || data.loaded1009hotfix1 === null
      || data.shopUpgrades?.offeringPotion === undefined
    ) {
      player.firstOwnedParticles = new Decimal(0)
      player.secondOwnedParticles = new Decimal(0)
      player.thirdOwnedParticles = new Decimal(0)
      player.fourthOwnedParticles = new Decimal(0)
      player.fifthOwnedParticles = new Decimal(0)
      player.firstCostParticles = new Decimal(1)
      player.secondCostParticles = new Decimal(100)
      player.thirdCostParticles = new Decimal(1e4)
      player.fourthCostParticles = new Decimal(1e8)
      player.fifthCostParticles = new Decimal(1e16)
      player.autoSacrificeToggle = false
      player.autoResearchToggle = false
      player.autoResearchMode = 'manual'
      player.autoResearch = 0
      player.autoSacrifice = 0
      player.sacrificeTimer = new Decimal(0)
      player.loaded1009 = true
      player.codes.set(18, false)
    }
    if (!data.loaded1009hotfix1) {
      player.loaded1009hotfix1 = true
      player.codes.set(19, true)
      player.firstOwnedParticles = new Decimal(0)
      player.secondOwnedParticles = new Decimal(0)
      player.thirdOwnedParticles = new Decimal(0)
      player.fourthOwnedParticles = new Decimal(0)
      player.fifthOwnedParticles = new Decimal(0)
      player.firstCostParticles = new Decimal(1)
      player.secondCostParticles = new Decimal(100)
      player.thirdCostParticles = new Decimal(1e4)
      player.fourthCostParticles = new Decimal(1e8)
      player.fifthCostParticles = new Decimal(1e16)
    }
    if (
      data.loaded10091 === undefined
      || !data.loaded10091
      || player.researches[86] > 100
      || player.researches[87] > 100
      || player.researches[88] > 100
      || player.researches[89] > 100
      || player.researches[90] > 10
    ) {
      player.loaded10091 = true
      player.researchPoints = player.researchPoints.add(7.5e8 * player.researches[82])
      player.researchPoints = player.researchPoints.add(2e8 * player.researches[83])
      player.researchPoints = player.researchPoints.add(4.5e9 * player.researches[84])
      player.researchPoints = player.researchPoints.add(2.5e7 * player.researches[86])
      player.researchPoints = player.researchPoints.add(7.5e7 * player.researches[87])
      player.researchPoints = player.researchPoints.add(3e8 * player.researches[88])
      player.researchPoints = player.researchPoints.add(1e9 * player.researches[89])
      player.researchPoints = player.researchPoints.add(2.5e7 * player.researches[90])
      player.researchPoints = player.researchPoints.add(1e8 * player.researches[91])
      player.researchPoints = player.researchPoints.add(2e9 * player.researches[92])
      player.researchPoints = player.researchPoints.add(9e9 * player.researches[93])
      player.researchPoints = player.researchPoints.add(7.25e10 * player.researches[94])
      player.researches[86] = 0
      player.researches[87] = 0
      player.researches[88] = 0
      player.researches[89] = 0
      player.researches[90] = 0
      player.researches[91] = 0
      player.researches[92] = 0
    }

    // const shop = data.shopUpgrades as LegacyShopUpgrades & Player['shopUpgrades'];
    if (
      data.achievements?.[169] === undefined
      || typeof player.achievements[169] === 'undefined'
      //    (shop.antSpeed === undefined && shop.antSpeedLevel === undefined) ||
      //    (shop.antSpeed === undefined && typeof shop.antSpeedLevel === 'undefined') ||
      || data.loaded1010 === undefined
      || data.loaded1010 === false
    ) {
      player.loaded1010 = true
      player.codes.set(21, false)

      player.firstOwnedAnts = new Decimal(0)
      player.firstGeneratedAnts = new Decimal(0)
      player.firstCostAnts = new Decimal('1e700')
      player.firstProduceAnts = new Decimal(0.0001)

      player.secondOwnedAnts = new Decimal(0)
      player.secondGeneratedAnts = new Decimal(0)
      player.secondCostAnts = new Decimal(3)
      player.secondProduceAnts = new Decimal(0.00005)

      player.thirdOwnedAnts = new Decimal(0)
      player.thirdGeneratedAnts = new Decimal(0)
      player.thirdCostAnts = new Decimal(100)
      player.thirdProduceAnts = new Decimal(0.00002)

      player.fourthOwnedAnts = new Decimal(0)
      player.fourthGeneratedAnts = new Decimal(0)
      player.fourthCostAnts = new Decimal(1e4)
      player.fourthProduceAnts = new Decimal(0.00001)

      player.fifthOwnedAnts = new Decimal(0)
      player.fifthGeneratedAnts = new Decimal(0)
      player.fifthCostAnts = new Decimal(1e12)
      player.fifthProduceAnts = new Decimal(0.000005)

      player.sixthOwnedAnts = new Decimal(0)
      player.sixthGeneratedAnts = new Decimal(0)
      player.sixthCostAnts = new Decimal(1e36)
      player.sixthProduceAnts = new Decimal(0.000002)

      player.seventhOwnedAnts = new Decimal(0)
      player.seventhGeneratedAnts = new Decimal(0)
      player.seventhCostAnts = new Decimal(1e100)
      player.seventhProduceAnts = new Decimal(0.000001)

      player.eighthOwnedAnts = new Decimal(0)
      player.eighthGeneratedAnts = new Decimal(0)
      player.eighthCostAnts = new Decimal(1e300)
      player.eighthProduceAnts = new Decimal(0.00000001)

      player.achievements.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      player.antPoints = new Decimal(1)

      player.upgrades[38] = 0
      player.upgrades[39] = 0
      player.upgrades[40] = 0

      player.upgrades[76] = 0
      player.upgrades[77] = 0
      player.upgrades[78] = 0
      player.upgrades[79] = 0
      player.upgrades[80] = 0

      //    player.shopUpgrades.antSpeed = 0;
      //    player.shopUpgrades.shopTalisman = 0;

      player.antUpgrades = [
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0),
        new Decimal(0)
      ]

      player.unlocks.rrow4 = false
      player.researchPoints = player.researchPoints.add(3e7 * player.researches[50])
      player.researchPoints = player.researchPoints.add(2e9 * player.researches[96])
      player.researchPoints = player.researchPoints.add(5e9 * player.researches[97])
      player.researchPoints = player.researchPoints.add(3e10 * player.researches[98])
      player.researches[50] = 0
      player.researches[96] = 0
      player.researches[97] = 0
      player.researches[98] = 0
      player.researches.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

      player.talismanLevels = [0, 0, 0, 0, 0, 0, 0]
      player.talismanRarity = [1, 1, 1, 1, 1, 1, 1]

      player.talismanShards = new Decimal(0)
      player.commonFragments = new Decimal(0)
      player.uncommonFragments = new Decimal(0)
      player.rareFragments = new Decimal(0)
      player.epicFragments = new Decimal(0)
      player.legendaryFragments = new Decimal(0)
      player.mythicalFragments = new Decimal(0)
      player.buyTalismanShardPercent = 10

      player.talismanOne = [null, -1, 1, 1, 1, -1]
      player.talismanTwo = [null, 1, 1, -1, -1, 1]
      player.talismanThree = [null, 1, -1, 1, 1, -1]
      player.talismanFour = [null, -1, -1, 1, 1, 1]
      player.talismanFive = [null, 1, 1, -1, -1, 1]
      player.talismanSix = [null, 1, 1, 1, -1, -1]
      player.talismanSeven = [null, -1, 1, -1, 1, 1]

      player.antSacrificePoints = new Decimal(0)
      player.antSacrificeTimer = new Decimal(0)

      player.obtainiumpersecond = new Decimal(0)
      player.maxobtainiumpersecond = new Decimal(0)
    }

    if (data.loaded10101 === undefined || data.loaded10101 === false) {
      player.loaded10101 = true

      // dprint-ignore
      const refundThese = [
        0, 31, 32, 61, 62, 63, 64, 76, 77, 78, 79, 80, 81, 98, 104, 105, 106,
        107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
        121, 122, 123, 125,
      ];
      // dprint-ignore
      const refundReward = [
        0, 2, 20, 5, 10, 80, 5e3, 1e7, 1e7, 2e7, 3e7, 4e7, 2e8, 3e10, 1e11,
        1e12, 2e11, 1e12, 2e10, 2e11, 1e12, 2e13, 5e13, 1e14, 2e14, 5e14, 1e15,
        2e15, 1e16, 1e15, 1e16, 1e14, 1e15, 1e15, 1e20,
      ];
      for (let i = 1; i < refundThese.length; i++) {
        player.researchPoints = player.researchPoints.add(player.researches[refundThese[i]] * refundReward[i])
        player.researches[refundThese[i]] = 0
      }
      player.autoAntSacrifice = false
      player.antMax = false
    }

    if (Decimal.lt(player.firstOwnedAnts, 1) && player.firstCostAnts.gte('1e1200')) {
      player.firstCostAnts = new Decimal('1e700')
      player.firstOwnedAnts = new Decimal(0)
    }

    // checkVariablesOnLoad(data)

    if (Decimal.eq(player.ascensionCount, 0)) {
      if (Decimal.gt(player.prestigeCount, 0)) {
        player.ascensionCounter = new Decimal(86400 * 90)
      }
      /*player.cubeUpgrades = [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];*/

      if (player.singularityCount === 0) {
        player.cubeUpgrades = [...blankSave.cubeUpgrades]
      }
      player.wowCubes = new WowCubes(new Decimal(0))
      player.wowTesseracts = new WowTesseracts(new Decimal(0))
      player.wowHypercubes = new WowHypercubes(new Decimal(0))
      player.wowPlatonicCubes = new WowPlatonicCubes(new Decimal(0))
      player.cubeBlessings = {
        accelerator: new Decimal(0),
        multiplier: new Decimal(0),
        offering: new Decimal(0),
        runeExp: new Decimal(0),
        obtainium: new Decimal(0),
        antSpeed: new Decimal(0),
        antSacrifice: new Decimal(0),
        antELO: new Decimal(0),
        talismanBonus: new Decimal(0),
        globalSpeed: new Decimal(0)
      }
    }

    if (player.transcendCount.lt(0)) {
      player.transcendCount = new Decimal(0)
    }
    if (player.reincarnationCount.lt(0)) {
      player.reincarnationCount = new Decimal(0)
    }
    if (player.runeshards.lt(0)) {
      player.runeshards = new Decimal(0)
    }
    if (player.researchPoints.lt(0)) {
      player.researchPoints = new Decimal(0)
    }

    if (player.resettoggle1 === 0) {
      player.resettoggle1 = 1
      player.resettoggle2 = 1
      player.resettoggle3 = 1
      player.resettoggle4 = 1
    }
    if (player.tesseractAutoBuyerToggle === 0) {
      player.tesseractAutoBuyerToggle = 1
    }
    if (player.reincarnationCount.lt(0.5) && player.unlocks.rrow4) {
      player.unlocks = {
        coinone: false,
        cointwo: false,
        cointhree: false,
        coinfour: false,
        prestige: false,
        generation: false,
        transcend: false,
        reincarnate: false,
        rrow1: false,
        rrow2: false,
        rrow3: false,
        rrow4: false
      }
    }

    // ! this check always fails for some reason and rolls back
    // if (Decimal.eq(Decimal.floor(player.ascendBuilding1.cost), player.ascendBuilding1.cost)) {
    //   player.ascendBuilding1.cost = new Decimal(1)
    //   player.ascendBuilding1.owned = new Decimal(0)
    //   player.ascendBuilding2.cost = new Decimal(10)
    //   player.ascendBuilding2.owned = new Decimal(0)
    //   player.ascendBuilding3.cost = new Decimal(100)
    //   player.ascendBuilding3.owned = new Decimal(0)
    //   player.ascendBuilding4.cost = new Decimal(1000)
    //   player.ascendBuilding4.owned = new Decimal(0)
    //   player.ascendBuilding5.cost = new Decimal(10000)
    //   player.ascendBuilding5.owned = new Decimal(0)
    // }

    if (!player.dayCheck) {
      player.dayCheck = new Date()
    }
    if (typeof player.dayCheck === 'string') {
      player.dayCheck = new Date(player.dayCheck)
      if (isNaN(player.dayCheck.getTime())) {
        player.dayCheck = new Date()
      }
    }
    // Measures for people who play the past
    let updatedLast = lastUpdated
    if (!isNaN(updatedLast.getTime())) {
      updatedLast = new Date(
        updatedLast.getFullYear(),
        updatedLast.getMonth(),
        updatedLast.getDate() - 1
      )
      if (player.dayCheck.getTime() < updatedLast.getTime()) {
        player.dayCheck = updatedLast
      }
    } else if (player.dayCheck.getTime() < 1654009200000) {
      player.dayCheck = new Date('06/01/2022 00:00:00')
    }
    // Calculate daily
    player.dayCheck = new Date(
      player.dayCheck.getFullYear(),
      player.dayCheck.getMonth(),
      player.dayCheck.getDate()
    )

    const maxLevel = maxCorruptionLevel()
    player.usedCorruptions = player.usedCorruptions.map(
      (curr: number, index: number) => {
        if (index >= 2 && index <= 9) {
          return Math.min(
            maxLevel
              * (Decimal.gt(player.challengecompletions[corrChallengeMinimum(index)], 0)
                ? 1
                : 0),
            curr
          )
        }
        return curr
      }
    )

    for (let i = 1; i <= 5; i++) {
      const ascendBuildingI = `ascendBuilding${i as OneToFive}` as const
      player[ascendBuildingI].generated = new Decimal(
        player[ascendBuildingI].generated
      )
    }

    while (typeof player.achievements[252] === 'undefined') {
      player.achievements.push(0)
    }
    while (typeof player.researches[200] === 'undefined') {
      player.researches.push(0)
    }
    while (typeof player.upgrades[140] === 'undefined') {
      player.upgrades.push(0)
    }

    if (
      player.saveString === ''
      || player.saveString === 'Synergism-v1011Test.txt'
    ) {
      player.saveString = player.singularityCount === 0
        ? 'Synergism-$VERSION$-$TIME$.txt'
        : 'Synergism-$VERSION$-$TIME$-$SING$.txt'
    }
    ;(DOMCacheGetOrSet('saveStringInput') as HTMLInputElement).value = cleanString(player.saveString)

    for (let j = 1; j < 126; j++) {
      upgradeupdate(j, true)
    }

    for (let j = 1; j <= 200; j++) {
      updateResearchBG(j)
    }
    for (let j = 1; j < player.cubeUpgrades.length; j++) {
      updateCubeUpgradeBG(j)
    }
    const platUpg = document.querySelectorAll('img[id^="platUpg"]')
    for (let j = 1; j <= platUpg.length; j++) {
      updatePlatonicUpgradeBG(j)
    }

    const q = [
      'coin',
      'crystal',
      'mythos',
      'particle',
      'offering',
      'tesseract'
    ] as const
    if (
      player.coinbuyamount !== 1
      && player.coinbuyamount !== 10
      && player.coinbuyamount !== 100
      && player.coinbuyamount !== 1000
    ) {
      player.coinbuyamount = 1
    }
    if (
      player.crystalbuyamount !== 1
      && player.crystalbuyamount !== 10
      && player.crystalbuyamount !== 100
      && player.crystalbuyamount !== 1000
    ) {
      player.crystalbuyamount = 1
    }
    if (
      player.mythosbuyamount !== 1
      && player.mythosbuyamount !== 10
      && player.mythosbuyamount !== 100
      && player.mythosbuyamount !== 1000
    ) {
      player.mythosbuyamount = 1
    }
    if (
      player.particlebuyamount !== 1
      && player.particlebuyamount !== 10
      && player.particlebuyamount !== 100
      && player.particlebuyamount !== 1000
    ) {
      player.particlebuyamount = 1
    }
    if (
      player.offeringbuyamount !== 1
      && player.offeringbuyamount !== 10
      && player.offeringbuyamount !== 100
      && player.offeringbuyamount !== 1000
    ) {
      player.offeringbuyamount = 1
    }
    if (
      player.tesseractbuyamount !== 1
      && player.tesseractbuyamount !== 10
      && player.tesseractbuyamount !== 100
      && player.tesseractbuyamount !== 1000
    ) {
      player.tesseractbuyamount = 1
    }
    for (let j = 0; j <= 5; j++) {
      for (let k = 0; k < 4; k++) {
        let d = ''
        if (k === 0) {
          d = 'one'
        }
        if (k === 1) {
          d = 'ten'
        }
        if (k === 2) {
          d = 'hundred'
        }
        if (k === 3) {
          d = 'thousand'
        }
        const e = `${q[j]}${d}`
        DOMCacheGetOrSet(e).style.backgroundColor = ''
      }
      let c = ''
      const curBuyAmount = player[`${q[j]}buyamount` as const]
      if (curBuyAmount === 1) {
        c = 'one'
      }
      if (curBuyAmount === 10) {
        c = 'ten'
      }
      if (curBuyAmount === 100) {
        c = 'hundred'
      }
      if (curBuyAmount === 1000) {
        c = 'thousand'
      }

      const b = `${q[j]}${c}`
      DOMCacheGetOrSet(b).style.backgroundColor = 'green'
    }

    const testArray = []
    // Creates a copy of research costs array
    for (let i = 0; i < G.researchBaseCosts.length; i++) {
      testArray.push(G.researchBaseCosts[i])
    }
    // Sorts the above array, and returns the index order of sorted array
    G.researchOrderByCost = sortWithIndices(testArray)
    player.roombaResearchIndex = 0

    // June 09, 2021: Updated toggleShops() and removed boilerplate - Platonic
    toggleShops()
    getChallengeConditions()
    updateChallengeDisplay()
    revealStuff()
    toggleauto()

    // Challenge summary should be displayed
    if (player.currentChallenge.transcension > 0) {
      challengeDisplay(player.currentChallenge.transcension)
    } else if (player.currentChallenge.reincarnation > 0) {
      challengeDisplay(player.currentChallenge.reincarnation)
    } else if (player.currentChallenge.ascension > 0) {
      challengeDisplay(player.currentChallenge.ascension)
    } else {
      challengeDisplay(1)
    }

    corruptionStatsUpdate()
    const corrs = Math.min(8, Object.keys(player.corruptionLoadouts).length) + 1
    for (let i = 0; i < corrs; i++) {
      corruptionLoadoutTableUpdate(i)
    }
    showCorruptionStatsLoadouts()
    updateCorruptionLoadoutNames()

    DOMCacheGetOrSet('researchrunebonus').textContent = i18next.t(
      'runes.thanksResearches',
      {
        percent: format(G.effectiveLevelMult.sub(1).mul(100), 4, true)
      }
    )

    DOMCacheGetOrSet('talismanlevelup').style.display = 'none'
    DOMCacheGetOrSet('talismanrespec').style.display = 'none'

    DOMCacheGetOrSet('antSacrificeSummary').style.display = 'none'

    // This must be initialized at the beginning of the calculation
    c15RewardUpdate()

    calculatePlatonicBlessings()
    calculateHypercubeBlessings()
    calculateTesseractBlessings()
    calculateCubeBlessings()
    updateTalismanAppearance(0)
    updateTalismanAppearance(1)
    updateTalismanAppearance(2)
    updateTalismanAppearance(3)
    updateTalismanAppearance(4)
    updateTalismanAppearance(5)
    updateTalismanAppearance(6)
    for (const id in player.ascStatToggles) {
      toggleAscStatPerSecond(+id) // toggle each stat twice to make sure the displays are correct and match what they used to be
      toggleAscStatPerSecond(+id)
    }

    // Strictly check the input and data with values other than numbers
    const omit = /e\+/
    let inputd = new Decimal(player.autoChallengeTimer.start)
    let inpute = Number(
      (DOMCacheGetOrSet('startAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(
        DOMCacheGetOrSet('startAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.start || blankSave.autoChallengeTimer.start}`.replace(omit, 'e')
      updateAutoChallenge(1)
    }

    DOMCacheGetOrSet('startTimerValue').innerHTML = i18next.t(
      'challenges.multartSweep',
      {
        time: format(player.autoChallengeTimer.start, 2, true)
      }
    )

    inputd = new Decimal(player.autoChallengeTimer.exit)
    inpute = Number(
      (DOMCacheGetOrSet('exitAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(
        DOMCacheGetOrSet('exitAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.exit || blankSave.autoChallengeTimer.exit}`.replace(omit, 'e')
      updateAutoChallenge(2)
    }

    DOMCacheGetOrSet('exitTimerValue').innerHTML = i18next.t(
      'challenges.timeExitChallenge',
      {
        time: format(player.autoChallengeTimer.exit, 2, true)
      }
    )

    inputd = new Decimal(player.autoChallengeTimer.enter)
    inpute = Number(
      (DOMCacheGetOrSet('enterAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(
        DOMCacheGetOrSet('enterAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.enter || blankSave.autoChallengeTimer.enter}`.replace(omit, 'e')
      updateAutoChallenge(3)
    }

    DOMCacheGetOrSet('enterTimerValue').innerHTML = i18next.t(
      'challenges.timeEnterChallenge',
      {
        time: format(player.autoChallengeTimer.enter, 2, true)
      }
    )

    inputd = player.prestigeamount
    inpute = Number(
      (DOMCacheGetOrSet('prestigeamount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('prestigeamount') as HTMLInputElement).value = `${
        player.prestigeamount || blankSave.prestigeamount
      }`.replace(omit, 'e')
      updateAutoReset(1)
    }
    inputd = player.transcendamount
    inpute = Number(
      (DOMCacheGetOrSet('transcendamount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('transcendamount') as HTMLInputElement).value = `${
        player.transcendamount || blankSave.transcendamount
      }`.replace(omit, 'e')
      updateAutoReset(2)
    }
    inputd = player.reincarnationamount
    inpute = Number(
      (DOMCacheGetOrSet('reincarnationamount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('reincarnationamount') as HTMLInputElement).value = `${
        player.reincarnationamount || blankSave.reincarnationamount
      }`.replace(omit, 'e')
      updateAutoReset(3)
    }
    inputd = new Decimal(player.autoAscendThreshold)
    inpute = Number(
      (DOMCacheGetOrSet('ascensionAmount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('ascensionAmount') as HTMLInputElement).value = `${
        player.autoAscendThreshold || blankSave.autoAscendThreshold
      }`.replace(omit, 'e')
      updateAutoReset(4)
    }
    inputd = new Decimal(player.autoAntSacTimer)
    inpute = Number(
      (DOMCacheGetOrSet('autoAntSacrificeAmount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('autoAntSacrificeAmount') as HTMLInputElement).value = `${
        player.autoAntSacTimer || blankSave.autoAntSacTimer
      }`.replace(
        omit,
        'e'
      )
      updateAutoReset(5)
    }
    inputd = new Decimal(player.tesseractAutoBuyerAmount)
    inpute = Number(
      (DOMCacheGetOrSet('tesseractAmount') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('tesseractAmount') as HTMLInputElement).value = `${
        player.tesseractAutoBuyerAmount || blankSave.tesseractAutoBuyerAmount
      }`.replace(omit, 'e')
      updateTesseractAutoBuyAmount()
    }
    inputd = new Decimal(player.openCubes)
    inpute = Number(
      (DOMCacheGetOrSet('cubeOpensInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('cubeOpensInput') as HTMLInputElement).value = `${player.openCubes || blankSave.openCubes}`
        .replace(omit, 'e')
      updateAutoCubesOpens(1)
    }
    inputd = new Decimal(player.openTesseracts)
    inpute = Number(
      (DOMCacheGetOrSet('tesseractsOpensInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('tesseractsOpensInput') as HTMLInputElement).value = `${
        player.openTesseracts || blankSave.openTesseracts
      }`.replace(omit, 'e')
      updateAutoCubesOpens(2)
    }
    inputd = new Decimal(player.openHypercubes)
    inpute = Number(
      (DOMCacheGetOrSet('hypercubesOpensInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('hypercubesOpensInput') as HTMLInputElement).value = `${
        player.openHypercubes || blankSave.openHypercubes
      }`.replace(omit, 'e')
      updateAutoCubesOpens(3)
    }
    inputd = new Decimal(player.openPlatonicsCubes)
    inpute = Number(
      (DOMCacheGetOrSet('platonicCubeOpensInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('platonicCubeOpensInput') as HTMLInputElement).value = `${
        player.openPlatonicsCubes || blankSave.openPlatonicsCubes
      }`.replace(
        omit,
        'e'
      )
      updateAutoCubesOpens(4)
    }
    inputd = new Decimal(player.runeBlessingBuyAmount)
    inpute = Number(
      (DOMCacheGetOrSet('buyRuneBlessingInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('buyRuneBlessingInput') as HTMLInputElement).value = `${
        player.runeBlessingBuyAmount || blankSave.runeBlessingBuyAmount
      }`.replace(omit, 'e')
      updateRuneBlessingBuyAmount(1)
    }

    DOMCacheGetOrSet('buyRuneBlessingToggle').innerHTML = i18next.t(
      'runes.blessings.buyUpTo',
      {
        amount: format(player.runeBlessingBuyAmount)
      }
    )

    inputd = new Decimal(player.runeSpiritBuyAmount)
    inpute = Number(
      (DOMCacheGetOrSet('buyRuneSpiritInput') as HTMLInputElement).value
    )
    if (Decimal.neq(inpute, inputd) || Decimal.isNaN(Decimal.add(inpute, inputd))) {
      ;(DOMCacheGetOrSet('buyRuneSpiritInput') as HTMLInputElement).value = `${
        player.runeSpiritBuyAmount || blankSave.runeSpiritBuyAmount
      }`.replace(omit, 'e')
      updateRuneBlessingBuyAmount(2)
    }
    DOMCacheGetOrSet('buyRuneSpiritToggleValue').innerHTML = i18next.t(
      'runes.spirits.buyUpTo',
      {
        amount: format(player.runeSpiritBuyAmount, 0, true)
      }
    )

    if (player.resettoggle1 === 1) {
      DOMCacheGetOrSet('prestigeautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle2 === 1) {
      DOMCacheGetOrSet('transcendautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle3 === 1) {
      DOMCacheGetOrSet('reincarnateautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle4 === 1) {
      DOMCacheGetOrSet('tesseractautobuymode').textContent = i18next.t('toggles.modeAmount')
    }

    if (player.resettoggle1 === 2) {
      DOMCacheGetOrSet('prestigeautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle2 === 2) {
      DOMCacheGetOrSet('transcendautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle3 === 2) {
      DOMCacheGetOrSet('reincarnateautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle4 === 2) {
      DOMCacheGetOrSet('tesseractautobuymode').textContent = i18next.t(
        'toggles.modePercentage'
      )
    }

    if (player.tesseractAutoBuyerToggle === 1) {
      DOMCacheGetOrSet('tesseractautobuytoggle').textContent = i18next.t(
        'runes.talismans.autoBuyOn'
      )
      DOMCacheGetOrSet('tesseractautobuytoggle').style.border = '2px solid green'
    }
    if (player.tesseractAutoBuyerToggle === 2) {
      DOMCacheGetOrSet('tesseractautobuytoggle').textContent = i18next.t(
        'runes.talismans.autoBuyOff'
      )
      DOMCacheGetOrSet('tesseractautobuytoggle').style.border = '2px solid red'
    }

    if (player.autoOpenCubes) {
      DOMCacheGetOrSet('openCubes').textContent = i18next.t('wowCubes.autoOn', {
        percent: format(player.openCubes, 0)
      })
      DOMCacheGetOrSet('openCubes').style.border = '1px solid green'
      DOMCacheGetOrSet('cubeOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openCubes').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openCubes').style.border = '1px solid red'
      DOMCacheGetOrSet('cubeOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenTesseracts) {
      DOMCacheGetOrSet('openTesseracts').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openTesseracts, 0)
        }
      )
      DOMCacheGetOrSet('openTesseracts').style.border = '1px solid green'
      DOMCacheGetOrSet('tesseractsOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openTesseracts').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openTesseracts').style.border = '1px solid red'
      DOMCacheGetOrSet('tesseractsOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenHypercubes) {
      DOMCacheGetOrSet('openHypercubes').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openHypercubes, 0)
        }
      )
      DOMCacheGetOrSet('openHypercubes').style.border = '1px solid green'
      DOMCacheGetOrSet('hypercubesOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openHypercubes').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openHypercubes').style.border = '1px solid red'
      DOMCacheGetOrSet('hypercubesOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenPlatonicsCubes) {
      DOMCacheGetOrSet('openPlatonicCube').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openPlatonicsCubes, 0)
        }
      )
      DOMCacheGetOrSet('openPlatonicCube').style.border = '1px solid green'
      DOMCacheGetOrSet('platonicCubeOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openPlatonicCube').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openPlatonicCube').style.border = '1px solid red'
      DOMCacheGetOrSet('platonicCubeOpensInput').style.border = '1px solid red'
    }

    if (player.autoResearchToggle) {
      DOMCacheGetOrSet('toggleautoresearch').textContent = i18next.t(
        'researches.automaticOn'
      )
    } else {
      DOMCacheGetOrSet('toggleautoresearch').textContent = i18next.t(
        'researches.automaticOff'
      )
    }
    if (player.autoResearchMode === 'cheapest') {
      DOMCacheGetOrSet('toggleautoresearchmode').textContent = i18next.t(
        'researches.autoModeCheapest'
      )
    } else {
      DOMCacheGetOrSet('toggleautoresearchmode').textContent = i18next.t(
        'researches.autoModeManual'
      )
    }
    if (player.autoSacrificeToggle) {
      DOMCacheGetOrSet('toggleautosacrifice').textContent = i18next.t(
        'runes.blessings.autoRuneOn'
      )
      DOMCacheGetOrSet('toggleautosacrifice').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautosacrifice').textContent = i18next.t(
        'runes.blessings.autoRuneOff'
      )
      DOMCacheGetOrSet('toggleautosacrifice').style.border = '2px solid red'
    }
    if (player.autoBuyFragment) {
      DOMCacheGetOrSet('toggleautoBuyFragments').textContent = i18next.t(
        'runes.talismans.autoBuyOn'
      )
      DOMCacheGetOrSet('toggleautoBuyFragments').style.border = '2px solid white'
      DOMCacheGetOrSet('toggleautoBuyFragments').style.color = 'orange'
    } else {
      DOMCacheGetOrSet('toggleautoBuyFragments').textContent = i18next.t(
        'runes.talismans.autoBuyOff'
      )
      DOMCacheGetOrSet('toggleautoBuyFragments').style.border = '2px solid orange'
      DOMCacheGetOrSet('toggleautoBuyFragments').style.color = 'white'
    }
    if (player.autoFortifyToggle) {
      DOMCacheGetOrSet('toggleautofortify').textContent = i18next.t(
        'runes.autoFortifyOn'
      )
      DOMCacheGetOrSet('toggleautofortify').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautofortify').textContent = i18next.t(
        'runes.autoFortifyOff'
      )
      DOMCacheGetOrSet('toggleautofortify').style.border = '2px solid red'
    }
    if (player.autoEnhanceToggle) {
      DOMCacheGetOrSet('toggleautoenhance').textContent = i18next.t(
        'runes.autoEnhanceOn'
      )
      DOMCacheGetOrSet('toggleautoenhance').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautoenhance').textContent = i18next.t(
        'runes.autoEnhanceOff'
      )
      DOMCacheGetOrSet('toggleautoenhance').style.border = '2px solid red'
    }
    player.saveOfferingToggle = false // Lint doesnt like it being inside if
    DOMCacheGetOrSet('saveOffToggle').textContent = i18next.t(
      'toggles.saveOfferingsOff'
    )
    DOMCacheGetOrSet('saveOffToggle').style.color = 'white'
    if (player.autoAscend) {
      DOMCacheGetOrSet('ascensionAutoEnable').textContent = i18next.t(
        'corruptions.autoAscend.on'
      )
      DOMCacheGetOrSet('ascensionAutoEnable').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('ascensionAutoEnable').textContent = i18next.t(
        'corruptions.autoAscend.off'
      )
      DOMCacheGetOrSet('ascensionAutoEnable').style.border = '2px solid red'
    }
    if (player.shopConfirmationToggle) {
      DOMCacheGetOrSet('toggleConfirmShop').textContent = i18next.t(
        'shop.shopConfirmationOn'
      )
    } else {
      DOMCacheGetOrSet('toggleConfirmShop').textContent = i18next.t(
        'shop.shopConfirmationOff'
      )
    }
    switch (player.shopBuyMaxToggle) {
      case false:
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buy1')
        break
      case 'TEN':
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buy10')
        break
      case true:
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buyMax')
        break
      case 'ANY':
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buyAny')
    }
    if (player.shopHideToggle) {
      DOMCacheGetOrSet('toggleHideShop').textContent = i18next.t('shop.hideMaxedOn')
    } else {
      DOMCacheGetOrSet('toggleHideShop').textContent = i18next.t('shop.hideMaxedOff')
    }
    if (player.researchBuyMaxToggle) {
      DOMCacheGetOrSet('toggleresearchbuy').textContent = i18next.t(
        'researches.upgradeMax'
      )
    } else {
      DOMCacheGetOrSet('toggleresearchbuy').textContent = i18next.t(
        'researches.upgradeOne'
      )
    }
    if (player.cubeUpgradesBuyMaxToggle) {
      DOMCacheGetOrSet('toggleCubeBuy').textContent = i18next.t(
        'toggles.upgradeMaxIfPossible'
      )
    } else {
      DOMCacheGetOrSet('toggleCubeBuy').textContent = i18next.t(
        'toggles.upgradeOneLevelWow'
      )
    }
    autoCubeUpgradesToggle(false)
    autoPlatonicUpgradesToggle(false)

    for (let i = 1; i <= 2; i++) {
      toggleAntMaxBuy()
      toggleAntAutoSacrifice(0)
      toggleAntAutoSacrifice(1)
    }

    for (let i = 1; i <= 2; i++) {
      toggleAutoAscend(0)
      toggleAutoAscend(1)
    }

    DOMCacheGetOrSet(
      'historyTogglePerSecondButton'
    ).textContent = `Per second: ${player.historyShowPerSecond ? 'ON' : 'OFF'}`
    DOMCacheGetOrSet('historyTogglePerSecondButton').style.borderColor = player.historyShowPerSecond ? 'green' : 'red'

    // If auto research is enabled and runing; Make sure there is something to try to research if possible
    if (
      player.autoResearchToggle
      && autoResearchEnabled()
      && player.autoResearchMode === 'cheapest'
    ) {
      player.autoResearch = G.researchOrderByCost[player.roombaResearchIndex]
    }

    player.autoResearch = Math.min(200, player.autoResearch)
    player.autoSacrifice = Math.min(5, player.autoSacrifice)

    if (player.researches[61] === 0) {
      DOMCacheGetOrSet('automaticobtainium').textContent = i18next.t(
        'main.buyResearch3x11'
      )
    }

    if (player.autoSacrificeToggle && player.autoSacrifice > 0.5) {
      DOMCacheGetOrSet(`rune${player.autoSacrifice}`).style.backgroundColor = 'orange'
    }

    if (player.autoWarpCheck) {
      DOMCacheGetOrSet('warpAuto').textContent = i18next.t(
        'general.autoOnColon'
      )
      DOMCacheGetOrSet('warpAuto').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('warpAuto').textContent = i18next.t(
        'general.autoOffColon'
      )
      DOMCacheGetOrSet('warpAuto').style.border = '2px solid red'
    }
    DOMCacheGetOrSet('autoHepteractPercentage').textContent = i18next.t(
      'wowCubes.hepteractForge.autoSetting',
      {
        x: `${player.hepteractAutoCraftPercentage}`
      }
    )
    DOMCacheGetOrSet('hepteractToQuarkTradeAuto').textContent = player.overfluxOrbsAutoBuy
      ? i18next.t('general.autoOnColon')
      : i18next.t('general.autoOffColon')
    DOMCacheGetOrSet('hepteractToQuarkTradeAuto').style.border = `2px solid ${
      player.overfluxOrbsAutoBuy ? 'green' : 'red'
    }`
    toggleAutoBuyOrbs(true, true)

    DOMCacheGetOrSet('blueberryToggleMode').innerHTML = player.blueberryLoadoutMode === 'saveTree'
      ? i18next.t('ambrosia.loadouts.save')
      : i18next.t('ambrosia.loadouts.load')

    toggleTalismanBuy(player.buyTalismanShardPercent)
    updateTalismanInventory()
    calculateObtainium()
    calculateAnts()
    calculateRuneLevels()
    resetHistoryRenderAllTables()
    updateSingularityAchievements()
    updateSingularityGlobalPerks()
  }

  updateAchievementBG()
  if (player.currentChallenge.reincarnation) {
    resetrepeat('reincarnationChallenge')
  } else if (player.currentChallenge.transcension) {
    resetrepeat('transcensionChallenge')
  }

  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  player.dayTimer = 60 * 60 * 24 - (s + 60 * m + 60 * 60 * h)
}

const abbSuffixes = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'UDc',
  'DDc',
  'TDc',
  'QaDc',
  'QiDc',
  'SxDc',
  'SpDc',
  'OcDc',
  'NoDc',
  'Vg'
]

const timeList = [
  { name: 'pt', stop: true, amt: 5.39e-44 },
  { name: 'qs', stop: true, amt: 1 / 1e30 },
  { name: 'rs', stop: true, amt: 1 / 1e27 },
  { name: 'ys', stop: true, amt: 1 / 1e24 },
  { name: 'zs', stop: true, amt: 1 / 1e21 },
  { name: 'as', stop: true, amt: 1 / 1e18 },
  { name: 'fs', stop: true, amt: 1 / 1e15 },
  { name: 'ps', stop: true, amt: 1 / 1e12 },
  { name: 'ns', stop: true, amt: 1 / 1e9 },
  { name: 'µs', stop: true, amt: 1 / 1e6 },
  { name: 'ms', stop: true, amt: 1 / 1e3 },
  { name: 's', stop: true, amt: 1 },
  { name: 'm', stop: false, amt: 60 },
  { name: 'h', stop: false, amt: 3600 },
  { name: 'd', stop: false, amt: 86400 },
  { name: 'mo', stop: false, amt: 2592000 },
  { name: 'y', stop: false, amt: 3.1536e7 },
  { name: 'mil', stop: false, amt: 3.1536e10 },
  { name: 'uni', stop: false, amt: 4.320432e17 }
]

const abbExp = 1e66

export const format = (
  number:
    | Decimal
    | number
    | { [Symbol.toPrimitive]: unknown }
    | string
    | null
    | undefined,
  dec = 0,
  long = false,
  expdec = 3
): string => {
  if (number === undefined) {
    return 'undefined'
  }
  if (number === null) {
    return 'null'
  }
  if (typeof number === 'object' && Symbol.toPrimitive in number) {
    number = Number(number)
  }
  const n = new Decimal(number)
  if (n.lt(0)) return `-${format(n.negate(), dec, long, expdec)}`
  if (n.eq(0)) return (0).toFixed(dec)
  if (Decimal.isNaN(n)) return 'NaN'
  if (!Decimal.isFinite(n)) return 'Infinity'
  if (n.lt(0.001)) {
    return `1 / ${format(n.recip(), dec, long, expdec)}`
  } else if (n.lt(long ? 1e12 : 1e9)) {
    return n.toNumber().toFixed(dec).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
  } else if (n.lt(abbExp)) {
    const abb = n.log10().mul(0.33333333336666665).floor()
    return `${n.div(abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`
  } else if (n.lt(long ? 'e1e9' : 'e1e6')) {
    const exp = n.log10().mul(1.0000000001).floor()
    return `${n.div(exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, long, expdec)}`
  } else if (n.lt('10^^7')) {
    return `e${format(n.log10(), dec, long, expdec)}`
  } else {
    return `F${format(n.slog(10), dec, long, expdec)}`
  }
}

export const formatPerc = (
  number:
    | Decimal
    | number
    | { [Symbol.toPrimitive]: unknown }
    | null
    | undefined,
  dec = 3,
  long = false,
  expdec = 3
): string => {
  if (number === undefined) {
    return 'undefined'
  }
  if (number === null) {
    return 'null'
  }
  if (typeof number === 'object' && Symbol.toPrimitive in number) {
    number = Number(number)
  }
  const n = new Decimal(number)
  if (n.gte(1000)) {
    return `${format(n, dec, long, expdec)}x`
  } else {
    return `${format(Decimal.sub(100, Decimal.div(100, n)), dec, long, expdec)}%`
  }
}

export const formatTime = (
  number:
    | Decimal
    | number
    | { [Symbol.toPrimitive]: unknown }
    | null
    | undefined,
  dec = 0,
  long = false,
  expdec = 3,
  limit = 2
): string => {
  if (number === undefined) {
    return 'undefined'
  }
  if (number === null) {
    return 'null'
  }
  if (typeof number === 'object' && Symbol.toPrimitive in number) {
    number = Number(number)
  }
  let n = new Decimal(number)
  if (n.lt(0)) return `-${formatTime(n.negate(), dec, long, expdec)}`
  if (n.eq(0)) return (0).toFixed(dec)
  if (Number.isNaN(n.mag)) return 'I don\'t know?'
  if (!Number.isFinite(n.mag)) return 'Forever'
  let lim = 0
  let str = ''
  let end = false
  for (let i = timeList.length - 1; i >= 0; i--) {
    if (lim >= limit) {
      break
    }
    if (n.gte(timeList[i].amt)) {
      end = lim + 1 >= limit || timeList[i].stop
      str = `${str} ${format(n.div(timeList[i].amt).sub(end ? 0 : 0.5), end ? dec : 0, long, expdec)}${
        timeList[i].name
      }`
      n = n.sub(n.div(timeList[i].amt).floor().mul(timeList[i].amt))
      lim++
      if (timeList[i].stop) {
        break
      }
    } else {
      if (i === 0) {
        return `${str} ${format(n, dec, long, expdec)}s`.slice(1)
      }
    }
  }
  return str.slice(1)
}

export const formatTimeShort = (
  seconds: number | Decimal
): string => {
  return formatTime(seconds)
}

export const updateAllTick = (): void => {
  let a = new Decimal(0)

  G.totalAccelerator = player.acceleratorBought
  G.costDivisor = new Decimal(1)

  if (player.upgrades[8] !== 0) {
    a = a.add(player.multiplierBought.div(7).floor())
  }
  if (player.upgrades[21] !== 0) {
    a = a.add(5)
  }
  if (player.upgrades[22] !== 0) {
    a = a.add(4)
  }
  if (player.upgrades[23] !== 0) {
    a = a.add(3)
  }
  if (player.upgrades[24] !== 0) {
    a = a.add(2)
  }
  if (player.upgrades[25] !== 0) {
    a = a.add(1)
  }
  if (player.upgrades[27] !== 0) {
    a = a.add(player.coins.max(0).add(1).log(1e3).floor().min(250)).add(
      player.coins.max(0).add(1).log(1e15).floor().sub(50).max(0).min(1750)
    )
  }
  if (player.upgrades[29] !== 0) {
    a = a.add(
      Decimal.add(player.firstOwnedCoin, player.secondOwnedCoin).add(player.thirdOwnedCoin).add(player.fourthOwnedCoin)
        .add(player.fifthOwnedCoin).div(80).min(2000).floor()
    )
  }
  if (player.upgrades[32] !== 0) {
    a = a.add(player.prestigePoints.max(0).add(1).log(1e25).floor().min(500))
  }
  if (player.upgrades[45] !== 0) {
    a = a.add(player.transcendShards.max(0).add(1).log10().floor().min(2500))
  }
  if (player.achievements[5] !== 0) {
    a = a.add(Decimal.div(player.firstOwnedCoin, 500).floor())
  }
  if (player.achievements[12] !== 0) {
    a = a.add(Decimal.div(player.secondOwnedCoin, 500).floor())
  }
  if (player.achievements[19] !== 0) {
    a = a.add(Decimal.div(player.thirdOwnedCoin, 500).floor())
  }
  if (player.achievements[26] !== 0) {
    a = a.add(Decimal.div(player.fourthOwnedCoin, 500).floor())
  }
  if (player.achievements[33] !== 0) {
    a = a.add(Decimal.div(player.fifthOwnedCoin, 500).floor())
  }
  if (player.achievements[60] !== 0) {
    a = a.add(2)
  }
  if (player.achievements[61] !== 0) {
    a = a.add(2)
  }
  if (player.achievements[62] !== 0) {
    a = a.add(2)
  }

  a = a.add(Decimal.mul(5, CalcECC('transcend', player.challengecompletions[2])))
  G.freeUpgradeAccelerator = a
  a = a.add(
    Decimal.add(G.cubeBonusMultiplier[1], 4).add(2 * player.researches[18]).add(2 * player.researches[19]).add(
      3 * player.researches[20]
    ).mul(G.totalAcceleratorBoost)
  )
  if (player.unlocks.prestige) {
    a = a.add(Decimal.floor(Decimal.pow(getRuneEffective(1).div(4), 1.5)))
    a = a.mul(getRuneEffective(1).div(200).add(1))
  }

  calculateAcceleratorMultiplier()
  a = a.mul(G.acceleratorMultiplier)
  a = a.pow(Math.min(
    1,
    (1 + player.platonicUpgrades[6] / 30)
      * G.viscosityPower[player.usedCorruptions[2]]
  ))
  a = a.add(Decimal.mul(2000, hepteractEffective('accelerator')))
  a = a.mul(G.challenge15Rewards.accelerator)
  a = a.mul(Decimal.mul(hepteractEffective('accelerator'), 0.0003).add(1))
  a = Decimal.floor(a)

  if (player.usedCorruptions[2] >= 15) {
    a = a.pow(0.2)
  }
  if (player.usedCorruptions[2] >= 16) {
    a = new Decimal(1)
  }

  G.freeAccelerator = a
  G.totalAccelerator = G.totalAccelerator.add(G.freeAccelerator)

  G.tuSevenMulti = 1

  if (player.upgrades[46] > 0.5) {
    G.tuSevenMulti = 1.05
  }

  G.acceleratorPower = Decimal.pow(
    Decimal.mul(G.tuSevenMulti, G.totalAcceleratorBoost.div(100)).mul(
      CalcECC('transcend', player.challengecompletions[2]).div(20).add(1)
    ).add(1.1),
    CalcECC('reincarnation', player.challengecompletions[7]).mul(0.04).add(1)
  )
  G.acceleratorPower = G.acceleratorPower.add(
    CalcECC('transcend', player.challengecompletions[2]).div(2).floor().div(200)
  )
  for (let i = 1; i <= 5; i++) {
    if (player.achievements[7 * i - 4] > 0) {
      G.acceleratorPower = G.acceleratorPower.add(0.0005 * i)
    }
  }

  // No MA and Sadistic will always overwrite Transcend challenges starting in v2.0.0
  if (
    player.currentChallenge.reincarnation !== 7
    && player.currentChallenge.reincarnation !== 10
  ) {
    if (player.currentChallenge.transcension === 1) {
      G.acceleratorPower = G.acceleratorPower.mul(Decimal.div(25, Decimal.add(player.challengecompletions[1], 50)))
      G.acceleratorPower = G.acceleratorPower.add(0.55)
      G.acceleratorPower = Decimal.max(1, G.acceleratorPower)
    }
    if (player.currentChallenge.transcension === 2) {
      G.acceleratorPower = new Decimal(1)
    }
    if (player.currentChallenge.transcension === 3) {
      G.acceleratorPower = new Decimal(1.05)
        .add(
          Decimal.mul(G.tuSevenMulti, 2)
            .mul(G.totalAcceleratorBoost.div(300))
            .mul(CalcECC('transcend', player.challengecompletions[2]).div(20).add(1))
        )
    }
  }

  if (player.currentChallenge.reincarnation === 7) {
    G.acceleratorPower = new Decimal(1)
  }
  if (player.currentChallenge.reincarnation === 10) {
    G.acceleratorPower = new Decimal(1)
  }

  if (player.currentChallenge.transcension !== 1) {
    G.acceleratorEffect = Decimal.pow(G.acceleratorPower, G.totalAccelerator)
  }

  if (player.currentChallenge.transcension === 1) {
    G.acceleratorEffect = Decimal.pow(
      G.acceleratorPower,
      Decimal.add(G.totalAccelerator, G.totalMultiplier)
    )
  }
  G.acceleratorEffectDisplay = G.acceleratorPower.sub(1).mul(100)
  if (player.currentChallenge.reincarnation === 10) {
    G.acceleratorEffect = new Decimal(1)
  }
  G.generatorPower = new Decimal(1)
  if (
    player.upgrades[11] > 0.5
    && player.currentChallenge.reincarnation !== 7
  ) {
    G.generatorPower = Decimal.pow(1.02, G.totalAccelerator)
  }

  if (Decimal.gte(player.ascendShards, 1e100)) {
    calculateCubeBlessings()
  }
}

export const updateAllMultiplier = (): void => {
  let a = new Decimal(0)

  if (player.upgrades[7] > 0) {
    a = a.add(Decimal.add(player.fifthOwnedCoin, 1).log10().floor().add(1).min(4))
  }
  if (player.upgrades[9] > 0) {
    a = a.add(player.acceleratorBought.div(10).floor())
  }
  if (player.upgrades[21] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[22] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[23] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[24] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[25] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[28] > 0) {
    a = a.add(
      player.firstOwnedCoin.add(player.secondOwnedCoin).add(player.thirdOwnedCoin).add(player.fourthOwnedCoin).add(
        player.fifthOwnedCoin
      ).div(160).floor().min(1000)
    )
  }
  if (player.upgrades[30] > 0) {
    a = a.add(
      Decimal.add(
        player.coins.max(0).add(1).log10().div(10).floor().min(75),
        player.coins.max(0).add(1).log10().div(30).floor().min(925)
      )
    )
  }
  if (player.upgrades[33] > 0) {
    a = a.add(G.totalAcceleratorBoost)
  }
  if (player.upgrades[49] > 0) {
    a = a.add(player.transcendPoints.max(0).add(1).log10().div(10).floor().min(50))
  }
  if (player.upgrades[68] > 0) {
    a = a.add(G.taxdivisor.log10().div(1000).floor().min(2500))
  }
  if (Decimal.gt(player.challengecompletions[1], 0)) {
    a = a.add(1)
  }
  if (player.achievements[6] > 0.5) {
    a = a.add(Decimal.div(player.firstOwnedCoin, 1000).floor())
  }
  if (player.achievements[13] > 0.5) {
    a = a.add(Decimal.div(player.secondOwnedCoin, 1000).floor())
  }
  if (player.achievements[20] > 0.5) {
    a = a.add(Decimal.div(player.thirdOwnedCoin, 1000).floor())
  }
  if (player.achievements[27] > 0.5) {
    a = a.add(Decimal.div(player.fourthOwnedCoin, 1000).floor())
  }
  if (player.achievements[34] > 0.5) {
    a = a.add(Decimal.div(player.fifthOwnedCoin, 1000).floor())
  }
  if (player.achievements[57] > 0.5) {
    a = a.add(1)
  }
  if (player.achievements[58] > 0.5) {
    a = a.add(1)
  }
  if (player.achievements[59] > 0.5) {
    a = a.add(1)
  }
  a = a.add(
    Decimal.floor(
      (G.rune1level
        .add(G.rune2level)
        .add(G.rune3level)
        .add(G.rune4level)
        .add(G.rune5level))
        .div(8)
    ).mul(player.researches[94]).mul(20)
  )

  G.freeUpgradeMultiplier = a

  if (player.achievements[38] > 0.5) {
    a = a.add(
      Decimal.floor(
        Decimal.floor(
          getRuneEffective(2).div(10)
        ).mul(
          Decimal.floor(
            getRuneEffective(2).div(10).add(1)
          )
        )
      ).div(2)
    )
  }

  a = a.mul(1 + player.achievements[57] / 100)
  a = a.mul(1 + player.achievements[58] / 100)
  a = a.mul(1 + player.achievements[59] / 100)
  a = a.mul(Math.pow(
    1.01,
    player.upgrades[21]
      + player.upgrades[22]
      + player.upgrades[23]
      + player.upgrades[24]
      + player.upgrades[25]
  ))
  a = a.mul(1 + 0.03 * player.upgrades[34] + 0.02 * player.upgrades[35])
  a = a.mul(CalcECC('ascension', player.challengecompletions[14]).div(2).add(1).mul(player.researches[2]).div(5).add(1))
  a = a.mul(
    1
      + 0.05 * player.researches[11]
      + 0.04 * player.researches[12]
      + 0.03 * player.researches[13]
      + 0.02 * player.researches[14]
      + 0.02 * player.researches[15]
  )
  a = a.mul(getRuneEffective(2).div(400).add(1))
  a = a.mul(1 + (1 / 20) * player.researches[87])
  a = a.mul(1 + (1 / 100) * player.researches[128])
  a = a.mul(1 + (0.8 / 100) * player.researches[143])
  a = a.mul(1 + (0.6 / 100) * player.researches[158])
  a = a.mul(1 + (0.4 / 100) * player.researches[173])
  a = a.mul(1 + (0.2 / 100) * player.researches[188])
  a = a.mul(1 + (0.01 / 100) * player.researches[200])
  a = a.mul(Decimal.mul(player.cubeUpgrades[50], 0.0001).add(1))
  a = a.mul(calculateSigmoidExponential(
    40,
    ((Decimal.add(player.antUpgrades[4]!, G.bonusant5).div(1000)).mul(40)).div(39)
  ))
  a = a.mul(G.cubeBonusMultiplier[2])
  if (
    (player.currentChallenge.transcension !== 0
      || player.currentChallenge.reincarnation !== 0)
    && player.upgrades[50] > 0.5
  ) {
    a = a.mul(1.25)
  }
  a = a.pow(
    Decimal.mul(Decimal.div(player.platonicUpgrades[6], 30).add(1), G.viscosityPower[player.usedCorruptions[2]]).min(1)
  )
  a = a.add(Decimal.mul(1000, hepteractEffective('multiplier')))
  a = a.mul(G.challenge15Rewards.multiplier)
  a = a.mul(Decimal.mul(hepteractEffective('multiplier'), 0.0003).add(1))
  a = Decimal.floor(a)

  if (player.usedCorruptions[2] >= 15) {
    a = a.pow(0.2)
  }
  if (player.usedCorruptions[2] >= 16) {
    a = new Decimal(1)
  }

  G.freeMultiplier = a
  G.totalMultiplier = Decimal.add(G.freeMultiplier, player.multiplierBought)

  G.challengeOneLog = new Decimal(3)

  let b = new Decimal(0)
  let c = new Decimal(0)
  b = b.add(player.transcendShards.add(1).log(3))
  b = b.mul(Decimal.mul(player.researches[33], 0.11).add(1))
  b = b.mul(Decimal.mul(player.researches[34], 0.11).add(1))
  b = b.mul(Decimal.mul(player.researches[35], 0.11).add(1))
  b = b.mul(Decimal.mul(player.researches[89], 0.2).add(1))
  b = b.mul(Decimal.mul(G.effectiveRuneBlessingPower[2], 10).add(1))

  c = c.add(Decimal.mul(CalcECC('transcend', player.challengecompletions[1]), b).mul(0.1).floor())
  c = c.add(CalcECC('transcend', player.challengecompletions[1]).mul(10))
  G.freeMultiplierBoost = c
  G.totalMultiplierBoost = Decimal.pow(
    b.floor().add(c),
    Decimal.mul(0.04, CalcECC('reincarnation', player.challengecompletions[7])).add(1)
  )

  let c7 = 1
  if (Decimal.gte(player.challengecompletions[7], 1)) {
    c7 = 1.25
  }

  G.multiplierPower = Decimal.mul(G.totalMultiplierBoost, c7).mul(0.005).add(2)

  // No MA and Sadistic will always override Transcend Challenges starting in v2.0.0
  if (player.currentChallenge.reincarnation !== 7 && player.currentChallenge.reincarnation !== 10) {
    if (player.currentChallenge.transcension === 1) {
      G.multiplierPower = new Decimal(1)
    }
    if (player.currentChallenge.transcension === 2) {
      G.multiplierPower = Decimal.add(b, c).mul(c7).mul(0.0012).add(1.25)
    }
  }

  if (player.currentChallenge.reincarnation === 7) {
    G.multiplierPower = new Decimal(1)
  }
  if (player.currentChallenge.reincarnation === 10) {
    G.multiplierPower = new Decimal(1)
  }

  G.multiplierEffect = Decimal.pow(G.multiplierPower, G.totalMultiplier)
}

export const multipliers = (): void => {
  let s = new Decimal(1)
  let c = new Decimal(1)
  let crystalExponent = new Decimal(1 / 3)
  crystalExponent = crystalExponent.add(
    Decimal.mul(player.researches[129], Decimal.add(player.commonFragments, 1).log(4)).mul(0.05).add(10).add(
      Decimal.mul(calculateCorruptionPoints().div(20), G.effectiveRuneSpiritPower[3])
    ).min(Decimal.mul(0.05, player.crystalUpgrades[3]))
  )
  crystalExponent = crystalExponent.add(Decimal.mul(0.04, CalcECC('transcend', player.challengecompletions[3])))
  crystalExponent = crystalExponent.add(Decimal.mul(0.08, player.researches[28]))
  crystalExponent = crystalExponent.add(Decimal.mul(0.08, player.researches[29]))
  crystalExponent = crystalExponent.add(Decimal.mul(0.04, player.researches[30]))
  crystalExponent = crystalExponent.add(Decimal.mul(8, player.cubeUpgrades[17]))
  G.prestigeMultiplier = player.prestigeShards.max(0).pow(crystalExponent).add(1)

  G.buildingPower = player.reincarnationShards.add(1).log10().mul(
    1 - Math.pow(2, -1 / 160)
  ).mul(
    Decimal.add(
      Decimal.mul(
        player.researches[36],
        0.05
      ),
      Decimal.mul(
        player.researches[37],
        0.025
      )
    ).add(
      Decimal.mul(
        player.researches[38],
        0.025
      )
    ).add(1)
  ).add(
    CalcECC('reincarnation', player.challengecompletions[8]).div(4)
  ).add(1)

  G.buildingPower = Decimal.pow(
    G.buildingPower,
    Decimal.mul(player.cubeUpgrades[12], 0.09).add(1)
  )
  G.buildingPower = Decimal.pow(
    G.buildingPower,
    Decimal.mul(player.cubeUpgrades[36], 0.05).add(1)
  )
  G.reincarnationMultiplier = Decimal.pow(G.buildingPower, G.totalCoinOwned)

  G.antMultiplier = Decimal.pow(
    player.antPoints.max(1),
    calculateCrumbToCoinExp()
  )

  s = s.mul(G.multiplierEffect)
  s = s.mul(G.acceleratorEffect)
  s = s.mul(G.prestigeMultiplier)
  s = s.mul(G.reincarnationMultiplier)
  s = s.mul(G.antMultiplier)
  // PLAT - check
  const first6CoinUp = G.totalCoinOwned.add(1).mul(
    Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))
  )

  if (player.highestSingularityCount > 0) {
    s = s.mul(
      Decimal.add(player.goldenQuarks, 1).pow(1.5).mul(Decimal.add(player.highestSingularityCount, 1).pow(2))
    )
  }
  if (player.upgrades[6] > 0.5) {
    s = s.mul(first6CoinUp)
  }
  if (player.upgrades[12] > 0.5) {
    s = s.mul(Decimal.min(1e4, Decimal.pow(1.01, player.prestigeCount)))
  }
  if (player.upgrades[20] > 0.5) {
    // PLAT - check
    s = s.mul(Decimal.pow(G.totalCoinOwned.div(4).add(1), 10))
  }
  if (player.upgrades[41] > 0.5) {
    s = s.mul(
      Decimal.min(1e30, player.transcendPoints.add(1).sqrt())
    )
  }
  if (player.upgrades[43] > 0.5) {
    s = s.mul(Decimal.min(1e30, Decimal.pow(1.01, player.transcendCount)))
  }
  if (player.upgrades[48] > 0.5) {
    s = s.mul(
      Decimal.mul(G.totalMultiplier, G.totalAccelerator).div(1000).add(1).pow(8)
    )
  }
  if (player.currentChallenge.reincarnation === 6) {
    s = s.div(1e250)
  }
  if (player.currentChallenge.reincarnation === 7) {
    s = s.div('1e1250')
  }
  if (player.currentChallenge.reincarnation === 9) {
    s = s.div('1e2000000')
  }
  if (player.currentChallenge.reincarnation === 10) {
    s = s.div('1e12500000')
  }
  c = Decimal.pow(s, Decimal.mul(0.001, player.researches[17]).add(1))
  let lol = Decimal.pow(c, Decimal.mul(0.025, player.upgrades[123]).add(1))
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[5] > 0
  ) {
    lol = Decimal.pow(lol, 1.1)
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[14] > 0
  ) {
    lol = lol.pow(
      Decimal.mul(player.usedCorruptions[9], player.coins.add(1).log10()).mul(0.05).div(
        player.coins.add(1).log10().add(1e7)
      ).add(1)
    )
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[15] > 0
  ) {
    lol = lol.pow(1.1)
  }

  lol = Decimal.pow(lol, G.challenge15Rewards.coinExponent)

  G.globalCoinMultiplier = lol

  G.globalCoinMultiplier = Decimal.pow(
    G.globalCoinMultiplier,
    G.financialcollapsePower[player.usedCorruptions[9]]
  )

  G.coinOneMulti = new Decimal(1)
  if (player.upgrades[1] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.mul(first6CoinUp)
  }
  if (player.upgrades[10] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.mul(
      Decimal.pow(2, Decimal.div(player.secondOwnedCoin, 15).min(50))
    )
  }
  if (player.upgrades[56] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.mul('1e5000')
  }

  G.coinTwoMulti = new Decimal(1)
  if (player.upgrades[2] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.mul(first6CoinUp)
  }
  if (player.upgrades[13] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.mul(
      Decimal.min(
        1e50,
        Decimal.pow(
          player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1),
          4 / 3
        ).mul(1e10)
      )
    )
  }
  if (player.upgrades[19] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.mul(
      Decimal.min(1e200, player.transcendPoints.mul(1e30).add(1))
    )
  }
  if (player.upgrades[57] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.mul('1e7500')
  }

  G.coinThreeMulti = new Decimal(1)
  if (player.upgrades[3] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.mul(first6CoinUp)
  }
  if (player.upgrades[18] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.mul(
      Decimal.min(1e125, player.transcendShards.add(1))
    )
  }
  if (player.upgrades[58] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.mul('1e15000')
  }

  G.coinFourMulti = new Decimal(1)
  if (player.upgrades[4] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.mul(first6CoinUp)
  }
  if (player.upgrades[17] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.mul(1e100)
  }
  if (player.upgrades[59] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.mul('1e25000')
  }

  G.coinFiveMulti = new Decimal(1)
  if (player.upgrades[5] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.mul(first6CoinUp)
  }
  if (player.upgrades[60] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.mul('1e35000')
  }

  G.globalCrystalMultiplier = new Decimal(1)
  if (player.achievements[36] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(2)
  }
  if (player.achievements[37] > 0.5 && player.prestigePoints.gte(10)) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
      Decimal.log(player.prestigePoints.add(1), 10)
    )
  }
  if (player.achievements[44] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
      Decimal.pow(getRuneEffective(3).div(2), 2)
        .mul(Decimal.pow(2, getRuneEffective(3).div(2).sub(8)))
        .add(1)
    )
  }
  if (player.upgrades[36] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
      Decimal.min('1e5000', Decimal.pow(player.prestigePoints.max(0), 1 / 500))
    )
  }
  if (player.upgrades[63] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
      Decimal.min('1e6000', Decimal.pow(player.reincarnationPoints.max(0).add(1), 6))
    )
  }

  if (player.researches[39] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
      G.reincarnationMultiplier.add(10).log10().pow(0.9).mul(0.2).pow10()
    )
  }

  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.min(
      Decimal.pow(10, Decimal.mul(player.crystalUpgrades[0], 2).add(50)),
      Decimal.pow(1.05, Decimal.mul(player.achievementPoints, player.crystalUpgrades[0]))
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.min(
      Decimal.pow(10, Decimal.mul(player.crystalUpgrades[1], 5).add(100)),
      Decimal.pow(
        player.coins.max(0).add(1).log10(),
        Decimal.div(player.crystalUpgrades[1], 3)
      )
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(
      Decimal.min(
        new Decimal(0.12)
          .add(0.88 * player.upgrades[122])
          .add(player.commonFragments.add(1).log(4).mul(player.researches[129]).mul(0.001)),
        Decimal.mul(0.001, player.crystalUpgrades[2])
      ).add(1),
      Decimal.add(player.firstOwnedDiamonds, player.secondOwnedDiamonds)
        .add(player.thirdOwnedDiamonds)
        .add(player.fourthOwnedDiamonds)
        .add(player.fifthOwnedDiamonds)
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(
      1.01,
      (Decimal.add(player.challengecompletions[1], player.challengecompletions[2])
        .add(player.challengecompletions[3])
        .add(player.challengecompletions[4])
        .add(player.challengecompletions[5]))
        .mul(player.crystalUpgrades[4])
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(10, CalcECC('transcend', player.challengecompletions[5]))
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(
      1e4,
      CalcECC('ascension', player.challengecompletions[14]).div(2).add(1).mul(player.researches[5])
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(2.5, player.researches[26])
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.mul(
    Decimal.pow(2.5, player.researches[27])
  )

  G.globalMythosMultiplier = new Decimal(1)

  if (player.upgrades[37] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      Decimal.pow(Decimal.log(player.prestigePoints.max(0).add(10), 10), 2)
    )
  }
  if (player.upgrades[42] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      Decimal.min(
        1e50,
        Decimal.pow(player.prestigePoints.max(0).add(1), 1 / 50)
          .div(2.5)
          .add(1)
      )
    )
  }
  if (player.upgrades[47] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier
      .mul(Decimal.pow(1.05, player.achievementPoints))
      .mul(player.achievementPoints + 1)
  }
  if (player.upgrades[51] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      Decimal.pow(G.totalAcceleratorBoost, 2)
    )
  }
  if (player.upgrades[52] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      Decimal.pow(G.globalMythosMultiplier, 0.025)
    )
  }
  if (player.upgrades[64] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      Decimal.pow(player.reincarnationPoints.add(1), 2)
    )
  }
  if (player.researches[40] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.mul(
      G.reincarnationMultiplier.add(10).log10().pow(0.8).mul(0.15).pow10()
    )
  }
  G.grandmasterMultiplier = new Decimal(1)
  G.totalMythosOwned = Decimal.add(player.firstOwnedMythos, player.secondOwnedMythos)
    .add(player.thirdOwnedMythos)
    .add(player.fourthOwnedMythos)
    .add(player.fifthOwnedMythos)

  G.mythosBuildingPower = CalcECC('transcend', player.challengecompletions[3]).div(200).add(1)
  G.challengeThreeMultiplier = Decimal.pow(G.mythosBuildingPower, G.totalMythosOwned)

  let softcapStart = new Decimal('ee7')
  G.challengeThreeSoftcap = new Decimal(1)
  softcapStart = softcapStart.pow(constantEffects().c3Effect)
  if (G.challengeThreeMultiplier.gte(softcapStart)) {
    const prev = G.challengeThreeMultiplier
    G.challengeThreeMultiplier = G.challengeThreeMultiplier.log(softcapStart).pow(0.4).pow_base(softcapStart)
    G.challengeThreeSoftcap = G.challengeThreeMultiplier.log(prev)
  }

  G.grandmasterMultiplier = G.grandmasterMultiplier.mul(
    G.challengeThreeMultiplier
  )

  G.mythosupgrade13 = new Decimal(1)
  G.mythosupgrade14 = new Decimal(1)
  G.mythosupgrade15 = new Decimal(1)
  if (player.upgrades[53] === 1) {
    G.mythosupgrade13 = G.mythosupgrade13.mul(
      Decimal.min('1e1250', G.acceleratorEffect.root(125))
    )
  }
  if (player.upgrades[54] === 1) {
    G.mythosupgrade14 = G.mythosupgrade14.mul(
      Decimal.min('1e2000', G.multiplierEffect.root(180))
    )
  }
  if (player.upgrades[55] === 1) {
    G.mythosupgrade15 = G.mythosupgrade15.mul(
      Decimal.pow('1e1000', G.buildingPower.sub(1).min(1000))
    )
  }

  G.globalConstantMult = new Decimal(1)
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.pow(
      1.05
        + 0.01 * player.achievements[270]
        + 0.001 * player.platonicUpgrades[18],
      player.constantUpgrades[1]
    )
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.pow(
      Decimal.min(
        new Decimal(100)
          .add(10 * player.achievements[270])
          .add(10 * player.shopUpgrades.constantEX)
          .add(G.challenge15Rewards.exponent.sub(1).mul(1000))
          .add(3 * player.platonicUpgrades[18]),
        player.constantUpgrades[2]
      ).mul(0.001).add(1),
      ascendBuildingDR()
    )
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.mul(2 / 100, player.researches[139]).add(1)
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.mul(3 / 100, player.researches[154]).add(1)
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.mul(4 / 100, player.researches[169]).add(1)
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.mul(5 / 100, player.researches[184]).add(1)
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.mul(10 / 100, player.researches[199]).add(1)
  )
  G.globalConstantMult = G.globalConstantMult.mul(
    G.challenge15Rewards.constantBonus
  )
  if (player.platonicUpgrades[5] > 0) {
    G.globalConstantMult = G.globalConstantMult.mul(2)
  }
  if (player.platonicUpgrades[10] > 0) {
    G.globalConstantMult = G.globalConstantMult.mul(10)
  }
  if (player.platonicUpgrades[15] > 0) {
    G.globalConstantMult = G.globalConstantMult.mul(1e250)
  }
  G.globalConstantMult = G.globalConstantMult.mul(
    Decimal.pow(Decimal.add(player.overfluxPowder, 1), Decimal.mul(10, player.platonicUpgrades[16]))
  )
}

export const resourceGain = (dt: Decimal): void => {
  calculateTotalCoinOwned()
  calculateTotalAcceleratorBoost()
  updateAllTick()
  updateAllMultiplier()
  multipliers()
  calculatetax()

  if (G.produceTotal.gte(0.001)) {
    const addcoin = Decimal.min(
      G.produceTotal.div(G.taxdivisor),
      Decimal.pow(10, Decimal.sub(G.maxexponent, G.taxdivisorcheck.log10()))
    ).mul(dt.mul(40))
    G.coinProduceTrue = addcoin

    player.coins = player.coins.add(addcoin) // why
    player.coinsThisPrestige = player.coinsThisPrestige.add(addcoin)
    player.coinsThisTranscension = player.coinsThisTranscension.add(addcoin)
    player.coinsThisReincarnation = player.coinsThisReincarnation.add(addcoin)
    player.coinsTotal = player.coinsTotal.add(addcoin)
  }

  resetCurrency()
  if (player.upgrades[93] === 1 && player.coinsThisPrestige.gte(1e16)) {
    player.prestigePoints = player.prestigePoints.add(
      Decimal.floor(G.prestigePointGain.div(4000).mul(dt.mul(40)))
    )
  }
  if (player.upgrades[100] === 1 && player.coinsThisTranscension.gte(1e100)) {
    player.transcendPoints = player.transcendPoints.add(
      Decimal.floor(G.transcendPointGain.div(4000).mul(dt.mul(40)))
    )
  }
  if (Decimal.gt(player.cubeUpgrades[28], 0) && player.transcendShards.gte(1e300)) {
    player.reincarnationPoints = player.reincarnationPoints.add(
      Decimal.floor(G.reincarnationPointGain.div(4000).mul(dt.mul(40)))
    )
  }
  G.produceFirstDiamonds = player.firstGeneratedDiamonds
    .add(player.firstOwnedDiamonds)
    .mul(player.firstProduceDiamonds)
    .mul(G.globalCrystalMultiplier)
  G.produceSecondDiamonds = player.secondGeneratedDiamonds
    .add(player.secondOwnedDiamonds)
    .mul(player.secondProduceDiamonds)
    .mul(G.globalCrystalMultiplier)
  G.produceThirdDiamonds = player.thirdGeneratedDiamonds
    .add(player.thirdOwnedDiamonds)
    .mul(player.thirdProduceDiamonds)
    .mul(G.globalCrystalMultiplier)
  G.produceFourthDiamonds = player.fourthGeneratedDiamonds
    .add(player.fourthOwnedDiamonds)
    .mul(player.fourthProduceDiamonds)
    .mul(G.globalCrystalMultiplier)
  G.produceFifthDiamonds = player.fifthGeneratedDiamonds
    .add(player.fifthOwnedDiamonds)
    .mul(player.fifthProduceDiamonds)
    .mul(G.globalCrystalMultiplier)

  player.fourthGeneratedDiamonds = player.fourthGeneratedDiamonds.add(
    G.produceFifthDiamonds.mul(dt.mul(40))
  )
  player.thirdGeneratedDiamonds = player.thirdGeneratedDiamonds.add(
    G.produceFourthDiamonds.mul(dt.mul(40))
  )
  player.secondGeneratedDiamonds = player.secondGeneratedDiamonds.add(
    G.produceThirdDiamonds.mul(dt.mul(40))
  )
  player.firstGeneratedDiamonds = player.firstGeneratedDiamonds.add(
    G.produceSecondDiamonds.mul(dt.mul(40))
  )
  G.produceDiamonds = G.produceFirstDiamonds

  if (
    player.currentChallenge.transcension !== 3
    && player.currentChallenge.reincarnation !== 10
  ) {
    player.prestigeShards = player.prestigeShards.add(
      G.produceDiamonds.mul(dt.mul(40))
    )
  }

  G.produceFifthMythos = player.fifthGeneratedMythos
    .add(player.fifthOwnedMythos)
    .mul(player.fifthProduceMythos)
    .mul(G.globalMythosMultiplier)
    .mul(G.grandmasterMultiplier)
    .mul(G.mythosupgrade15)
  G.produceFourthMythos = player.fourthGeneratedMythos
    .add(player.fourthOwnedMythos)
    .mul(player.fourthProduceMythos)
    .mul(G.globalMythosMultiplier)
  G.produceThirdMythos = player.thirdGeneratedMythos
    .add(player.thirdOwnedMythos)
    .mul(player.thirdProduceMythos)
    .mul(G.globalMythosMultiplier)
    .mul(G.mythosupgrade14)
  G.produceSecondMythos = player.secondGeneratedMythos
    .add(player.secondOwnedMythos)
    .mul(player.secondProduceMythos)
    .mul(G.globalMythosMultiplier)
  G.produceFirstMythos = player.firstGeneratedMythos
    .add(player.firstOwnedMythos)
    .mul(player.firstProduceMythos)
    .mul(G.globalMythosMultiplier)
    .mul(G.mythosupgrade13)
  player.fourthGeneratedMythos = player.fourthGeneratedMythos.add(
    G.produceFifthMythos.mul(dt.mul(40))
  )
  player.thirdGeneratedMythos = player.thirdGeneratedMythos.add(
    G.produceFourthMythos.mul(dt.mul(40))
  )
  player.secondGeneratedMythos = player.secondGeneratedMythos.add(
    G.produceThirdMythos.mul(dt.mul(40))
  )
  player.firstGeneratedMythos = player.firstGeneratedMythos.add(
    G.produceSecondMythos.mul(dt.mul(40))
  )

  G.produceMythos = new Decimal(0)
  G.produceMythos = player.firstGeneratedMythos
    .add(player.firstOwnedMythos)
    .mul(player.firstProduceMythos)
    .mul(G.globalMythosMultiplier)
    .mul(G.mythosupgrade13)
  G.producePerSecondMythos = G.produceMythos.mul(40)

  let pm = new Decimal(1)
  if (player.upgrades[67] > 0.5) {
    pm = pm.mul(
      Decimal.pow(
        1.03,
        player.firstOwnedParticles.add(player.secondOwnedParticles).add(player.thirdOwnedParticles).add(
          player.fourthOwnedParticles
        ).add(player.fifthOwnedParticles)
      )
    )
  }
  G.produceFifthParticles = player.fifthGeneratedParticles
    .add(player.fifthOwnedParticles)
    .mul(player.fifthProduceParticles)
  G.produceFourthParticles = player.fourthGeneratedParticles
    .add(player.fourthOwnedParticles)
    .mul(player.fourthProduceParticles)
  G.produceThirdParticles = player.thirdGeneratedParticles
    .add(player.thirdOwnedParticles)
    .mul(player.thirdProduceParticles)
  G.produceSecondParticles = player.secondGeneratedParticles
    .add(player.secondOwnedParticles)
    .mul(player.secondProduceParticles)
  G.produceFirstParticles = player.firstGeneratedParticles
    .add(player.firstOwnedParticles)
    .mul(player.firstProduceParticles)
    .mul(pm)
  player.fourthGeneratedParticles = player.fourthGeneratedParticles.add(
    G.produceFifthParticles.mul(dt.mul(40))
  )
  player.thirdGeneratedParticles = player.thirdGeneratedParticles.add(
    G.produceFourthParticles.mul(dt.mul(40))
  )
  player.secondGeneratedParticles = player.secondGeneratedParticles.add(
    G.produceThirdParticles.mul(dt.mul(40))
  )
  player.firstGeneratedParticles = player.firstGeneratedParticles.add(
    G.produceSecondParticles.mul(dt.mul(40))
  )

  G.produceParticles = new Decimal(0)
  G.produceParticles = player.firstGeneratedParticles
    .add(player.firstOwnedParticles)
    .mul(player.firstProduceParticles)
    .mul(pm)
  G.producePerSecondParticles = G.produceParticles.mul(40)

  if (
    player.currentChallenge.transcension !== 3
    && player.currentChallenge.reincarnation !== 10
  ) {
    player.transcendShards = player.transcendShards.add(
      G.produceMythos.mul(dt.mul(40))
    )
  }
  if (player.currentChallenge.reincarnation !== 10) {
    player.reincarnationShards = player.reincarnationShards.add(
      G.produceParticles.mul(dt.mul(40))
    )
  }

  createAnts(dt)
  for (let i = 1; i <= 5; i++) {
    G.ascendBuildingProduction[G.ordinals[(5 - i) as ZeroToFour]] = player[
      `ascendBuilding${(6 - i) as OneToFive}` as const
    ].generated
      .add(player[`ascendBuilding${(6 - i) as OneToFive}` as const].owned)
      .mul(player[`ascendBuilding${i as OneToFive}` as const].multiplier)
      .mul(G.globalConstantMult)

    if (i !== 5) {
      const fiveMinusI = (5 - i) as 1 | 2 | 3 | 4
      player[`ascendBuilding${fiveMinusI}` as const].generated = player[
        `ascendBuilding${fiveMinusI}` as const
      ].generated.add(
        G.ascendBuildingProduction[G.ordinals[fiveMinusI]].mul(dt)
      )
    }
  }

  player.ascendShards = player.ascendShards.add(
    G.ascendBuildingProduction.first.mul(dt)
  )

  if (player.ascensionCount.gt(0)) {
    ascensionAchievementCheck(2, 0)
  }

  for (let i = 1; i <= 5; i++) {
    if (
      player.researches[70 + i] > 0.5
      && Decimal.lt(
        player.challengecompletions[i],
        Decimal.min(
          player.highestchallengecompletions[i],
          25 + 5 * player.researches[65 + i] + 925 * player.researches[105]
        )
      )
      && player.coins.gte(
        Decimal.mul(G.challengeBaseRequirements[i - 1], Decimal.add(player.challengecompletions[i], 1).pow(2)).mul(
          [1.25, 1.6, 1.7, 1.45, 2][i - 1]
        ).pow10()
      )
    ) {
      player.challengecompletions[i] = Decimal.add(player.challengecompletions[i], 1)
      challengeachievementcheck(i, true)
      updateChallengeLevel(i)
    }
  }

  const chal = player.currentChallenge.transcension
  const reinchal = player.currentChallenge.reincarnation
  const ascendchal = player.currentChallenge.ascension
  if (chal !== 0) {
    if (
      player.coinsThisTranscension.gte(
        challengeRequirement(chal, player.challengecompletions[chal], chal)
      )
    ) {
      void resetCheck('transcensionChallenge', false)
      G.autoChallengeTimerIncrement = new Decimal(0)
    }
  }
  if (reinchal < 9 && reinchal !== 0) {
    if (
      player.transcendShards.gte(
        challengeRequirement(
          reinchal,
          player.challengecompletions[reinchal],
          reinchal
        )
      )
    ) {
      void resetCheck('reincarnationChallenge', false)
      G.autoChallengeTimerIncrement = new Decimal(0)
    }
  }
  if (reinchal >= 9) {
    if (
      player.coins.gte(
        challengeRequirement(
          reinchal,
          player.challengecompletions[reinchal],
          reinchal
        )
      )
    ) {
      void resetCheck('reincarnationChallenge', false)
      G.autoChallengeTimerIncrement = new Decimal(0)
    }
  }
  if (ascendchal !== 0 && ascendchal < 15) {
    if (
      Decimal.gte(
        player.challengecompletions[10],
        challengeRequirement(
          ascendchal,
          player.challengecompletions[ascendchal],
          ascendchal
        )
      )
    ) {
      void resetCheck('ascensionChallenge', false)
      challengeachievementcheck(ascendchal, true)
    }
  }
  if (ascendchal === 15) {
    if (
      player.coins.gte(
        challengeRequirement(
          ascendchal,
          player.challengecompletions[ascendchal],
          ascendchal
        )
      )
    ) {
      void resetCheck('ascensionChallenge', false)
    }
  }
}

export const updateAntMultipliers = (): void => {
  // Update 2.5.0: Updated to have a base of 10 instead of 1x
  // Update 2.9.0: Updated to give a 5x multiplier no matter what
  // tearonq modification: 20x
  G.globalAntMult = new Decimal(1000)
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(
      getRuneEffective(5)
        .mul(1 + (player.researches[84] / 200))
        .add(Decimal.mul(G.effectiveRuneSpiritPower[5], calculateCorruptionPoints()).div(400)),
      2
    ).div(2500).add(1)
  )
  if (player.upgrades[76] === 1) {
    G.globalAntMult = G.globalAntMult.mul(5)
  }
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(
      new Decimal(1)
        .add(player.upgrades[77] / 250)
        .add(player.researches[96] / 5000)
        .add(Decimal.div(player.cubeUpgrades[65], 250)),
      Decimal.add(player.firstOwnedAnts, player.secondOwnedAnts)
        .add(player.thirdOwnedAnts)
        .add(player.fourthOwnedAnts)
        .add(player.fifthOwnedAnts)
        .add(player.sixthOwnedAnts)
        .add(player.seventhOwnedAnts)
        .add(player.eighthOwnedAnts)
    )
  )
  G.globalAntMult = G.globalAntMult.mul(
    player.maxofferings.add(1).log10().pow(2).mul(0.005).mul(player.upgrades[78]).add(1)
  )
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(
      1.11 + player.researches[101] / 1000 + player.researches[162] / 10000,
      Decimal.add(player.antUpgrades[0]!, G.bonusant1)
    )
  )
  G.globalAntMult = G.globalAntMult.mul(
    antSacrificePointsToMultiplier(player.antSacrificePoints)
  )
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(
      Decimal.max(1, player.researchPoints),
      G.effectiveRuneBlessingPower[5]
    )
  )
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(G.runeSum.div(100).add(1), G.talisman6Power)
  )
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(1.1, CalcECC('reincarnation', player.challengecompletions[9]))
  )
  G.globalAntMult = G.globalAntMult.mul(G.cubeBonusMultiplier[6])
  if (player.achievements[169] === 1) {
    G.globalAntMult = G.globalAntMult.mul(
      Decimal.log(player.antPoints.add(10), 10)
    )
  }
  if (player.achievements[171] === 1) {
    G.globalAntMult = G.globalAntMult.mul(1.16666)
  }
  if (player.achievements[172] === 1) {
    G.globalAntMult = G.globalAntMult.mul(
      Decimal.sub(1, player.reincarnationcounter.div(7200).min(1).neg().pow_base(2)).mul(2).add(1)
    )
  }
  if (player.upgrades[39] === 1) {
    G.globalAntMult = G.globalAntMult.mul(1.6)
  }
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(
      player.ascendShards.add(1).log10().mul(0.1).add(1),
      player.constantUpgrades[5]
    )
  )
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(1e5, CalcECC('ascension', player.challengecompletions[11]))
  )
  if (player.researches[147] > 0) {
    G.globalAntMult = G.globalAntMult.mul(
      player.antPoints.add(10).log10()
    )
  }
  if (player.researches[177] > 0) {
    G.globalAntMult = G.globalAntMult.mul(
      Decimal.pow(
        player.antPoints.add(10).log10(),
        player.researches[177]
      )
    )
  }

  let softcapStr = new Decimal(1e33)
  softcapStr = softcapStr.mul(constantEffects().antSoftcap)

  if (G.globalAntMult.gte(softcapStr)) {
    G.antSoftcapPow = G.globalAntMult
    G.globalAntMult = G.globalAntMult.log(softcapStr).pow(0.85).pow_base(softcapStr)
    G.antSoftcapPow = G.globalAntMult.max(1).log(G.antSoftcapPow)
  }

  if (player.currentChallenge.ascension === 12) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.5)
  }

  if (player.currentChallenge.ascension === 13) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.23)
  }

  if (player.currentChallenge.ascension === 14) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.2)
  }

  if (player.currentChallenge.ascension !== 15) {
    G.globalAntMult = G.globalAntMult.pow(
      Decimal.sub(1, Decimal.min(99, sumContentsNumber(player.usedCorruptions)).mul(0.01))
    )
  } else {
    // C15 used to have 9 corruptions set to 11, which above would provide a power of 0.01. Now it's hardcoded this way.
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.01)
  }

  G.globalAntMult = Decimal.pow(
    G.globalAntMult,
    G.extinctionMultiplier[player.usedCorruptions[7]]
  )
  G.globalAntMult = G.globalAntMult.mul(G.challenge15Rewards.antSpeed)
  // V2.5.0: Moved ant shop upgrade as 'uncorruptable'
  G.globalAntMult = G.globalAntMult.mul(
    Decimal.pow(1.2, player.shopUpgrades.antSpeed)
  )

  if (player.platonicUpgrades[12] > 0) {
    G.globalAntMult = G.globalAntMult.mul(
      Decimal.pow(
        1 + (1 / 100) * player.platonicUpgrades[12],
        sumContentsDecimal(player.highestchallengecompletions)
      )
    )
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[10] > 0
  ) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 1.25)
  }
  if (player.achievements[274] > 0) {
    G.globalAntMult = G.globalAntMult.mul(4.44)
  }

  if (player.usedCorruptions[7] >= 14) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }
  if (player.usedCorruptions[7] >= 15) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }
  if (player.usedCorruptions[7] >= 16) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }

  if (player.octeractUpgrades.octeractStarter.getEffect().bonus) {
    G.globalAntMult = G.globalAntMult.mul(100000)
  }

  if (player.highestSingularityCount >= 30) {
    G.globalAntMult = G.globalAntMult.mul(1000)
  }

  if (player.highestSingularityCount >= 70) {
    G.globalAntMult = G.globalAntMult.mul(1000)
  }

  if (player.highestSingularityCount >= 100) {
    G.globalAntMult = G.globalAntMult.mul(1e6)
  }
}

export const createAnts = (dt: Decimal): void => {
  updateAntMultipliers()
  G.antEightProduce = player.eighthGeneratedAnts
    .add(player.eighthOwnedAnts)
    .mul(player.eighthProduceAnts)
    .mul(G.globalAntMult)
  G.antSevenProduce = player.seventhGeneratedAnts
    .add(player.seventhOwnedAnts)
    .mul(player.seventhProduceAnts)
    .mul(G.globalAntMult)
  G.antSixProduce = player.sixthGeneratedAnts
    .add(player.sixthOwnedAnts)
    .mul(player.sixthProduceAnts)
    .mul(G.globalAntMult)
  G.antFiveProduce = player.fifthGeneratedAnts
    .add(player.fifthOwnedAnts)
    .mul(player.fifthProduceAnts)
    .mul(G.globalAntMult)
  G.antFourProduce = player.fourthGeneratedAnts
    .add(player.fourthOwnedAnts)
    .mul(player.fourthProduceAnts)
    .mul(G.globalAntMult)
  G.antThreeProduce = player.thirdGeneratedAnts
    .add(player.thirdOwnedAnts)
    .mul(player.thirdProduceAnts)
    .mul(G.globalAntMult)
  G.antTwoProduce = player.secondGeneratedAnts
    .add(player.secondOwnedAnts)
    .mul(player.secondProduceAnts)
    .mul(G.globalAntMult)
  G.antOneProduce = player.firstGeneratedAnts
    .add(player.firstOwnedAnts)
    .mul(player.firstProduceAnts)
    .mul(G.globalAntMult)
  player.seventhGeneratedAnts = player.seventhGeneratedAnts.add(
    G.antEightProduce.mul(dt)
  )
  player.sixthGeneratedAnts = player.sixthGeneratedAnts.add(
    G.antSevenProduce.mul(dt)
  )
  player.fifthGeneratedAnts = player.fifthGeneratedAnts.add(
    G.antSixProduce.mul(dt)
  )
  player.fourthGeneratedAnts = player.fourthGeneratedAnts.add(
    G.antFiveProduce.mul(dt)
  )
  player.thirdGeneratedAnts = player.thirdGeneratedAnts.add(
    G.antFourProduce.mul(dt)
  )
  player.secondGeneratedAnts = player.secondGeneratedAnts.add(
    G.antThreeProduce.mul(dt)
  )
  player.firstGeneratedAnts = player.firstGeneratedAnts.add(
    G.antTwoProduce.mul(dt)
  )

  player.antPoints = player.antPoints.add(G.antOneProduce.mul(dt))
}

export const resetCurrency = (): void => {
  let prestigePow = CalcECC('transcend', player.challengecompletions[5]).div(100).add(0.5)
  let transcendPow = new Decimal(0.05)
  const reincarnatePow = new Decimal(0.01)

  // Calculates the conversion exponent for resets (Challenges 5 and 10 reduce the exponent accordingly).
  if (player.currentChallenge.transcension === 5) {
    prestigePow = Decimal.add(player.challengecompletions[5], 1).recip().mul(0.01)
    transcendPow = new Decimal(0.001)
  }
  if (player.currentChallenge.reincarnation === 10) {
    prestigePow = Decimal.add(player.challengecompletions[10], 1).recip().mul(0.0001)
    transcendPow = new Decimal(0.001)
  }

  // Prestige Point Formulae
  G.prestigePointGain = Decimal.floor(Decimal.pow(player.coinsThisPrestige.div(1e12), prestigePow))

  if (
    player.upgrades[16] > 0.5
    && player.currentChallenge.transcension !== 5
    && player.currentChallenge.reincarnation !== 10
  ) {
    let mult = G.acceleratorEffect.root(3)
    if (mult.gte('e1000')) {
      mult = mult.log10().log10().div(3).pow(0.75).mul(3).pow10().pow10()
    }
    G.prestigePointGain = G.prestigePointGain.mul(mult)
  }

  G.prestigePointGain = G.prestigePointGain.pow(G.deflationMultiplier[player.usedCorruptions[6]])

  if (player.usedCorruptions[6] > 10 && player.platonicUpgrades[11] > 0) {
    G.prestigePointGain = G.prestigePointGain.add(G.reincarnationPointGain)
  }

  // Transcend Point Formulae
  G.transcendPointGain = Decimal.floor(Decimal.pow(player.coinsThisTranscension.div(1e100), transcendPow))

  if (
    player.upgrades[44] > 0.5
    && player.currentChallenge.transcension !== 5
    && player.currentChallenge.reincarnation !== 10
  ) {
    G.transcendPointGain = G.transcendPointGain.mul(
      Decimal.min(1e6, Decimal.pow(1.01, player.transcendCount))
    )
  }

  // Reincarnation Point Formulae
  G.reincarnationPointGain = Decimal.floor(Decimal.pow(player.transcendShards.div(1e300), reincarnatePow))

  if (player.currentChallenge.reincarnation !== 0) {
    G.reincarnationPointGain = Decimal.pow(G.reincarnationPointGain, 0.01)
  }
  if (player.achievements[50] === 1) {
    G.reincarnationPointGain = G.reincarnationPointGain.mul(2)
  }
  if (player.upgrades[65] > 0.5) {
    G.reincarnationPointGain = G.reincarnationPointGain.mul(5)
  }
  if (player.currentChallenge.ascension === 12) {
    G.reincarnationPointGain = new Decimal(0)
  }
}

export const resetCheck = async (
  i: resetNames,
  manual = true,
  leaving = false
): Promise<void> => {
  if (i === 'prestige') {
    if (player.coinsThisPrestige.gte(1e16) || G.prestigePointGain.gte(100)) {
      if (manual) {
        void resetConfirmation('prestige')
      } else {
        resetachievementcheck(1)
        reset('prestige')
      }
    }
  }
  if (i === 'transcension') {
    if (
      (player.coinsThisTranscension.gte(1e100)
        || G.transcendPointGain.gte(0.5))
      && player.currentChallenge.transcension === 0
    ) {
      if (manual) {
        void resetConfirmation('transcend')
      }
      if (!manual) {
        resetachievementcheck(2)
        reset('transcension')
      }
    }
  }
  if (
    i === 'transcensionChallenge'
    && player.currentChallenge.transcension !== 0
  ) {
    const q = player.currentChallenge.transcension
    const maxCompletions = getMaxChallenges(q)
    const reqCheck = (comp: Decimal) => player.coinsThisTranscension.gte(challengeRequirement(q, comp, q))
    if (
      reqCheck(player.challengecompletions[q])
      && Decimal.lt(player.challengecompletions[q], maxCompletions)
    ) {
      let maxInc = 1
      if (player.shopUpgrades.instantChallenge > 0) {
        maxInc = 10
      }
      if (player.shopUpgrades.instantChallenge2 > 0) {
        maxInc += player.highestSingularityCount
      }
      if (player.currentChallenge.ascension === 13) {
        maxInc = 1
      }
      let counter = 0
      let comp = player.challengecompletions[q]
      while (counter < maxInc) {
        if (reqCheck(comp) && Decimal.lt(comp, maxCompletions)) {
          comp = Decimal.add(comp, 1)
        }
        counter++
      }
      player.challengecompletions[q] = comp
      challengeDisplay(q, false)
      updateChallengeLevel(q)
    }
    if (
      Decimal.gt(player.challengecompletions[q], player.highestchallengecompletions[q])
    ) {
      while (
        Decimal.gt(player.challengecompletions[q], player.highestchallengecompletions[q])
      ) {
        player.highestchallengecompletions[q] = Decimal.add(player.highestchallengecompletions[q], 1)
        highestChallengeRewards(q, player.highestchallengecompletions[q])
      }
      calculateCubeBlessings()
    }
    challengeachievementcheck(q)
    if (
      !player.retrychallenges
      || manual
      || (player.autoChallengeRunning
        && Decimal)
    ) {
      toggleAutoChallengeModeText('ENTER')
      player.currentChallenge.transcension = 0
      updateChallengeDisplay()
    }
    if (player.shopUpgrades.instantChallenge === 0 || leaving) {
      reset('transcensionChallenge', false, 'leaveChallenge')
      player.transcendCount = player.transcendCount.sub(1)
    }
  }

  if (i === 'reincarnation') {
    if (
      G.reincarnationPointGain.gt(0.5)
      && player.currentChallenge.transcension === 0
      && player.currentChallenge.reincarnation === 0
    ) {
      if (manual) {
        void resetConfirmation('reincarnate')
      }
      if (!manual) {
        resetachievementcheck(3)
        reset('reincarnation')
      }
    }
  }
  if (
    i === 'reincarnationChallenge'
    && player.currentChallenge.reincarnation !== 0
  ) {
    const q = player.currentChallenge.reincarnation
    const maxCompletions = getMaxChallenges(q)
    const reqCheck = (comp: Decimal) => {
      if (q <= 8) {
        return player.transcendShards.gte(challengeRequirement(q, comp, q))
      } else {
        // challenges 9 and 10
        return player.coins.gte(challengeRequirement(q, comp, q))
      }
    }
    if (
      reqCheck(player.challengecompletions[q])
      && Decimal.lt(player.challengecompletions[q], maxCompletions)
    ) {
      let maxInc = 1
      if (player.shopUpgrades.instantChallenge > 0) {
        maxInc = 10
      }
      if (player.shopUpgrades.instantChallenge2 > 0) {
        maxInc += player.highestSingularityCount
      }
      if (player.currentChallenge.ascension === 13) {
        maxInc = 1
      }
      let counter = 0
      let comp = player.challengecompletions[q]
      while (counter < maxInc) {
        if (reqCheck(comp) && Decimal.lt(comp, maxCompletions)) {
          comp = Decimal.add(comp, 1)
        }
        counter++
      }
      player.challengecompletions[q] = comp
      challengeDisplay(q, false)
      updateChallengeLevel(q)
    }
    if (
      Decimal.gt(player.challengecompletions[q], player.highestchallengecompletions[q])
    ) {
      while (
        Decimal.gt(player.challengecompletions[q], player.highestchallengecompletions[q])
      ) {
        player.highestchallengecompletions[q] = Decimal.add(player.highestchallengecompletions[q], 1)
        highestChallengeRewards(q, player.highestchallengecompletions[q])
      }
      calculateHypercubeBlessings()
      calculateTesseractBlessings()
      calculateCubeBlessings()
    }
    challengeachievementcheck(q)
    if (
      !player.retrychallenges
      || manual
      || (player.autoChallengeRunning
        && Decimal)
    ) {
      toggleAutoChallengeModeText('ENTER')
      player.currentChallenge.reincarnation = 0
      if (player.shopUpgrades.instantChallenge > 0) {
        for (let i = 1; i <= 5; i++) {
          player.challengecompletions[i] = player.highestchallengecompletions[i]
        }
      }
      updateChallengeDisplay()
      calculateRuneLevels()
      calculateAnts()
    }
    if (player.shopUpgrades.instantChallenge === 0 || leaving) {
      reset('reincarnationChallenge', false, 'leaveChallenge')
      player.reincarnationCount = player.reincarnationCount.sub(1)
    }
  }

  if (i === 'ascension') {
    if (
      player.achievements[141] > 0
      && (!player.toggles[31] || Decimal.gt(player.challengecompletions[10], 0))
    ) {
      if (manual) {
        void resetConfirmation('ascend')
      }
    }
  }

  if (i === 'ascensionChallenge' && player.currentChallenge.ascension !== 0) {
    let conf = true
    if (manual) {
      if (Decimal.eq(player.challengecompletions[11], 0) || player.toggles[31]) {
        conf = await Confirm(i18next.t('main.exitAscensionChallenge'))
      }
    }
    if (!conf) {
      return
    }
    const a = player.currentChallenge.ascension
    const maxCompletions = getMaxChallenges(a)

    if (a !== 0 && a < 15) {
      if (
        Decimal.gte(
          player.challengecompletions[10],
          challengeRequirement(
            a,
            player.challengecompletions[a],
            a
          )
        )
        && Decimal.lt(player.challengecompletions[a], maxCompletions)
      ) {
        player.challengecompletions[a] = Decimal.add(player.challengecompletions[a], 1)
        updateChallengeLevel(a)
        challengeDisplay(a, false)
      }
      challengeachievementcheck(a, true)
    }
    if (a === 15) {
      const c15SM = challenge15ScoreMultiplier()
      if (
        player.coins.gte(
          challengeRequirement(a, player.challengecompletions[a], a)
        )
        && Decimal.lt(player.challengecompletions[a], maxCompletions)
      ) {
        player.challengecompletions[a] = player.challengecompletions[a].add(1)
        updateChallengeLevel(a)
        challengeDisplay(a, false)
      }
      if (
        (manual || leaving || player.shopUpgrades.challenge15Auto > 0)
        && player.usedCorruptions.slice(2, 10).every((a) => a === 11)
      ) {
        if (
          player.coins.gte(Decimal.pow(10, player.challenge15Exponent.div(c15SM)))
        ) {
          player.challenge15Exponent = player.coins.add(1).log10().mul(c15SM)
          c15RewardUpdate()
        }
      }
    }

    if (Decimal.gt(player.challengecompletions[a], player.highestchallengecompletions[a])) {
      player.highestchallengecompletions[a] = Decimal.add(player.highestchallengecompletions[a], 1)
      player.wowHypercubes.add(1)
      if (Decimal.gte(player.highestchallengecompletions[a], maxCompletions)) {
        leaving = true
      }
    }

    if (!player.retrychallenges || manual || leaving) {
      if (
        !(
          !manual
          && (autoAscensionChallengeSweepUnlock()
            || !player.autoChallengeRunning) // If not autochallenge, don't reset
          && player.autoAscend
          && player.challengecompletions[11].gt(0)
          && player.cubeUpgrades[10].gt(0)
        )
      ) {
        player.currentChallenge.ascension = 0
        updateChallengeDisplay()
      }
    }

    if ((player.shopUpgrades.instantChallenge2 === 0 && a !== 15) || manual) {
      reset('ascensionChallenge', false)
    }
  }

  if (i === 'singularity') {
    if (player.runelevels[6].eq(0)) {
      return Alert(i18next.t('main.noAntiquity'))
    }

    const thankSing = 300

    if (player.insideSingularityChallenge) {
      return Alert(i18next.t('main.insideSingularityChallenge'))
    }

    if (player.singularityCount >= thankSing) {
      return Alert(i18next.t('main.gameBeat'))
    }

    let confirmed = false
    const nextSingularityNumber = player.singularityCount + 1 + getFastForwardTotalMultiplier()

    if (!player.toggles[33] && player.singularityCount > 0) {
      confirmed = await Confirm(
        i18next.t('main.singularityConfirm0', {
          x: format(nextSingularityNumber),
          y: format(calculateGoldenQuarkGain(), 2, true)
        })
      )
    } else {
      await Alert(
        i18next.t('main.singularityMessage1', {
          x: format(player.singularityCount)
        })
      )
      await Alert(i18next.t('main.singularityMessage2'))
      await Alert(i18next.t('main.singularityMessage3'))
      await Alert(
        i18next.t('main.singularityMessage4', {
          x: format(nextSingularityNumber),
          y: format(calculateGoldenQuarkGain(), 2, true),
          z: format(getQuarkBonus())
        })
      )
      await Alert(i18next.t('main.singularityMessage5'))

      confirmed = await Confirm(i18next.t('main.singularityConfirm1'))
      if (confirmed) {
        confirmed = await Confirm(i18next.t('main.singularityConfirm2'))
      }
      if (confirmed) {
        confirmed = await Confirm(i18next.t('main.singularityConfirm3'))
      }
    }

    if (!confirmed) {
      return Alert(i18next.t('main.singularityCancelled'))
    } else {
      await singularity()
      await saveSynergy()
      return Alert(
        i18next.t('main.welcomeToSingularity', {
          x: format(player.singularityCount)
        })
      )
    }
  }
}

export const resetConfirmation = async (i: string): Promise<void> => {
  if (i === 'prestige') {
    if (player.toggles[28]) {
      const r = await Confirm(i18next.t('main.prestigePrompt'))
      if (r) {
        resetachievementcheck(1)
        reset('prestige')
      }
    } else {
      resetachievementcheck(1)
      reset('prestige')
    }
  }
  if (i === 'transcend') {
    if (player.toggles[29]) {
      const z = await Confirm(i18next.t('main.transcendPrompt'))
      if (z) {
        resetachievementcheck(2)
        reset('transcension')
      }
    } else {
      resetachievementcheck(2)
      reset('transcension')
    }
  }
  if (i === 'reincarnate') {
    if (player.currentChallenge.ascension !== 12) {
      if (player.toggles[30]) {
        const z = await Confirm(i18next.t('main.reincarnatePrompt'))
        if (z) {
          resetachievementcheck(3)
          reset('reincarnation')
        }
      } else {
        resetachievementcheck(3)
        reset('reincarnation')
      }
    }
  }
  if (i === 'ascend') {
    const z = !player.toggles[31] || (await Confirm(i18next.t('main.ascendPrompt')))
    if (z) {
      reset('ascension')
    }
  }
}

export const updateEffectiveLevelMult = (): void => {
  G.effectiveLevelMult = new Decimal(1)
  G.effectiveLevelMult = G.effectiveLevelMult.mul(
    CalcECC('ascension', player.challengecompletions[14]).div(2).add(1).mul(player.researches[4] / 10).add(1)
  ) // Research 1x4
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + player.researches[21] / 100) // Research 2x6
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + player.researches[90] / 100) // Research 4x15
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + player.researches[131] / 200) // Research 6x6
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + ((player.researches[161] / 200) * 3) / 5) // Research 7x11
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + ((player.researches[176] / 200) * 2) / 5) // Research 8x1
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + ((player.researches[191] / 200) * 1) / 5) // Research 8x16
  G.effectiveLevelMult = G.effectiveLevelMult.mul(1 + ((player.researches[146] / 200) * 4) / 5) // Research 6x21
  G.effectiveLevelMult = G.effectiveLevelMult.mul(
    player.talismanShards.add(1).log(4).div(100).mul(Decimal.min(1, player.constantUpgrades[9])).add(1)
  )
  G.effectiveLevelMult = G.effectiveLevelMult.mul(G.challenge15Rewards.runeBonus)
}

export const updateAll = (): void => {
  G.uFourteenMulti = new Decimal(1)
  G.uFifteenMulti = new Decimal(1)

  if (player.upgrades[14] > 0.5) {
    G.uFourteenMulti = Decimal.pow(1.15, G.freeAccelerator)
  }
  if (player.upgrades[15] > 0.5) {
    G.uFifteenMulti = Decimal.pow(1.15, G.freeAccelerator)
  }

  if (!player.unlocks.coinone && player.coins.gte(500)) {
    player.unlocks.coinone = true
    revealStuff()
  }
  if (!player.unlocks.cointwo && player.coins.gte(10000)) {
    player.unlocks.cointwo = true
    revealStuff()
  }
  if (!player.unlocks.cointhree && player.coins.gte(100000)) {
    player.unlocks.cointhree = true
    revealStuff()
  }
  if (!player.unlocks.coinfour && player.coins.gte(4e6)) {
    player.unlocks.coinfour = true
    revealStuff()
  }
  if (player.achievements[169] === 0 && player.antPoints.gte(3)) {
    achievementaward(169)
  }
  if (player.achievements[170] === 0 && player.antPoints.gte(1e5)) {
    achievementaward(170)
  }
  if (player.achievements[171] === 0 && player.antPoints.gte(666666666)) {
    achievementaward(171)
  }
  if (player.achievements[172] === 0 && player.antPoints.gte(1e20)) {
    achievementaward(172)
  }
  if (player.achievements[173] === 0 && player.antPoints.gte(1e40)) {
    achievementaward(173)
  }
  if (player.achievements[174] === 0 && player.antPoints.gte('1e500')) {
    achievementaward(174)
  }
  if (player.achievements[175] === 0 && player.antPoints.gte('1e2500')) {
    achievementaward(175)
  }

  if (player.researches[200] >= 1e5 && player.achievements[250] < 1) {
    achievementaward(250)
  }
  if (Decimal.gte(player.cubeUpgrades[50], 1e5) && player.achievements[251] < 1) {
    achievementaward(251)
  }

  // Autobuy "Upgrades" Tab
  autoUpgrades()

  // Autobuy "Building" Tab

  if (
    player.toggles[1]
    && player.upgrades[81] === 1
    && player.coins.gte(player.firstCostCoin)
  ) {
    buyMax(1, 'Coin')
  }
  if (
    player.toggles[2]
    && player.upgrades[82] === 1
    && player.coins.gte(player.secondCostCoin)
  ) {
    buyMax(2, 'Coin')
  }
  if (
    player.toggles[3]
    && player.upgrades[83] === 1
    && player.coins.gte(player.thirdCostCoin)
  ) {
    buyMax(3, 'Coin')
  }
  if (
    player.toggles[4]
    && player.upgrades[84] === 1
    && player.coins.gte(player.fourthCostCoin)
  ) {
    buyMax(4, 'Coin')
  }
  if (
    player.toggles[5]
    && player.upgrades[85] === 1
    && player.coins.gte(player.fifthCostCoin)
  ) {
    buyMax(5, 'Coin')
  }
  if (
    player.toggles[6]
    && player.upgrades[86] === 1
    && player.coins.gte(player.acceleratorCost)
  ) {
    buyMaxAccels()
  }
  if (
    player.toggles[7]
    && player.upgrades[87] === 1
    && player.coins.gte(player.multiplierCost)
  ) {
    buyMaxMuls()
  }
  if (
    player.toggles[8]
    && player.upgrades[88] === 1
    && player.prestigePoints.gte(player.acceleratorBoostCost)
  ) {
    buyMaxBoostAccel()
  }

  // Autobuy "Prestige" Tab

  if (
    player.toggles[10]
    && player.achievements[78] === 1
    && player.prestigePoints.gte(player.firstCostDiamonds)
  ) {
    buyMax(1, 'Diamonds')
  }
  if (
    player.toggles[11]
    && player.achievements[85] === 1
    && player.prestigePoints.gte(player.secondCostDiamonds)
  ) {
    buyMax(2, 'Diamonds')
  }
  if (
    player.toggles[12]
    && player.achievements[92] === 1
    && player.prestigePoints.gte(player.thirdCostDiamonds)
  ) {
    buyMax(3, 'Diamonds')
  }
  if (
    player.toggles[13]
    && player.achievements[99] === 1
    && player.prestigePoints.gte(player.fourthCostDiamonds)
  ) {
    buyMax(4, 'Diamonds')
  }
  if (
    player.toggles[14]
    && player.achievements[106] === 1
    && player.prestigePoints.gte(player.fifthCostDiamonds)
  ) {
    buyMax(5, 'Diamonds')
  }

  updateEffectiveLevelMult() // update before prism rune, fixes c15 bug

  let c = new Decimal(0)
  c = c.add(getRuneEffective(3).div(16).floor())
  if (
    player.upgrades[73] > 0.5
    && player.currentChallenge.reincarnation !== 0
  ) {
    c = c.add(10)
  }

  if (
    player.achievements[79] > 0.5
    && player.prestigeShards.gte(
      Decimal.add(
        G.crystalUpgradesCost[0],
        Decimal.mul(
          G.crystalUpgradeCostIncrement[0],
          Decimal.sub(player.crystalUpgrades[0], c).sub(0.5).pow(2).div(2).floor()
        )
      ).pow10()
    )
  ) {
    buyCrystalUpgrades(1, true)
  }
  if (
    player.achievements[86] > 0.5
    && player.prestigeShards.gte(
      Decimal.add(
        G.crystalUpgradesCost[1],
        Decimal.mul(
          G.crystalUpgradeCostIncrement[1],
          Decimal.sub(player.crystalUpgrades[1], c).sub(0.5).pow(2).div(2).floor()
        )
      ).pow10()
    )
  ) {
    buyCrystalUpgrades(2, true)
  }
  if (
    player.achievements[93] > 0.5
    && player.prestigeShards.gte(
      Decimal.add(
        G.crystalUpgradesCost[2],
        Decimal.mul(
          G.crystalUpgradeCostIncrement[2],
          Decimal.sub(player.crystalUpgrades[2], c).sub(0.5).pow(2).div(2).floor()
        )
      ).pow10()
    )
  ) {
    buyCrystalUpgrades(3, true)
  }
  if (
    player.achievements[100] > 0.5
    && player.prestigeShards.gte(
      Decimal.add(
        G.crystalUpgradesCost[3],
        Decimal.mul(
          G.crystalUpgradeCostIncrement[3],
          Decimal.sub(player.crystalUpgrades[3], c).sub(0.5).pow(2).div(2).floor()
        )
      ).pow10()
    )
  ) {
    buyCrystalUpgrades(4, true)
  }
  if (
    player.achievements[107] > 0.5
    && player.prestigeShards.gte(
      Decimal.add(
        G.crystalUpgradesCost[4],
        Decimal.mul(
          G.crystalUpgradeCostIncrement[4],
          Decimal.sub(player.crystalUpgrades[4], c).sub(0.5).pow(2).div(2).floor()
        )
      ).pow10()
    )
  ) {
    buyCrystalUpgrades(5, true)
  }

  // Autobuy "Transcension" Tab

  if (
    player.toggles[16]
    && player.upgrades[94] === 1
    && player.transcendPoints.gte(player.firstCostMythos)
  ) {
    buyMax(1, 'Mythos')
  }
  if (
    player.toggles[17]
    && player.upgrades[95] === 1
    && player.transcendPoints.gte(player.secondCostMythos)
  ) {
    buyMax(2, 'Mythos')
  }
  if (
    player.toggles[18]
    && player.upgrades[96] === 1
    && player.transcendPoints.gte(player.thirdCostMythos)
  ) {
    buyMax(3, 'Mythos')
  }
  if (
    player.toggles[19]
    && player.upgrades[97] === 1
    && player.transcendPoints.gte(player.fourthCostMythos)
  ) {
    buyMax(4, 'Mythos')
  }
  if (
    player.toggles[20]
    && player.upgrades[98] === 1
    && player.transcendPoints.gte(player.fifthCostMythos)
  ) {
    buyMax(5, 'Mythos')
  }

  // Autobuy "Reincarnation" Tab

  if (
    player.toggles[22]
    && Decimal.eq(player.cubeUpgrades[7], 1)
    && player.reincarnationPoints.gte(player.firstCostParticles)
  ) {
    buyParticleBuilding(1)
  }
  if (
    player.toggles[23]
    && Decimal.eq(player.cubeUpgrades[7], 1)
    && player.reincarnationPoints.gte(player.secondCostParticles)
  ) {
    buyParticleBuilding(2)
  }
  if (
    player.toggles[24]
    && Decimal.eq(player.cubeUpgrades[7], 1)
    && player.reincarnationPoints.gte(player.thirdCostParticles)
  ) {
    buyParticleBuilding(3)
  }
  if (
    player.toggles[25]
    && Decimal.eq(player.cubeUpgrades[7], 1)
    && player.reincarnationPoints.gte(player.fourthCostParticles)
  ) {
    buyParticleBuilding(4)
  }
  if (
    player.toggles[26]
    && Decimal.eq(player.cubeUpgrades[7], 1)
    && player.reincarnationPoints.gte(player.fifthCostParticles)
  ) {
    buyParticleBuilding(5)
  }

  // Autobuy "ascension" tab
  if (player.researches[175] > 0) {
    for (let i = 1; i <= 10; i++) {
      if (player.ascendShards.gte(getConstUpgradeMetadata(i).pop()!)) {
        buyConstantUpgrades(i, true)
      }
    }
  }

  // Autobuy tesseract buildings (Mode: AMOUNT)
  if (
    player.researches[190] > 0
    && player.tesseractAutoBuyerToggle === 1
    && player.resettoggle4 < 2
  ) {
    const ownedBuildings: TesseractBuildings = [null, null, null, null, null]
    for (let i = 1; i <= 5; i++) {
      if (player.autoTesseracts[i]) {
        ownedBuildings[i - 1] = player[`ascendBuilding${i as OneToFive}` as const].owned
      }
    }
    const budget = Decimal.sub(player.wowTesseracts.value, player.tesseractAutoBuyerAmount)
    const buyToBuildings = calculateTessBuildingsInBudget(
      ownedBuildings,
      budget
    )
    // Prioritise buying buildings from highest tier to lowest,
    // in case there are any off-by-ones or floating point errors.
    for (let i = 5; i >= 1; i--) {
      const buyFrom = ownedBuildings[i - 1]
      const buyTo = buyToBuildings[i - 1]
      if (buyFrom !== null && buyTo !== null && buyTo !== buyFrom) {
        buyTesseractBuilding(i as OneToFive, Decimal.sub(buyTo, buyFrom))
      }
    }
  }

  // Talismans
  if (player.researches[130] > 0 || player.researches[135] > 0) {
    const talismansUnlocked = [
      player.achievements[119] > 0,
      player.achievements[126] > 0,
      player.achievements[133] > 0,
      player.achievements[140] > 0,
      player.achievements[147] > 0,
      Decimal.gt(player.antUpgrades[11]!, 0) || player.ascensionCount.gt(0),
      player.shopUpgrades.shopTalisman > 0
    ]
    let upgradedTalisman = false

    // First, we need to enhance all of the talismans. Then, we can fortify all of the talismans.
    // If we were to do this in one loop, the players resources would be drained on individual expensive levels
    // of early talismans before buying important enhances for the later ones. This results in drastically
    // reduced overall gains when talisman resources are scarce.
    if (player.autoEnhanceToggle && player.researches[135] > 0) {
      for (let i = 0; i < talismansUnlocked.length; ++i) {
        if (talismansUnlocked[i] && player.talismanRarity[i] < 6) {
          upgradedTalisman = buyTalismanEnhance(i, true) || upgradedTalisman
        }
      }
    }

    if (player.autoFortifyToggle && player.researches[130] > 0) {
      for (let i = 0; i < talismansUnlocked.length; ++i) {
        const maxTalismanLevel = calculateMaxTalismanLevel(i)
        if (
          talismansUnlocked[i]
          && Decimal.lt(player.talismanLevels[i], maxTalismanLevel)
        ) {
          upgradedTalisman = buyTalismanLevels(i, true) || upgradedTalisman
        }
      }
    }

    // Recalculate talisman-related upgrades and display on success
    if (upgradedTalisman) {
      updateTalismanInventory()
      calculateRuneLevels()
    }
  }

  // Generation
  if (player.upgrades[101] > 0.5) {
    player.fourthGeneratedCoin = player.fourthGeneratedCoin.add(
      player.fifthGeneratedCoin
        .add(player.fifthOwnedCoin)
        .mul(G.uFifteenMulti)
        .mul(G.generatorPower)
    )
  }
  if (player.upgrades[102] > 0.5) {
    player.thirdGeneratedCoin = player.thirdGeneratedCoin.add(
      player.fourthGeneratedCoin
        .add(player.fourthOwnedCoin)
        .mul(G.uFourteenMulti)
        .mul(G.generatorPower)
    )
  }
  if (player.upgrades[103] > 0.5) {
    player.secondGeneratedCoin = player.secondGeneratedCoin.add(
      player.thirdGeneratedCoin
        .add(player.thirdOwnedCoin)
        .mul(G.generatorPower)
    )
  }
  if (player.upgrades[104] > 0.5) {
    player.firstGeneratedCoin = player.firstGeneratedCoin.add(
      player.secondGeneratedCoin
        .add(player.secondOwnedCoin)
        .mul(G.generatorPower)
    )
  }
  if (player.upgrades[105] > 0.5) {
    player.fifthGeneratedCoin = player.fifthGeneratedCoin.add(
      player.firstOwnedCoin
    )
  }
  let p = 1
  p += (1 / 100)
    * (player.achievements[71]
      + player.achievements[72]
      + player.achievements[73]
      + player.achievements[74]
      + player.achievements[75]
      + player.achievements[76]
      + player.achievements[77])

  let a = 0
  if (player.upgrades[106] > 0.5) {
    a += 0.1
  }
  if (player.upgrades[107] > 0.5) {
    a += 0.15
  }
  if (player.upgrades[108] > 0.5) {
    a += 0.25
  }
  if (player.upgrades[109] > 0.5) {
    a += 0.25
  }
  if (player.upgrades[110] > 0.5) {
    a += 0.25
  }
  a *= p

  let b = 0
  if (player.upgrades[111] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[112] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[113] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[114] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[115] > 0.5) {
    b += 0.08
  }
  b *= p

  c = new Decimal(0)
  if (player.upgrades[116] > 0.5) {
    c = c.add(0.05)
  }
  if (player.upgrades[117] > 0.5) {
    c = c.add(0.05)
  }
  if (player.upgrades[118] > 0.5) {
    c = c.add(0.05)
  }
  if (player.upgrades[119] > 0.5) {
    c = c.add(0.05)
  }
  if (player.upgrades[120] > 0.5) {
    c = c.add(0.05)
  }
  c = c.mul(p)

  if (a !== 0) {
    player.fifthGeneratedCoin = player.fifthGeneratedCoin.add(
      Decimal.pow(
        player.firstGeneratedDiamonds.add(player.firstOwnedDiamonds).add(1),
        a
      )
    )
  }
  if (b !== 0) {
    player.fifthGeneratedDiamonds = player.fifthGeneratedDiamonds.add(
      Decimal.pow(
        player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1),
        b
      )
    )
  }
  if (c.neq(0)) {
    player.fifthGeneratedMythos = player.fifthGeneratedMythos.add(
      Decimal.pow(
        player.firstGeneratedParticles.add(player.firstOwnedParticles).add(1),
        c
      )
    )
  }

  if (Decimal.gt(player.runeshards, player.maxofferings)) {
    player.maxofferings = player.runeshards
  }
  if (Decimal.gt(player.researchPoints, player.maxobtainium)) {
    player.maxobtainium = player.researchPoints
  }

  if (Decimal.isNaN(player.runeshards)) {
    player.runeshards = new Decimal(0)
  }

  if (Decimal.isNaN(player.researchPoints)) {
    player.researchPoints = new Decimal(0)
  }

  G.optimalOfferingTimer = new Decimal(600)
    .add(30 * player.researches[85])
    .add(G.rune5level.mul(0.4))
    .add(120 * player.shopUpgrades.offeringEX)
  G.optimalObtainiumTimer = Decimal.add(3600, 120 * player.shopUpgrades.obtainiumEX)
  autoBuyAnts()

  if (
    player.autoAscend
    && Decimal.gt(player.challengecompletions[11], 0)
    && Decimal.gt(player.cubeUpgrades[10], 0)
    && player.currentChallenge.reincarnation !== 10
  ) {
    let ascension = false
    if (
      player.autoAscendMode === 'c10Completions'
      && player.challengecompletions[10].gte(Math.max(1, player.autoAscendThreshold))
    ) {
      ascension = true
    }
    if (
      player.autoAscendMode === 'realAscensionTime'
      && player.ascensionCounterRealReal.gte(Math.max(0.1, player.autoAscendThreshold))
    ) {
      ascension = true
    }
    if (ascension && Decimal.gt(player.challengecompletions[10], 0)) {
      // Auto Ascension and Auto Challenge Sweep enables rotation of the Ascension Challenge
      if (
        autoAscensionChallengeSweepUnlock()
        && player.currentChallenge.ascension !== 0
        && player.retrychallenges
        && player.researches[150] === 1
        && player.autoChallengeRunning
      ) {
        let nextChallenge = getNextChallenge(
          player.currentChallenge.ascension + 1,
          false,
          11,
          15
        )
        if (
          nextChallenge <= 15
          && player.currentChallenge.ascension !== nextChallenge
        ) {
          void resetCheck('ascensionChallenge', false, true)
          player.currentChallenge.ascension = nextChallenge
          reset('ascensionChallenge', false)
        } else {
          nextChallenge = getNextChallenge(
            player.currentChallenge.ascension + 1,
            true,
            11,
            15
          )
          void resetCheck('ascensionChallenge', false, true)
          player.currentChallenge.ascension = nextChallenge <= 15 ? nextChallenge : 0
          reset('ascensionChallenge', false)
        }
      } else {
        if (player.currentChallenge.ascension !== 0) {
          void resetCheck('ascensionChallenge', false, true)
          reset('ascensionChallenge', false)
        } else {
          reset('ascension', false)
        }
      }
    }
  }

  let metaData = null
  if (player.researches[175] > 0) {
    for (let i = 1; i <= 10; i++) {
      metaData = getConstUpgradeMetadata(i)
      if (player.ascendShards.gte(metaData[1])) {
        buyConstantUpgrades(i, true)
      }
    }
  }

  const reductionValue = getReductionValue()
  if (Decimal.neq(reductionValue, G.prevReductionValue)) {
    G.prevReductionValue = reductionValue
    const resources = ['Coin', 'Diamonds', 'Mythos'] as const

    for (let res = 0; res < resources.length; ++res) {
      const resource = resources[res]
      for (let ord = 0; ord < 5; ++ord) {
        const num = G.ordinals[ord as ZeroToFour]
        player[`${num}Cost${resource}` as const] = getCost(
          (ord + 1) as OneToFive,
          resource,
          player[`${num}Owned${resource}` as const].add(1)
        )
      }
    }

    for (let i = 0; i <= 4; i++) {
      const particleOriginalCost = [1, 1e2, 1e4, 1e8, 1e16]
      const num = G.ordinals[i as ZeroToFour]
      const buyTo = player[`${num}OwnedParticles` as const].add(1)
      player[`${num}CostParticles` as const] = getParticleCostq(buyTo, particleOriginalCost[i])
    }
  }

  // Challenge 15 autoupdate
  if (
    player.shopUpgrades.challenge15Auto > 0
    && player.currentChallenge.ascension === 15
    && player.usedCorruptions.slice(2, 10).every((a) => a === 11)
  ) {
    const c15SM = challenge15ScoreMultiplier()
    if (player.coins.gte(Decimal.pow(10, player.challenge15Exponent.div(c15SM)))) {
      player.challenge15Exponent = player.coins.add(1).log10().mul(c15SM)
      c15RewardUpdate()
    }
  }
}

export const fastUpdates = (): void => {
  updateAll()
  htmlInserts()
}

export const slowUpdates = (): void => {
  buttoncolorchange()
  buildingAchievementCheck()
}

export const constantIntervals = (): void => {
  setInterval(saveSynergy, 5000)
  setInterval(slowUpdates, 200)
  setInterval(fastUpdates, 50)

  if (!G.timeWarp) {
    exitOffline()
  }
}

let lastUpdate = 0

export const createTimer = (): void => {
  lastUpdate = performance.now()
  setInterval(tick, 5)
}

const dt = 5
const filterStrength = 20
let deltaMean = 0

const loadingDate = new Date()
const loadingBasePerfTick = performance.now()

// performance.now() doesn't always reset on reload, so we capture a "base value"
// to keep things stable
// The returned time is pinned to when the page itself was loaded to remain
// resilient against changed system clocks
export const getTimePinnedToLoadDate = () => {
  return loadingDate.getTime() + (performance.now() - loadingBasePerfTick)
}

const tick = () => {
  const now = performance.now()
  let delta = now - lastUpdate
  // compute pseudo-average delta cf. https://stackoverflow.com/a/5111475/343834
  deltaMean += (delta - deltaMean) / filterStrength
  let dtEffective: number
  while (delta > 5) {
    // tack will compute dtEffective milliseconds of game time
    dtEffective = dt
    // If the mean lag (deltaMean) is more than a whole frame (16ms), compensate by computing deltaMean - dt ms, up to 1 hour
    dtEffective += deltaMean > 16 ? Math.min(3600 * 1000, deltaMean - dt) : 0
    // compute at max delta ms to avoid negative delta
    dtEffective = Math.min(delta, dtEffective)
    // run tack and record timings
    tack(Decimal.div(dtEffective, 1000))
    lastUpdate += dtEffective
    delta -= dtEffective
  }
}

const tack = (dt: Decimal) => {
  if (Decimal.isNaN(player.coins)) {
    throw new Error('the save is fucked')
  }
  if (!G.timeWarp) {
    // Adds Resources (coins, ants, etc)
    const timeMult = calculateTimeAcceleration().mult
    resourceGain(Decimal.mul(dt, timeMult))
    // Adds time (in milliseconds) to all reset functions, and quarks timer.
    addTimers('prestige', dt)
    addTimers('transcension', dt)
    addTimers('reincarnation', dt)
    addTimers('ascension', dt)
    addTimers('quarks', dt)
    addTimers('goldenQuarks', dt)
    addTimers('octeracts', dt)
    addTimers('singularity', dt)
    addTimers('autoPotion', dt)
    addTimers('ambrosia', dt)

    // Triggers automatic rune sacrifice (adds milliseconds to payload timer)
    if (player.shopUpgrades.offeringAuto > 0 && player.autoSacrificeToggle) {
      automaticTools('runeSacrifice', dt)
    }

    // Triggers automatic ant sacrifice (adds milliseonds to payload timers)
    if (player.achievements[173] === 1) {
      automaticTools('antSacrifice', dt)
    }

    /*Triggers automatic obtainium gain if research [2x11] is unlocked,
        Otherwise it just calculates obtainium multiplier values. */
    if (player.researches[61] === 1) {
      automaticTools('addObtainium', dt)
    } else {
      calculateObtainium()
    }

    // Automatically tries and buys researches lol
    if (
      player.autoResearchToggle
      && player.autoResearch > 0
      && player.autoResearch <= maxRoombaResearchIndex(player)
      && (autoResearchEnabled() || player.autoResearchMode === 'manual')
    ) {
      // buyResearch() probably shouldn't even be called if player.autoResearch exceeds the highest unlocked research
      let counter = 0
      const maxCount = Decimal.add(player.challengecompletions[14], 1)
      while (Decimal.lt(counter, maxCount)) {
        if (player.autoResearch > 0) {
          const linGrowth = player.autoResearch === 200 ? 0.01 : 0
          if (!buyResearch(player.autoResearch, true, linGrowth)) {
            break
          }
        } else {
          break
        }
        counter++
      }
    }
  }

  // Adds an offering every 2 seconds
  if (Decimal.gt(player.highestchallengecompletions[3], 0)) {
    automaticTools('addOfferings', dt.div(2))
  }

  // Adds an offering every 1/(cube upgrade 1x2) seconds. It shares a timer with the one above.
  if (Decimal.gt(player.cubeUpgrades[2], 0)) {
    automaticTools('addOfferings', Decimal.mul(dt, player.cubeUpgrades[2]))
  }

  runChallengeSweep(dt)

  // Check for automatic resets
  // Auto Prestige. === 1 indicates amount, === 2 indicates time.
  if (player.resettoggle1 === 1 || player.resettoggle1 === 0) {
    if (
      player.toggles[15]
      && player.achievements[43] === 1
      && G.prestigePointGain.gte(
        player.prestigePoints.mul(Decimal.pow(10, player.prestigeamount))
      )
      && player.coinsThisPrestige.gte(1e16)
    ) {
      resetachievementcheck(1)
      reset('prestige', true)
    }
  }
  if (player.resettoggle1 === 2) {
    G.autoResetTimers.prestige = G.autoResetTimers.prestige.add(dt)
    const time = Decimal.max(0.01, player.prestigeamount)
    if (
      player.toggles[15]
      && player.achievements[43] === 1
      && G.autoResetTimers.prestige.gte(time)
      && player.coinsThisPrestige.gte(1e16)
    ) {
      resetachievementcheck(1)
      reset('prestige', true)
    }
  }

  if (player.resettoggle2 === 1 || player.resettoggle2 === 0) {
    if (
      player.toggles[21]
      && player.upgrades[89] === 1
      && G.transcendPointGain.gte(
        player.transcendPoints.mul(Decimal.pow(10, player.transcendamount))
      )
      && player.coinsThisTranscension.gte(1e100)
      && player.currentChallenge.transcension === 0
    ) {
      resetachievementcheck(2)
      reset('transcension', true)
    }
  }
  if (player.resettoggle2 === 2) {
    G.autoResetTimers.transcension = G.autoResetTimers.transcension.add(dt)
    const time = Decimal.max(0.01, player.transcendamount)
    if (
      player.toggles[21]
      && player.upgrades[89] === 1
      && G.autoResetTimers.transcension.gte(time)
      && player.coinsThisTranscension.gte(1e100)
      && player.currentChallenge.transcension === 0
    ) {
      resetachievementcheck(2)
      reset('transcension', true)
    }
  }

  if (player.currentChallenge.ascension !== 12) {
    G.autoResetTimers.reincarnation = G.autoResetTimers.reincarnation.add(dt)
    if (player.resettoggle3 === 2) {
      const time = Decimal.max(0.01, player.reincarnationamount)
      if (
        player.toggles[27]
        && player.researches[46] > 0.5
        && player.transcendShards.gte(1e300)
        && G.autoResetTimers.reincarnation.gte(time)
        && player.currentChallenge.transcension === 0
        && player.currentChallenge.reincarnation === 0
      ) {
        resetachievementcheck(3)
        reset('reincarnation', true)
      }
    }
    if (player.resettoggle3 === 1 || player.resettoggle3 === 0) {
      if (
        player.toggles[27]
        && player.researches[46] > 0.5
        && G.reincarnationPointGain.gte(
          player.reincarnationPoints
            .add(1)
            .mul(Decimal.pow(10, player.reincarnationamount))
        )
        && player.transcendShards.gte(1e300)
        && player.currentChallenge.transcension === 0
        && player.currentChallenge.reincarnation === 0
      ) {
        resetachievementcheck(3)
        reset('reincarnation', true)
      }
    }
  }
  calculateOfferings('reincarnation')
}

export const synergismHotkeys = (event: KeyboardEvent, key: string): void => {
  if (!player.toggles[40]) {
    return
  }

  const types = {
    coin: 'Coin',
    diamond: 'Diamonds',
    mythos: 'Mythos',
    particle: 'Particles',
    tesseract: 'Tesseracts',
    golden: 'Golden Quarks'
  } as const

  const type = types[G.buildingSubTab]

  if (event.shiftKey) {
    let num = Number(key) - 1
    if (key === 'BACKQUOTE') {
      num = -1
    }
    if (Decimal.gt(player.challengecompletions[11], 0) && !isNaN(num)) {
      if (num >= 0 && num < player.corruptionLoadoutNames.length) {
        if (player.toggles[41]) {
          void Notification(
            i18next.t('main.corruptionLoadoutApplied', {
              x: num + 1,
              y: player.corruptionLoadoutNames[num]
            }),
            5000
          )
        }
        corruptionLoadoutSaveLoad(false, num + 1)
      } else {
        if (player.toggles[41]) {
          void Notification(i18next.t('main.allCorruptionsZero'), 5000)
        }
        corruptionLoadoutSaveLoad(false, 0)
      }
      event.preventDefault()
    }
    return
  }

  switch (key) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5': {
      const num = Number(key) as OneToFive

      if (G.currentTab === Tabs.Buildings) {
        if (type === 'Particles') {
          buyParticleBuilding(num)
        } else if (type === 'Tesseracts') {
          buyTesseractBuilding(num)
        } else if (type === 'Golden Quarks') {
          buyGoldenQuarkBuilding(num)
        } else {
          buyMax(num, type)
        }
      }
      if (G.currentTab === Tabs.Upgrades) {
        categoryUpgrades(num, false)
      }
      if (G.currentTab === Tabs.Runes) {
        if (G.runescreen === 'runes') {
          redeemShards(num)
        }
        if (G.runescreen === 'blessings') {
          buyRuneBonusLevels('Blessings', num)
        }
        if (G.runescreen === 'spirits') {
          buyRuneBonusLevels('Spirits', num)
        }
      }
      if (G.currentTab === Tabs.Challenges) {
        toggleChallenges(num)
        challengeDisplay(num)
      }
      break
    }

    case '6':
      if (G.currentTab === Tabs.Upgrades) {
        categoryUpgrades(6, false)
      }
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(1)
      }
      if (G.currentTab === Tabs.Challenges && player.reincarnationCount.gt(0)) {
        toggleChallenges(6)
        challengeDisplay(6)
      }
      break
    case '7':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(2)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[113] === 1) {
        toggleChallenges(7)
        challengeDisplay(7)
      }
      break
    case '8':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(3)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[120] === 1) {
        toggleChallenges(8)
        challengeDisplay(8)
      }
      break
    case '9':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(4)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[127] === 1) {
        toggleChallenges(9)
        challengeDisplay(9)
      }
      break
    case '0':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(5)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[134] === 1) {
        toggleChallenges(10)
        challengeDisplay(10)
      }
      break
  }
}

export const showExitOffline = () => {
  const el = DOMCacheGetOrSet('exitOffline')
  el.style.visibility = 'visible'
  setTimeout(() => el.focus(), 100)
}

/**
 * Reloads shit.
 * @param reset if this param is passed, offline progression will not be calculated.
 */
export const reloadShit = async (reset = false) => {
  clearTimers()

  // Shows a reset button when page loading seems to stop or cause an error
  const preloadDeleteGame = setTimeout(
    () => (DOMCacheGetOrSet('preloadDeleteGame').style.display = 'block'),
    10000
  )

  disableHotkeys()

  // Wait a tick to continue. This is a (likely futile) attempt to see if this solves save corrupting.
  // This ensures all queued tasks are executed before continuing on.
  await new Promise((res) => {
    setTimeout(res, 0)
  })

  const save = (await localforage.getItem<Blob>('Synergysave2'))
    ?? localStorage.getItem('Synergysave2')

  const saveObject = typeof save === 'string' ? save : await save?.text()

  if (saveObject) {
    const dec = LZString.decompressFromBase64(saveObject)
    const isLZString = dec !== ''

    if (isLZString) {
      if (!dec) {
        return Alert(i18next.t('save.loadFailed'))
      }

      const saveString = btoa(dec)

      if (saveString === null) {
        return Alert(i18next.t('save.loadFailed'))
      }

      localStorage.clear()
      const blob = new Blob([saveString], { type: 'text/plain' })
      localStorage.setItem('Synergysave2', saveString)
      await localforage.setItem<Blob>('Synergysave2', blob)
      await Alert(i18next.t('main.transferredFromLZ'))
    }

    await loadSynergy()
  }

  if (!reset) {
    await calculateOffline()
  } else {
    player.worlds.reset()
    // saving is disabled during a singularity event to prevent bug
    // early return here if the save fails can keep game state from properly resetting after a singularity
    if (saveCheck.canSave) {
      const saved = await saveSynergy()
      if (!saved) {
        return
      }
    }
  }

  toggleTheme(true)
  settingAnnotation()
  toggleIconSet()
  toggleauto()
  htmlInserts()
  createTimer()

  // Reset Displays
  if (!playerNeedsReminderToExport()) {
    changeTab(Tabs.Buildings)
  } else {
    changeTab(Tabs.Settings)

    void Alert(i18next.t('general.exportYourGame'))
  }

  changeSubTab(Tabs.Buildings, { page: 0 })
  changeSubTab(Tabs.Runes, { page: 0 }) // Set 'runes' subtab back to 'runes' tab
  changeSubTab(Tabs.Challenges, { page: 0 }) // Set 'challenges' subtab back to 'normal' tab
  changeSubTab(Tabs.WowCubes, { page: 0 }) // Set 'cube tribues' subtab back to 'cubes' tab
  changeSubTab(Tabs.Corruption, { page: 0 }) // set 'corruption main'
  changeSubTab(Tabs.Singularity, { page: 0 }) // set 'singularity main'
  changeSubTab(Tabs.Settings, { page: 0 }) // set 'statistics main'

  dailyResetCheck()
  setInterval(dailyResetCheck, 30000)

  constantIntervals()
  changeTabColor()

  eventCheck()
    .catch(() => {})
    .finally(() => {
      setInterval(
        () =>
          eventCheck().catch((error: Error) => {
            console.error(error)
          }),
        15_000
      )
    })
  showExitOffline()
  clearTimeout(preloadDeleteGame)

  setInterval(cacheReinitialize, 15000)

  if (localStorage.getItem('pleaseStar') === null) {
    void Alert(i18next.t('main.starRepo'))
    localStorage.setItem('pleaseStar', '')
  }

  // All versions of Chrome and Firefox supported by the game have this API,
  // but not all versions of Edge and Safari do.
  if (
    typeof navigator.storage?.persist === 'function'
    && typeof navigator.storage?.persisted === 'function'
  ) {
    const persistent = await navigator.storage.persisted()

    if (!persistent) {
      const isPersistentNow = await navigator.storage.persist()

      if (isPersistentNow) {
        void Alert(i18next.t('main.dataPersistent'))
      }
    } else {
      console.log(`Storage is persistent! (persistent = ${persistent})`)
    }
  }

  const saveType = DOMCacheGetOrSet('saveType') as HTMLInputElement
  saveType.checked = localStorage.getItem('copyToClipboard') !== null
}

function playerNeedsReminderToExport () {
  const day = 1000 * 60 * 60 * 24

  return Date.now() - player.lastExportedSave > day * 3
}

window.addEventListener('load', async () => {
  await i18nInit()

  const ver = DOMCacheGetOrSet('versionnumber')
  const addZero = (n: number) => `${n}`.padStart(2, '0')
  if (ver instanceof HTMLElement) {
    const textUpdate = !isNaN(lastUpdated.getTime())
      ? ` [Last Update: ${addZero(lastUpdated.getHours())}:${
        addZero(
          lastUpdated.getMinutes()
        )
      } UTC ${addZero(lastUpdated.getDate())}-${
        lastUpdated.toLocaleString(
          'en-us',
          { month: 'short' }
        )
      }-${lastUpdated.getFullYear()}].`
      : ''
    ver.textContent = `You're ${testing ? 'testing' : 'playing'} v${version} - The Alternate Reality${textUpdate} ${
      testing ? i18next.t('testing.saveInLive') : ''
    }`
  }
  document.title = `Synergism v${version}`

  generateEventHandlers()

  void reloadShit()

  corruptionButtonsAdd()
  corruptionLoadoutTableCreate()

  handleLogin().catch(console.error)
})

window.addEventListener('unload', () => {
  // This fixes a bug in Chrome (who would have guessed?) that
  // wouldn't properly load elements if the user scrolled down
  // and reloaded a page. Why is this a bug, Chrome? Why would
  // a page that is reloaded be affected by what the user did
  // beforehand? How does anyone use this buggy browser???????
  window.scrollTo(0, 0)
})
