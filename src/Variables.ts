import Decimal from 'break_eternity.js'
import { Tabs } from './Tabs'
import type { GlobalVariables } from './types/Synergism'

export enum Upgrade {
  coin = 'coins',
  prestige = 'prestigePoints',
  transcend = 'transcendPoints',
  reincarnation = 'reincarnationPoints'
}

export const Globals: GlobalVariables = {
  runediv: [1.5, 2, 3, 5, 8, 1, 1],
  runeexpbase: [1, 4, 9, 16, 1000, 1e75, 1e256],
  runeMaxLvl: new Decimal(40000),

  // this shows the logarithm of costs. ex: upgrade one will cost 1e+6 coins, upgrade 2 1e+7, etc.
  // dprint-ignore
  upgradeCosts: [
    0, 6, 7, 8, 10, 12, 20, 25, 30, 35, 45, 55, 75, 110, 150, 200, 250, 500, 750, 1000, 1500,
    2, 3, 4, 5, 6, 7, 10, 13, 20, 30, 150, 400, 800, 1600, 3200, 10000, 20000, 50000, 100000, 200000,
    1, 2, 3, 5, 6, 7, 42, 65, 87, 150, 300, 500, 1000, 1500, 2000, 3000, 6000, 12000, 25000, 75000,
    0, 1, 2, 2, 3, 5, 6, 10, 15, 22, 30, 37, 45, 52, 60, 1900, 2500, 3000, 7482, 21397,
    3, 6, 9, 12, 15, 20, 30, 6, 8, 8, 10, 13, 60, 1, 2, 4, 8, 16, 25, 40,
    12, 16, 20, 30, 50, 500, 1250, 5000, 25000, 125000, 1500, 7500, 30000, 150000, 1000000, 250, 1000, 5000, 25000, 125000,
    1e3, 1e6, 1e9, 1e12, 1e15
  ],

  // Mega list of Variables to be used elsewhere
  crystalUpgradesCost: [6, 15, 20, 40, 100, 200, 500, 1000],
  crystalUpgradeCostIncrement: [8, 15, 20, 40, 100, 200, 500, 1000],
  // dprint-ignore
  researchBaseCosts: [
    1e200,
    1, 1, 1, 1, 1,
    1, 1e2, 1e4, 1e6, 1e8,
    2, 2e2, 2e4, 2e6, 2e8,
    4e4, 4e8, 10, 1e5, 1e9,
    100, 100, 1e4, 2e3, 2e5,
    40, 200, 50, 5000, 20000000,
    777, 7777, 50000, 500000, 5000000,
    2e3, 2e6, 2e9, 1e5, 1e9,
    1, 1, 5, 25, 125,
    2, 5, 320, 1280, 2.5e9,
    10, 2e3, 4e5, 8e7, 2e9,
    5, 400, 1e4, 3e6, 9e8,
    100, 2500, 100, 2000, 2e5,
    1, 20, 3e3, 4e5, 5e7,
    10, 40, 160, 1000, 10000,
    4e9, 7e9, 1e10, 1.2e10, 1.5e10,
    1e12, 1e13, 3e12, 2e13, 2e13,
    2e14, 6e14, 2e15, 6e15, 2e16,
    1e16, 2e16, 2e17, 4e17, 1e18,
    1e13, 1e14, 1e15, 7.777e18, 7.777e20,
    1e16, 3e16, 1e17, 3e17, 1e20,
    1e18, 3e18, 1e19, 3e19, 1e20,
    1e20, 2e20, 4e20, 8e20, 1e21,
    2e21, 4e21, 8e21, 2e22, 4e22,
    3.2e21, 2e23, 4e23, 1e21, 7.777e32,
    5e8, 5e12, 5e16, 5e20, 5e24, /*ascension tier */
    1e25, 2e25, 4e25, 8e25, 1e26,
    4e26, 8e26, 1e27, 2e27, 1e28,
    5e9, 5e15, 5e21, 5e27, 1e28, /*challenge 11 tier */
    1e29, 2e29, 4e29, 8e29, 1e27,
    2e30, 4e30, 8e30, 1e31, 2e31,
    5e31, 1e32, 2e32, 4e32, 8e32, /*challenge 12 tier */
    1e33, 2e33, 4e33, 8e33, 1e34,
    3e34, 1e35, 3e35, 6e35, 1e36,
    3e36, 1e37, 3e37, 1e38, 3e38, /*challenge 13 tier */
    1e39, 3e39, 1e40, 3e40, 1e50,
    3e41, 1e42, 3e42, 6e42, 1e43,
    3e43, 1e44, 3e44, 1e45, 3e45, /*challenge 14 tier */
    2e46, 6e46, 2e47, 6e47, 1e64,
    6e48, 2e49, 1e50, 1e51, 4e56
  ],

  // dprint-ignore
  researchMaxLevels: [
    0, 1, 1, 1, 1, 1,
    10, 10, 10, 10, 10,
    10, 10, 10, 10, 10,
    10, 10, 1, 1, 1,
    25, 25, 25, 20, 20,
    10, 10, 10, 10, 10,
    12, 12, 10, 10, 10,
    10, 10, 10, 1, 1,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    10, 10, 10, 10, 10,
    20, 20, 20, 20, 20,
    1, 5, 4, 5, 5,
    10, 10, 10, 10, 10,
    1, 1, 1, 1, 1,
    10, 50, 50, 50, 50,
    10, 1, 20, 20, 20,
    20, 20, 20, 20, 10,
    20, 20, 20, 20, 1,
    20, 5, 5, 3, 2,
    10, 10, 10, 10, 1,
    10, 10, 20, 25, 25,
    50, 50, 50, 50, 100,
    10, 10, 10, 100, 100,
    25, 25, 25, 1, 5,
    10, 10, 10, 10, 1,
    10, 10, 10, 1, 1,
    25, 25, 25, 15, 1,
    10, 10, 10, 10, 1,
    10, 1, 6, 10, 1,
    25, 25, 1, 15, 1,
    10, 10, 10, 1, 1,
    10, 10, 10, 10, 1,
    25, 25, 25, 15, 1,
    10, 10, 10, 1, 1,
    10, 3, 6, 10, 5,
    25, 25, 1, 15, 1,
    20, 20, 20, 1, 1,
    20, 1, 50, 50, 10,
    25, 25, 25, 15, 100000
  ],

  ticker: 0,

  costDivisor: new Decimal(1),

  freeAccelerator: new Decimal(0),
  totalAccelerator: new Decimal(0),
  freeAcceleratorBoost: new Decimal(0),
  totalAcceleratorBoost: new Decimal(0),
  acceleratorPower: new Decimal(1.1),
  acceleratorEffect: new Decimal(1),
  acceleratorEffectDisplay: new Decimal(1),
  generatorPower: new Decimal(1),

  freeMultiplier: new Decimal(0),
  totalMultiplier: new Decimal(0),
  multiplierPower: new Decimal(2),
  multiplierEffect: new Decimal(1),
  challengeOneLog: new Decimal(3),
  freeMultiplierBoost: new Decimal(0),
  totalMultiplierBoost: new Decimal(0),

  globalCoinMultiplier: new Decimal(1),
  totalCoinOwned: new Decimal(0),
  prestigeMultiplier: new Decimal(1),
  buildingPower: new Decimal(1),
  reincarnationMultiplier: new Decimal(1),

  coinOneMulti: new Decimal(1),
  coinTwoMulti: new Decimal(1),
  coinThreeMulti: new Decimal(1),
  coinFourMulti: new Decimal(1),
  coinFiveMulti: new Decimal(1),

  globalCrystalMultiplier: new Decimal(1),
  globalMythosMultiplier: new Decimal(0.01),
  grandmasterMultiplier: new Decimal(1),

  atomsMultiplier: new Decimal(1),

  mythosBuildingPower: new Decimal(1),
  challengeThreeMultiplier: new Decimal(1),
  totalMythosOwned: new Decimal(0),

  prestigePointGain: new Decimal(0),
  challengeFivePower: new Decimal(1/3),

  transcendPointGain: new Decimal(0),
  reincarnationPointGain: new Decimal(0),

  produceFirst: new Decimal(0),
  produceSecond: new Decimal(0),
  produceThird: new Decimal(0),
  produceFourth: new Decimal(0),
  produceFifth: new Decimal(0),
  produceTotal: new Decimal(0),
  coinProduceTrue: new Decimal(0),

  produceFirstDiamonds: new Decimal(0),
  produceSecondDiamonds: new Decimal(0),
  produceThirdDiamonds: new Decimal(0),
  produceFourthDiamonds: new Decimal(0),
  produceFifthDiamonds: new Decimal(0),
  produceDiamonds: new Decimal(0),

  produceFirstMythos: new Decimal(0),
  produceSecondMythos: new Decimal(0),
  produceThirdMythos: new Decimal(0),
  produceFourthMythos: new Decimal(0),
  produceFifthMythos: new Decimal(0),
  produceMythos: new Decimal(0),

  produceFirstParticles: new Decimal(0),
  produceSecondParticles: new Decimal(0),
  produceThirdParticles: new Decimal(0),
  produceFourthParticles: new Decimal(0),
  produceFifthParticles: new Decimal(0),
  produceParticles: new Decimal(0),

  producePerSecond: new Decimal(0),
  producePerSecondDiamonds: new Decimal(0),
  producePerSecondMythos: new Decimal(0),
  producePerSecondParticles: new Decimal(0),

  uFourteenMulti: new Decimal(1),
  uFifteenMulti: new Decimal(1),
  tuSevenMulti: 1,
  currentTab: Tabs.Buildings,

  researchfiller1: 'Hover over the grid to get details about researches!',
  researchfiller2: 'Level: ',

  // dprint-ignore
  ordinals: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'] as const,
  // dprint-ignore
  cardinals: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo', 'twentythree', 'twentyfour', 'twentyfive', 'twentysix', 'twentyseven', 'twentyeight', 'twentynine', 'thirty', 'thirtyone', 'thirtytwo', 'thirtythree', 'thirtyfour'],

  challengeBaseRequirements: [10, 20, 60, 100, 200, 125, 500, 7500, 2.0e8, 3.5e9],

  prestigeamount: 1,
  taxdivisor: new Decimal(1),
  taxdivisorcheck: new Decimal(1),
  runemultiplierincrease: {
    one: 1,
    two: 1,
    three: 1,
    four: 1,
    five: 1
  },

  mythosupgrade13: new Decimal(1),
  mythosupgrade14: new Decimal(1),
  mythosupgrade15: new Decimal(1),
  challengefocus: 0,

  maxexponent: new Decimal(10000),

  effectiveLevelMult: new Decimal(1),
  optimalOfferingTimer: new Decimal(600),
  optimalObtainiumTimer: new Decimal(3600),

  runeSum: new Decimal(0),

  globalAntMult: new Decimal(1),
  antMultiplier: new Decimal(1),
  antSoftcapPow: new Decimal(1),

  antOneProduce: new Decimal(1),
  antTwoProduce: new Decimal(1),
  antThreeProduce: new Decimal(1),
  antFourProduce: new Decimal(1),
  antFiveProduce: new Decimal(1),
  antSixProduce: new Decimal(1),
  antSevenProduce: new Decimal(1),
  antEightProduce: new Decimal(1),

  antCostGrowth: [1e41, 3, 10, 1e2, 1e4, 1e8, 1e16, 1e32],

  antUpgradeBaseCost: [100, 100, 1000, 1000, 1e5, 1e6, 1e8, 1e11, 1e15, 1e20, 1e40, 1e100],
  antUpgradeCostIncreases: [10, 10, 10, 10, 100, 100, 100, 100, 1000, 1000, 1000, 1e100],

  bonusant1: new Decimal(0),
  bonusant2: new Decimal(0),
  bonusant3: new Decimal(0),
  bonusant4: new Decimal(0),
  bonusant5: new Decimal(0),
  bonusant6: new Decimal(0),
  bonusant7: new Decimal(0),
  bonusant8: new Decimal(0),
  bonusant9: new Decimal(0),
  bonusant10: new Decimal(0),
  bonusant11: new Decimal(0),
  bonusant12: new Decimal(0),

  rune1level: new Decimal(1),
  rune2level: new Decimal(1),
  rune3level: new Decimal(1),
  rune4level: new Decimal(1),
  rune5level: new Decimal(1),
  rune1Talisman: new Decimal(0),
  rune2Talisman: new Decimal(0),
  rune3Talisman: new Decimal(0),
  rune4Talisman: new Decimal(0),
  rune5Talisman: new Decimal(0),

  talisman1Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman2Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman3Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman4Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman5Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman6Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  talisman7Effect: [null, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],

  talisman6Power: 0,
  talisman7Quarks: 0,

  runescreen: 'runes',
  settingscreen: 'settings',

  talismanResourceObtainiumCosts: [1e13, 1e14, 1e16, 1e18, 1e20, 1e22, 1e24],
  talismanResourceOfferingCosts: [100, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9],

  talismanLevelCostMultiplier: [1, 4, 1e4, 1e8, 1e13, 10, 100],

  talismanPositiveModifier: [null, 0.75, 1.5, 2.25, 3, 3.75, 4.5],
  talismanNegativeModifier: [null, 0, 0, 0, 0, 0, 0],

  commonTalismanEnhanceCost: [null, 0, 3000, 1000, 0, 0, 0, 0],
  uncommonTalismanEnchanceCost: [null, 0, 10000, 3000, 1000, 0, 0, 0],
  rareTalismanEnchanceCost: [null, 0, 100000, 20000, 2000, 500, 0, 0],
  epicTalismanEnhanceCost: [null, 0, 2e6, 2e5, 2e4, 2000, 1000, 0],
  legendaryTalismanEnchanceCost: [null, 0, 4e7, 2e6, 1e5, 20000, 2500, 200],
  mythicalTalismanEnchanceCost: [null, 0, 0, 0, 0, 0, 0, 0],

  talismanRespec: 1,

  obtainiumGain: new Decimal(0),

  mirrorTalismanStats: [null, 1, 1, 1, 1, 1],
  antELO: new Decimal(0),
  effectiveELO: new Decimal(0),

  timeWarp: false,

  blessingMultiplier: new Decimal(1),
  spiritMultiplier: new Decimal(1),
  runeBlessings: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  runeSpirits: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],

  effectiveRuneBlessingPower: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
  effectiveRuneSpiritPower: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],

  blessingBaseCost: 1e6,
  spiritBaseCost: 1e20,

  triggerChallenge: 0,

  prevReductionValue: new Decimal(-1),

  buildingSubTab: 'coin',
  // 1,000 of each before Diminishing Returns
  blessingbase: [null, 1 / 500, 1 / 5000, 1 / 2000, 1 / 750, 1 / 200, 1 / 10000, 1 / 5000, 1 / 10, 1 / 10000, 1 / 1000],
  blessingDRPower: [null, 1 / 3, 1 / 3, 2 / 3, 1 / 2, 2 / 3, 2, 1 / 3, 1 / 3, 1 / 16, 1 / 16],
  giftbase: [1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000, 1 / 1000],
  giftDRPower: [1 / 6, 1 / 6, 1 / 3, 1 / 4, 1 / 3, 1, 1 / 6, 1 / 6, 1 / 32, 1 / 32],
  benedictionbase: [
    null,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000,
    1 / 1000
  ],
  benedictionDRPower: [null, 1 / 12, 1 / 12, 1 / 6, 1 / 8, 1 / 6, 1 / 2, 1 / 12, 1 / 12, 1 / 64, 1 / 64],
  // 10 Million of each before Diminishing returns on first 3, 200k for second, and 10k for the last few
  platonicCubeBase: [2 / 4e6, 1.5 / 4e6, 1 / 4e6, 1 / 8e4, 1 / 1e4, 1 / 1e5, 1 / 1e4, 1 / 1e4],
  platonicDRPower: [1 / 5, 1 / 5, 1 / 5, 1 / 5, 1 / 16, 1 / 16, 1 / 4, 1 / 8],

  cubeBonusMultiplier: [null, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
  tesseractBonusMultiplier: [null, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
  hypercubeBonusMultiplier: [null, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
  platonicBonusMultiplier: [new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],

  autoOfferingCounter: new Decimal(0),
  researchOrderByCost: [],

  viscosityPower: [1, 0.90, 0.80, 0.75, 0.70, 0.6, 0.54, 0.45, 0.39, 0.33, 0.3, 0.2, 0.1, 0.05, 0, 0, 0],
  lazinessMultiplier: [
    1,
    1 / 2,
    1 / 5,
    1 / 20,
    1 / 100,
    1 / 3e3,
    1 / 1e5,
    1 / 1e8,
    1 / 1e11,
    1 / 1e14,
    1 / 1e17,
    1 / 1e21,
    1 / 1e28,
    1 / 1e33,
    1 / 1e40,
    1 / 1e55,
    1 / 1e70
  ],
  hyperchallengedMultiplier: [1, 1.2, 1.4, 1.65, 2, 2.5, 4, 6, 10, 15, 23, 37, 60, 100, 400, 1000, 10000],
  illiteracyPower: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.075, 0.05, 0.025, 0.01, 0, 0, 0],
  deflationMultiplier: [
    1,
    0.5,
    0.25,
    0.05,
    0.01,
    1 / 1e3,
    1 / 1e4,
    1 / 4e5,
    1 / 1e8,
    1 / 1e10,
    1 / 1e14,
    1 / 1e18,
    1 / 1e25,
    1 / 1e35,
    1 / 1e50,
    0,
    0
  ],
  extinctionMultiplier: [1, 0.92, 0.86, 0.8, 0.74, 0.65, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.1, 0, 0, 0, 0],
  droughtMultiplier: [1, 5, 25, 200, 1e3, 1e4, 1e6, 1e9, 1e13, 1e18, 1e24, 1e30, 1e40, 1e55, 1e75, 1e100, 1e150],
  financialcollapsePower: [
    1,
    0.9,
    0.8,
    0.7,
    0.6,
    0.5,
    0.4,
    0.3,
    0.2,
    0.15,
    0.12,
    0.09,
    0.03,
    0.01,
    0.007,
    0.0007,
    0.00007
  ],

  corruptionPointMultipliers: [1, 1.5, 2.1, 2.8, 3.6, 4.5, 5.5, 6.6, 7.8, 9, 10.3, 11.7, 13.2, 14.8, 16.5, 18.3, 20.1, 25, 35],
  ascendBuildingProduction: {
    first: new Decimal(0),
    second: new Decimal(0),
    third: new Decimal(0),
    fourth: new Decimal(0),
    fifth: new Decimal(0)
  },
  freeUpgradeAccelerator: new Decimal(0),
  freeUpgradeMultiplier: new Decimal(0),

  acceleratorMultiplier: new Decimal(1),
  multiplierMultiplier: new Decimal(1),

  constUpgradeCosts: [null, 1, 13, 17, 237, 316, 4216, 5623, 74989, 1e10, 1e24],

  globalConstantMult: new Decimal(1),
  autoTalismanTimer: 0,

  autoChallengeTimerIncrement: new Decimal(0),
  corruptionTrigger: 1,

  challenge15Rewards: {
    cube1: new Decimal(1),
    ascensions: new Decimal(1),
    coinExponent: new Decimal(1),
    taxes: new Decimal(1),
    obtainium: new Decimal(1),
    offering: new Decimal(1),
    accelerator: new Decimal(1),
    multiplier: new Decimal(1),
    runeExp: new Decimal(1),
    runeBonus: new Decimal(1),
    cube2: new Decimal(1),
    transcendChallengeReduction: new Decimal(1),
    reincarnationChallengeReduction: new Decimal(1),
    antSpeed: new Decimal(1),
    bonusAntLevel: new Decimal(1),
    cube3: new Decimal(1),
    talismanBonus: new Decimal(1),
    globalSpeed: new Decimal(1),
    blessingBonus: new Decimal(1),
    constantBonus: new Decimal(1),
    cube4: new Decimal(1),
    spiritBonus: new Decimal(1),
    score: new Decimal(1),
    quarks: new Decimal(1),
    hepteractUnlocked: new Decimal(0),
    cube5: new Decimal(1),
    powder: new Decimal(1),
    exponent: new Decimal(1),
    freeOrbs: new Decimal(0),
    ascensionSpeed: new Decimal(1)
  },

  autoResetTimers: {
    prestige: new Decimal(0),
    transcension: new Decimal(0),
    reincarnation: new Decimal(0),
    ascension: new Decimal(0)
  },

  timeMultiplier: new Decimal(1),
  upgradeMultiplier: new Decimal(1),

  historyCountMax: 20,

  isEvent: false,
  shopEnhanceVision: false,

  // talismanResourceObtainiumCosts: [1e13, 1e14, 1e16, 1e18, 1e20, 1e22, 1e24]
  // talismanResourceOfferingCosts: [0, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9]

  eventClicked: false,

  ambrosiaTimer: new Decimal(0),
  TIME_PER_AMBROSIA: new Decimal(600),

  currentSingChallenge: undefined
}

export const blankGlobals = { ...Globals }

