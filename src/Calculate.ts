import Decimal from 'break_eternity.js'
import i18next from 'i18next'
import { achievementaward } from './Achievements'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { CalcECC } from './Challenges'
import { BuffType, calculateEventSourceBuff } from './Event'
import { addTimers, automaticTools } from './Helper'
import { hepteractEffective } from './Hepteracts'
import { disableHotkeys, enableHotkeys } from './Hotkeys'
import { quarkHandler } from './Quark'
import { reset } from './Reset'
import { calculateSingularityDebuff } from './singularity'
import { getFastForwardTotalMultiplier } from './singularity'
import { format, getTimePinnedToLoadDate, player, resourceGain, saveSynergy, updateAll } from './Synergism'
import { toggleTalismanBuy, updateTalismanInventory } from './Talismans'
import { clearInterval, setInterval } from './Timers'
import type { resetNames } from './types/Synergism'
import { Alert, Prompt } from './UpdateHTML'
import { productContentsDecimal, productContentsNumber, sumContentsNumber, sumContentsDecimal, smoothPoly } from './Utility'
import { Globals as G } from './Variables'

const CASH_GRAB_ULTRA_QUARK = 0.08
const CASH_GRAB_ULTRA_CUBE = 1.2
const CASH_GRAB_ULTRA_BLUEBERRY = 0.15

const EX_ULTRA_OFFERING = 0.125
const EX_ULTRA_OBTAINIUM = 0.125
const EX_ULTRA_CUBES = 0.125

export const calculateTotalCoinOwned = () => {
  G.totalCoinOwned = Decimal.add(player.firstOwnedCoin
    , player.secondOwnedCoin)
    .add(player.thirdOwnedCoin)
    .add(player.fourthOwnedCoin)
    .add(player.fifthOwnedCoin)
}

export const calculateTotalAcceleratorBoost = () => {
  let b = new Decimal(0)
  if (player.upgrades[26] > 0.5) {
    b = b.add(1)
  }
  if (player.upgrades[31] > 0.5) {
    b = b.add(G.totalCoinOwned.div(2000).floor())
  }
  if (player.achievements[7] > 0.5) {
    b = b.add(Decimal.floor(Decimal.div(player.firstOwnedCoin, 2000)))
  }
  if (player.achievements[14] > 0.5) {
    b = b.add(Decimal.floor(Decimal.div(player.secondOwnedCoin, 2000)))
  }
  if (player.achievements[21] > 0.5) {
    b = b.add(Decimal.floor(Decimal.div(player.thirdOwnedCoin, 2000)))
  }
  if (player.achievements[28] > 0.5) {
    b = b.add(Decimal.floor(Decimal.div(player.fourthOwnedCoin, 2000)))
  }
  if (player.achievements[35] > 0.5) {
    b = b.add(Decimal.floor(Decimal.div(player.fifthOwnedCoin, 2000)))
  }

  b = b.add(player.researches[93]
    * Decimal.floor(
      (1 / 20)
        * (G.rune1level
          + G.rune2level
          + G.rune3level
          + G.rune4level
          + G.rune5level)
    ))
  b = b.add(Decimal.mul(Decimal.add(0.01, G.rune1level), G.effectiveLevelMult).div(20).floor())
  b = b.mul(1
    + (1 / 5)
      * player.researches[3]
      * (1 + (1 / 2) * CalcECC('ascension', player.challengecompletions[14])))
  b = b.mul(1 + (1 / 20) * player.researches[16] + (1 / 20) * player.researches[17])
  b = b.mul(1 + (1 / 20) * player.researches[88])
  b = b.mul(calculateSigmoidExponential(
    20,
    (((player.antUpgrades[4 - 1]! + G.bonusant4) / 1000) * 20) / 19
  ))
  b = b.mul(1 + (1 / 100) * player.researches[127])
  b = b.mul(1 + (0.8 / 100) * player.researches[142])
  b = b.mul(1 + (0.6 / 100) * player.researches[157])
  b = b.mul(1 + (0.4 / 100) * player.researches[172])
  b = b.mul(1 + (0.2 / 100) * player.researches[187])
  b = b.mul(1 + (0.01 / 100) * player.researches[200])
  b = b.mul(player.cubeUpgrades[50].mul(0.0001).add(1))
  b = b.mul(1 + (1 / 1000) * hepteractEffective('acceleratorBoost'))
  if (
    player.upgrades[73] > 0.5
    && player.currentChallenge.reincarnation !== 0
  ) {
    b = b.mul(2)
  }
  b = Decimal.min(1e100, Decimal.floor(b)) // cap :c
  G.freeAcceleratorBoost = b

  G.totalAcceleratorBoost = Decimal.add(player.acceleratorBoostBought, G.freeAcceleratorBoost).floor()
}

export const calculateAcceleratorMultiplier = () => {
  G.acceleratorMultiplier = new Decimal(1)
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + player.achievements[60] / 100)
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + player.achievements[61] / 100)
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + player.achievements[62] / 100)
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(Decimal.mul(player.researches[1]
      , (CalcECC('ascension', player.challengecompletions[14]).div(2).add(1))).mul(0.2).add(1))
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1
    + (1 / 20) * player.researches[6]
    + (1 / 25) * player.researches[7]
    + (1 / 40) * player.researches[8]
    + (3 / 200) * player.researches[9]
    + (1 / 200) * player.researches[10])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (1 / 20) * player.researches[86])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (1 / 100) * player.researches[126])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (0.8 / 100) * player.researches[141])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (0.6 / 100) * player.researches[156])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (0.4 / 100) * player.researches[171])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (0.2 / 100) * player.researches[186])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1 + (0.01 / 100) * player.researches[200])
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(player.cubeUpgrades[50].mul(0.0001).add(1))
  G.acceleratorMultiplier = G.acceleratorMultiplier.mul(Decimal.pow(
    1.01,
    player.upgrades[21]
      + player.upgrades[22]
      + player.upgrades[23]
      + player.upgrades[24]
      + player.upgrades[25]
  ))
  if (
    (player.currentChallenge.transcension !== 0
      || player.currentChallenge.reincarnation !== 0)
    && player.upgrades[50] > 0.5
  ) {
    G.acceleratorMultiplier = G.acceleratorMultiplier.mul(1.25)
  }
}

export const calculateRecycleMultiplier = () => {
  // Factors where recycle bonus comes from
  const recycleFactors = sumContentsNumber([
    0.05 * player.achievements[80],
    0.05 * player.achievements[87],
    0.05 * player.achievements[94],
    0.05 * player.achievements[101],
    0.05 * player.achievements[108],
    0.05 * player.achievements[115],
    0.075 * player.achievements[122],
    0.075 * player.achievements[129],
    0.05 * player.upgrades[61],
    0.25 * Decimal.min(1, G.rune4level / 400),
    0.005 * player.cubeUpgrades[2]
  ])

  return 1 / (1 - recycleFactors)
}

export function calculateRuneExpGiven (
  runeIndex: number,
  all: boolean,
  runeLevel: Decimal,
  returnFactors: true
): number[]
export function calculateRuneExpGiven (
  runeIndex: number,
  all: boolean,
  runeLevel?: Decimal,
  returnFactors?: false
): Decimal
export function calculateRuneExpGiven (
  runeIndex: number,
  all = false,
  runeLevel = player.runelevels[runeIndex],
  returnFactors = false
) {
  // recycleMult accounted for all recycle chance, but inversed so it's a multiplier instead
  const recycleMultiplier = calculateRecycleMultiplier()

  // Rune multiplier that is summed instead of added
  let allRuneExpAdditiveMultiplier: Decimal | null = null
  if (all) {
    allRuneExpAdditiveMultiplier = sumContentsDecimal([
      // Challenge 3 completions
      player.highestchallengecompletions[3].mul(0.01),
      // Reincarnation 2x1
      1 * player.upgrades[66]
    ])
  } else {
    allRuneExpAdditiveMultiplier = sumContentsDecimal([
      // Base amount multiplied per offering
      1,
      // +1 if C1 completion
      Decimal.min(1, player.highestchallengecompletions[1]),
      // +0.10 per C1 completion
      player.highestchallengecompletions[1].mul(0.04),
      // Research 5x2
      0.6 * player.researches[22],
      // Research 5x3
      0.3 * player.researches[23],
      // Particle Upgrade 1x1
      2 * player.upgrades[61],
      // Particle upgrade 3x1
      (player.upgrades[71] * runeLevel) / 25
    ])
  }

  // Rune multiplier that gets applied to all runes
  const allRuneExpMultiplier = productContentsDecimal([
    // Research 4x16
    1 + player.researches[91] / 20,
    // Research 4x17
    1 + player.researches[92] / 20,
    // Ant 8
    calculateSigmoidExponential(
      999,
      (1 / 10000) * Decimal.pow(player.antUpgrades[8 - 1]! + G.bonusant8, 1.1)
    ),
    // Cube Bonus
    G.cubeBonusMultiplier[4],
    // Cube Upgrade Bonus
    1 + (player.ascensionCounter / 1000) * player.cubeUpgrades[32],
    // Constant Upgrade Multiplier
    1 + (1 / 10) * player.constantUpgrades[8],
    // Challenge 15 reward multiplier
    G.challenge15Rewards.runeExp
  ])
  // Corruption Divisor
  const droughtEffect = 1
    / Decimal.pow(
      G.droughtMultiplier[player.usedCorruptions[8]],
      1 - (1 / 2) * player.platonicUpgrades[13]
    )

  // Rune multiplier that gets applied to specific runes
  const runeExpMultiplier = [
    productContentsDecimal([
      1 + player.researches[78] / 50,
      1 + player.researches[111] / 100,
      CalcECC('reincarnation', player.challengecompletions[7]).div(10).add(1),
      droughtEffect
    ]),
    productContentsDecimal([
      1 + player.researches[80] / 50,
      1 + player.researches[112] / 100,
      CalcECC('reincarnation', player.challengecompletions[7]).div(10).add(1),
      droughtEffect
    ]),
    productContentsDecimal([
      1 + player.researches[79] / 50,
      1 + player.researches[113] / 100,
      CalcECC('reincarnation', player.challengecompletions[8]).div(5).add(1),
      droughtEffect
    ]),
    productContentsDecimal([
      1 + player.researches[77] / 50,
      1 + player.researches[114] / 100,
      CalcECC('reincarnation', player.challengecompletions[6]).div(10).add(1),
      droughtEffect
    ]),
    productContentsDecimal([
      1 + player.researches[83] / 20,
      1 + player.researches[115] / 100,
      CalcECC('reincarnation', player.challengecompletions[9]).div(5).add(1),
      droughtEffect
    ]),
    productContentsNumber([1]),
    productContentsNumber([1])
  ]

  const fact = [
    allRuneExpAdditiveMultiplier,
    allRuneExpMultiplier,
    recycleMultiplier,
    runeExpMultiplier[runeIndex]
  ]

  return returnFactors ? fact : Decimal.min(1e200, productContentsDecimal(fact))
}

export const getRuneXPReq = (runeLevel: number | Decimal): Decimal => {
  let i = new Decimal(runeLevel)
  i = Decimal.pow(4, i.div(200).pow(0.75).sub(1)).mul(i)
  i = smoothPoly(i, new Decimal(4), new Decimal(6.5), false)
  return i
}

export const getRuneXPTarget = (xp: number | Decimal): Decimal => {
  let i = smoothPoly(new Decimal(xp), new Decimal(4), new Decimal(6.5), true)
  i = i.pow(0.75).mul(0.0552954).lambertw().root(0.75).mul(189.878)
  return i
}

// Returns the amount of exp required to level a rune
export const calculateRuneExpToLevel = (
  runeIndex: number,
  runeLevel = player.runelevels[runeIndex]
) => {
  // For runes 6 and 7 we will apply a special multiplier
  let multiplier = getRuneXPReq(runeLevel)
  if (runeIndex === 5) {
    multiplier = Decimal.pow(100, runeLevel)
  }
  if (runeIndex === 6) {
    multiplier = Decimal.pow(1e25, runeLevel).mul(player.highestSingularityCount + 1)
  }
  return Decimal.mul(multiplier, G.runeexpbase[runeIndex])
}

export const calculateMaxRunes = (i: number) => {
  let max = new Decimal(1000)

  const increaseAll = Decimal.add(player.cubeUpgrades[16], player.cubeUpgrades[37]).mul(20)
    .add(Decimal.mul(3, player.constantUpgrades[7]))
    .add(CalcECC('ascension', player.challengecompletions[11]).mul(80))
    .add(CalcECC('ascension', player.challengecompletions[14]).mul(200))
    .add(Decimal.floor(Decimal.mul(0.04, player.researches[200]).add(Decimal.mul(0.04, player.cubeUpgrades[50]))))
  const increaseMaxLevel = [
    null,
    Decimal.add(player.researches[78], player.researches[111]).mul(10).add(increaseAll),
    Decimal.add(player.researches[80], player.researches[112]).mul(10).add(increaseAll),
    Decimal.add(player.researches[79], player.researches[113]).mul(10).add(increaseAll),
    Decimal.add(player.researches[77], player.researches[114]).mul(10).add(increaseAll),
    Decimal.mul(player.researches[115], 10).add(increaseAll),
    -901,
    -999
  ]

  max = Decimal.gt(increaseMaxLevel[i]!, G.runeMaxLvl)
    ? G.runeMaxLvl
    : Decimal.add(max, increaseMaxLevel[i]!)
  return max
}

export const calculateEffectiveIALevel = () => {
  return (
    player.runelevels[5]
    .add(Decimal.max(0, player.runelevels[5].sub(74)))
    .add(Decimal.max(0, player.runelevels[5].sub(98)))
  )
}

export function calculateOfferings (input: resetNames): Decimal
export function calculateOfferings (
  input: resetNames,
  calcMult: false,
  statistic?: boolean
): number[]
export function calculateOfferings (
  input: resetNames,
  calcMult: true,
  statistic: boolean
): Decimal
export function calculateOfferings (
  input: resetNames,
  calcMult = true,
  statistic = false
) {
  if (
    input === 'acceleratorBoost'
    || input === 'ascension'
    || input === 'ascensionChallenge'
  ) {
    return 0
  }

  let q = new Decimal(0)
  let a = new Decimal(0)
  let b = new Decimal(0)
  let c = new Decimal(0)

  if (input === 'reincarnation' || input === 'reincarnationChallenge') {
    a = a.add(3)
    if (player.achievements[52] > 0.5) {
      a = a.add(player.reincarnationcounter.div(1800).min(1).mul(25))
    }
    if (player.upgrades[62] > 0.5) {
      a = a.add(sumContentsDecimal(player.challengecompletions).mul(0.02))
    }
    a = a.add(0.6 * player.researches[25])
    if (player.researches[95] === 1) {
      a = a.add(4)
    }
    a = a.add(Decimal.mul(G.rune5level, G.effectiveLevelMult).mul(1 + player.researches[85] / 200).div(200))
    a = a.mul(player.reincarnationShards.add(1).log10().pow(2/3).div(4).add(1))
    a = a.mul(player.reincarnationcounter.div(10).add(1).pow(2).min(1))
    if (player.reincarnationcounter.gte(5)) {
      a = a.mul(player.reincarnationcounter.div(10).max(1))
    }
  }
  if (
    input === 'transcension'
    || input === 'transcensionChallenge'
    || input === 'reincarnation'
    || input === 'reincarnationChallenge'
  ) {
    b = b.add(2)
    if (player.reincarnationCount.gt(0)) {
      b = b.add(2)
    }
    if (player.achievements[44] > 0.5) {
      b = b.add(player.transcendcounter.div(1800).min(1).mul(15))
    }
    if (player.challengecompletions[2].gt(0)) {
      b = b.add(1)
    }
    b = b.add(0.2 * player.researches[24])
    b = b.add((1 / 200)
      * G.rune5level
      * G.effectiveLevelMult
      * (1 + player.researches[85] / 200))
    b = b.mul(1 + Decimal.pow(player.transcendShards.add(1).log10(), 1 / 2) / 5)
    b = b.mul(1 + CalcECC('reincarnation', player.challengecompletions[8]) / 25)
    b = b.mul(Decimal.min(Decimal.pow(player.transcendcounter / 10, 2), 1))
    if (player.transcendCount.gte(5)) {
      b = b.mul(player.transcendcounter.div(10).max(1))
    }
  }
  // This will always be calculated if '0' is not already returned
  c = c.add(1)
  if (player.transcendCount.gt(0) || player.reincarnationCount.gt(0)) {
    c = c.add(1)
  }
  if (player.reincarnationCount.gt(0)) {
    c = c.add(2)
  }
  if (player.achievements[37] > 0.5) {
    c = c.add(player.prestigecounter.div(1800).min(1).mul(15))
  }
  if (player.challengecompletions[2].gt(0)) {
    c = c.add(1)
  }
  c = c.add(0.2 * player.researches[24])
  c = c.add((1 / 200)
    * G.rune5level
    * G.effectiveLevelMult
    * (1 + player.researches[85] / 200))
  c = c.mul(1 + Decimal.pow(Decimal.log(player.prestigeShards.add(1), 10), 1 / 2) / 5)
  c = c.mul(1 + CalcECC('reincarnation', player.challengecompletions[6]) / 50)
  c = c.mul(Decimal.min(Decimal.pow(player.prestigecounter / 10, 2), 1))
  if (player.prestigeCount.gte(5)) {
    c = c.mul(player.prestigecounter.div(10).max(1))
  }
  q = Decimal.add(a, b).add(c)

  const arr = [
    1 + (10 * player.achievements[33]) / 100, // Alchemy Achievement 5
    1 + (15 * player.achievements[34]) / 100, // Alchemy Achievement 6
    1 + (25 * player.achievements[35]) / 100, // Alchemy Achievement 7
    1 + (20 * player.upgrades[38]) / 100, // Diamond Upgrade 4x3
    player.maxobtainium.div(3e7).sqrt().min(1).mul(2).mul(player.upgrades[75]).add(1), // Particle Upgrade 3x5
    1 + (1 / 50) * player.shopUpgrades.offeringAuto, // Auto Offering Shop
    1 + (1 / 25) * player.shopUpgrades.offeringEX, // Offering EX Shop
    1 + (1 / 100) * player.shopUpgrades.cashGrab, // Cash Grab
    sumContentsDecimal(player.challengecompletions).mul(player.researches[85]).div(10000).add(1), // Research 4x10
    Decimal.pow(Decimal.add(player.antUpgrades[6 - 1]!, G.bonusant6), 0.66).add(1), // Ant Upgrade:
    G.cubeBonusMultiplier[3], // Brutus
    player.constantUpgrades[3].mul(0.02).add(1), // Constant Upgrade 3
    1
    + 0.0003 * player.talismanLevels[3 - 1] * player.researches[149]
    + 0.0004 * player.talismanLevels[3 - 1] * player.researches[179], // Research 6x24,8x4
     CalcECC('ascension', player.challengecompletions[12]).mul(0.12).add(1), // Challenge 12
    1 + (0.01 / 100) * player.researches[200], // Research 8x25
    1 + Decimal.min(1, player.ascensionCount / 1e6) * player.achievements[187], // Ascension Count Achievement
    1 + 0.6 * player.achievements[250] + 1 * player.achievements[251], // Sun&Moon Achievements
    player.cubeUpgrades[46].mul(0.05).add(1), // Cube Upgrade 5x6
    player.cubeUpgrades[50].mul(0.0002).add(1), // Cube Upgrade 5x10
    1 + player.platonicUpgrades[5], // Platonic ALPHA
    1 + 2.5 * player.platonicUpgrades[10], // Platonic BETA
    1 + 5 * player.platonicUpgrades[15], // Platonic OMEGA
    G.challenge15Rewards.offering, // C15 Reward
    1 + 5 * (player.singularityUpgrades.starterPack.getEffect().bonus ? 1 : 0), // Starter Pack Upgrade
    player.singularityUpgrades.singOfferings1.getEffect().bonus, // Offering Charge GQ Upgrade
    player.singularityUpgrades.singOfferings2.getEffect().bonus, // Offering Storm GQ Upgrade
    player.singularityUpgrades.singOfferings3.getEffect().bonus, // Offering Tempest GQ Upgrade
    player.singularityUpgrades.singCitadel.getEffect().bonus, // Citadel GQ Upgrade
    player.singularityUpgrades.singCitadel2.getEffect().bonus, // Citadel 2 GQ Upgrade
    player.cubeUpgrades[54].mul(0.01).add(1), // Cube upgrade 6x4 (Cx4)
    +player.octeractUpgrades.octeractOfferings1.getEffect().bonus, // Offering Electrolosis OC Upgrade
    1 + 0.001 * +player.blueberryUpgrades.ambrosiaOffering1.bonus.offeringMult, // Ambrosia!!
    calculateEXALTBonusMult(), // 20 Ascensions X20 Bonus [EXALT ONLY]
    calculateEXUltraOfferingBonus(), // EX Ultra Shop Upgrade
    1 + calculateEventBuff(BuffType.Offering) // Event
  ]

  if (calcMult) {
    q = q.mul(productContentsDecimal(arr))
  } else {
    return arr
  }

  if (statistic) {
    return productContentsDecimal(arr)
  }

  if (G.eventClicked && G.isEvent) {
    q = q.mul(1.05)
  }
  q = q.div(calculateSingularityDebuff('Offering'))
  q = Decimal.floor(q)
  if (player.currentChallenge.ascension === 15) {
    q = q.mul(player.cubeUpgrades[62].mul(7).add(1))
  }
  q = q.mul(1 + (1 / 200) * player.shopUpgrades.cashGrab2)
  q = q.mul(1 + (1 / 100) * player.shopUpgrades.offeringEX2 * player.singularityCount)
  q = q.mul(Decimal.pow(1.02, player.shopUpgrades.offeringEX3))
  q = q.mul(calculateTotalOcteractOfferingBonus())
  q = Decimal.min(1e300, q) // cap lol

  let persecond = new Decimal(0)
  if (input === 'prestige') {
    persecond = Decimal.div(q, player.prestigecounter.add(1))
  }
  if (input === 'transcension' || input === 'transcensionChallenge') {
    persecond = Decimal.div(q, player.transcendcounter.add(1))
  }
  if (input === 'reincarnation' || input === 'reincarnationChallenge') {
    persecond = Decimal.div(q, player.reincarnationcounter.add(1))
  }
  if (persecond.gt(player.offeringpersecond)) {
    player.offeringpersecond = persecond
  }

  return q
}

export const calculateObtainium = () => {
  G.obtainiumGain = new Decimal(1)
  if (player.upgrades[69] > 0) {
    G.obtainiumGain = G.obtainiumGain.mul(Decimal.min(
      10,
      new Decimal(
        Decimal.pow(Decimal.log(G.reincarnationPointGain.add(10), 10), 0.5)
      ).toNumber()
    ))
  }
  if (player.upgrades[72] > 0) {
    G.obtainiumGain = G.obtainiumGain.mul(Decimal.min(
      50,
      Decimal.add(player.challengecompletions[6], player.challengecompletions[7])
      .add(player.challengecompletions[8])
      .add(player.challengecompletions[9])
      .add(player.challengecompletions[10]).mul(2).add(1)
    ))
  }
  if (player.upgrades[74] > 0) {
    G.obtainiumGain = G.obtainiumGain.mul(player.maxofferings.div(100000).sqrt().min(1).mul(4).add(1))
  }
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.researches[65] / 5)
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.researches[76] / 10)
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.researches[81] / 10)
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.shopUpgrades.obtainiumAuto / 50)
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.shopUpgrades.cashGrab / 100)
  G.obtainiumGain = G.obtainiumGain.mul(1
    + (G.rune5level / 200)
      * G.effectiveLevelMult
      * (1
        + (player.researches[84] / 200)
          * (1
            + (1 * G.effectiveRuneSpiritPower[5] * calculateCorruptionPoints())
              / 400)))
  G.obtainiumGain = G.obtainiumGain.mul(1
    + 0.01 * player.achievements[84]
    + 0.03 * player.achievements[91]
    + 0.05 * player.achievements[98]
    + 0.07 * player.achievements[105]
    + 0.09 * player.achievements[112]
    + 0.11 * player.achievements[119]
    + 0.13 * player.achievements[126]
    + 0.15 * player.achievements[133]
    + 0.17 * player.achievements[140]
    + 0.19 * player.achievements[147])
  G.obtainiumGain = G.obtainiumGain.mul(Decimal.add(player.antUpgrades[10 - 1]!, G.bonusant10).div(50).pow(2/3).mul(2).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.achievements[188] * Decimal.min(2, player.ascensionCount / 5e6))
  G.obtainiumGain = G.obtainiumGain.mul(1 + 0.6 * player.achievements[250] + 1 * player.achievements[251])
  G.obtainiumGain = G.obtainiumGain.mul(G.cubeBonusMultiplier[5])
  G.obtainiumGain = G.obtainiumGain.mul(player.constantUpgrades[4].mul(0.04).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[47].mul(0.1).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[3].mul(0.1).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(CalcECC('ascension', player.challengecompletions[12]).mul(0.5).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(1 + (calculateCorruptionPoints() / 400) * G.effectiveRuneSpiritPower[4])
  G.obtainiumGain = G.obtainiumGain.mul(player.uncommonFragments.add(1).log(4).mul(0.03).mul(player.researches[144]).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[50].mul(0.0002).add(1))
  if (player.achievements[53] > 0) {
    G.obtainiumGain = G.obtainiumGain.mul(G.runeSum.div(800).add(1))
  }
  if (player.achievements[128]) {
    G.obtainiumGain = G.obtainiumGain.mul(1.5)
  }
  if (player.achievements[129]) {
    G.obtainiumGain = G.obtainiumGain.mul(1.25)
  }

  if (player.achievements[51] > 0) {
    G.obtainiumGain = G.obtainiumGain.add(4)
  }
  if (player.reincarnationcounter.gte(2)) {
    G.obtainiumGain = G.obtainiumGain.add(player.researches[63])
  }
  if (player.reincarnationcounter.gte(5)) {
    G.obtainiumGain = G.obtainiumGain.add(2 * player.researches[64])
  }
  G.obtainiumGain = G.obtainiumGain.mul(Decimal.min(1, Decimal.pow(player.reincarnationcounter.div(10), 2)))
  G.obtainiumGain = G.obtainiumGain.mul(1 + (1 / 25) * player.shopUpgrades.obtainiumEX)
  if (player.reincarnationCount.gte(5)) {
    G.obtainiumGain = G.obtainiumGain.mul(Decimal.max(1, player.reincarnationcounter.div(10)))
  }
  G.obtainiumGain = G.obtainiumGain.mul(
    player.transcendShards.add(1).log10().div(300).pow(2))
  G.obtainiumGain = Decimal.pow(
    G.obtainiumGain,
    Decimal.min(
      1,
      G.illiteracyPower[player.usedCorruptions[5]]
        * (1
          + (9 / 100)
            * player.platonicUpgrades[9]
            * Decimal.min(100, Decimal.log10(player.researchPoints + 10)))
    )
  )
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[42].mul(0.04).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[43].mul(0.03).add(1))
  G.obtainiumGain = G.obtainiumGain.mul(1 + player.platonicUpgrades[5])
  G.obtainiumGain = G.obtainiumGain.mul(1 + 1.5 * player.platonicUpgrades[9])
  G.obtainiumGain = G.obtainiumGain.mul(1 + 2.5 * player.platonicUpgrades[10])
  G.obtainiumGain = G.obtainiumGain.mul(1 + 5 * player.platonicUpgrades[15])
  G.obtainiumGain = G.obtainiumGain.mul(G.challenge15Rewards.obtainium)
  G.obtainiumGain = G.obtainiumGain.mul(1 + 5 * (player.singularityUpgrades.starterPack.getEffect().bonus ? 1 : 0))
  G.obtainiumGain = G.obtainiumGain.mul(+player.singularityUpgrades.singObtainium1.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(+player.singularityUpgrades.singObtainium2.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(+player.singularityUpgrades.singObtainium3.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[55].mul(0.01).add(1)) // Cube Upgrade 6x5 (Cx5)
  G.obtainiumGain = G.obtainiumGain.mul(1 + (1 / 200) * player.shopUpgrades.cashGrab2)
  G.obtainiumGain = G.obtainiumGain.mul(1 + (1 / 100) * player.shopUpgrades.obtainiumEX2 * player.singularityCount)
  G.obtainiumGain = G.obtainiumGain.mul(1 + calculateEventBuff(BuffType.Obtainium))
  G.obtainiumGain = G.obtainiumGain.mul(+player.singularityUpgrades.singCitadel.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(+player.singularityUpgrades.singCitadel2.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(+player.octeractUpgrades.octeractObtainium1.getEffect().bonus)
  G.obtainiumGain = G.obtainiumGain.mul(Decimal.pow(1.02, player.shopUpgrades.obtainiumEX3))
  G.obtainiumGain = G.obtainiumGain.mul(calculateTotalOcteractObtainiumBonus())

  if (G.eventClicked && G.isEvent) {
    G.obtainiumGain = G.obtainiumGain.mul(1.05)
  }

  if (player.currentChallenge.ascension === 15) {
    G.obtainiumGain = G.obtainiumGain.add(1)
    G.obtainiumGain = G.obtainiumGain.mul(player.cubeUpgrades[62].mul(7).add(1))
  }

  G.obtainiumGain = G.obtainiumGain.mul(1
    + 0.001 * +player.blueberryUpgrades.ambrosiaObtainium1.bonus.obtainiumMult)

  G.obtainiumGain = G.obtainiumGain.mul(calculateEXUltraObtainiumBonus())
  G.obtainiumGain = G.obtainiumGain.mul(calculateEXALTBonusMult())

  G.obtainiumGain = Decimal.min(1e300, G.obtainiumGain) // capppp
  G.obtainiumGain = G.obtainiumGain.div(calculateSingularityDebuff('Obtainium'))

  if (player.usedCorruptions[5] >= 15) {
    G.obtainiumGain = Decimal.pow(G.obtainiumGain, 1 / 4)
  }
  if (player.usedCorruptions[5] >= 16) {
    G.obtainiumGain = Decimal.pow(G.obtainiumGain, 1 / 3)
  }

  G.obtainiumGain = Decimal.max(1 + player.singularityCount, G.obtainiumGain)
  if (player.currentChallenge.ascension === 14) {
    G.obtainiumGain = new Decimal(0)
  }
  player.obtainiumpersecond = Decimal.min(1e300, G.obtainiumGain).div(player.reincarnationcounter.add(0.1))
  player.maxobtainiumpersecond = Decimal.max(
    player.maxobtainiumpersecond,
    player.obtainiumpersecond
  )
}

export const calculateAutomaticObtainium = () => {
  return player.maxobtainiumpersecond.mul(0.05).mul(player.cubeUpgrades[3].mul(0.8).add(1)).mul(10 * player.researches[61] + 2 * player.researches[62])
}

// TODO: REFACTOR THIS - May 15, 2022.
export const calculateTalismanEffects = () => {
  let positiveBonus = new Decimal(0)
  let negativeBonus = new Decimal(0)
  if (player.achievements[135] === 1) {
    positiveBonus = positiveBonus.add(0.02)
  }
  if (player.achievements[136] === 1) {
    positiveBonus = positiveBonus.add(0.02)
  }
  positiveBonus = positiveBonus.add(0.02 * (player.talismanRarity[4 - 1] - 1))
  positiveBonus = positiveBonus.add((3 * player.researches[106]) / 100)
  positiveBonus = positiveBonus.add((3 * player.researches[107]) / 100)
  positiveBonus = positiveBonus.add((3 * player.researches[116]) / 200)
  positiveBonus = positiveBonus.add((3 * player.researches[117]) / 200)
  positiveBonus = positiveBonus.add(G.cubeBonusMultiplier[9] - 1)
  positiveBonus = positiveBonus.add(player.cubeUpgrades[50].mul(0.0004))
  negativeBonus = negativeBonus.add(0.06 * player.researches[118])
  negativeBonus = negativeBonus.add(player.cubeUpgrades[50].mul(0.0004))

  if (player.highestSingularityCount >= 7) {
    positiveBonus = positiveBonus.add(negativeBonus)
    negativeBonus = positiveBonus
  }

  if (player.highestSingularityCount < 7) {
    for (let i = 1; i <= 5; i++) {
      if (player.talismanOne[i] === 1) {
        G.talisman1Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus).mul(player.talismanLevels[1 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman1Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[1 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[1 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanTwo[i] === 1) {
        G.talisman2Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[2 - 1]]!, positiveBonus).mul(player.talismanLevels[2 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman2Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[2 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[2 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanThree[i] === 1) {
        G.talisman3Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[3 - 1]]!, positiveBonus).mul(player.talismanLevels[3 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman3Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[3 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[3 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanFour[i] === 1) {
        G.talisman4Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[4 - 1]]!, positiveBonus).mul(player.talismanLevels[4 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman4Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[4 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[4 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanFive[i] === 1) {
        G.talisman5Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[5 - 1]]!, positiveBonus).mul(player.talismanLevels[5 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman5Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[5 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[5 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanSix[i] === 1) {
        G.talisman6Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[6 - 1]]!, positiveBonus).mul(player.talismanLevels[6 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman6Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[6 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[6 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }

      if (player.talismanSeven[i] === 1) {
        G.talisman7Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[7 - 1]]!, positiveBonus).mul(player.talismanLevels[7 - 1]).mul(G.challenge15Rewards.talismanBonus)
      } else {
        G.talisman7Effect[i] = Decimal.sub(G.talismanNegativeModifier[player.talismanRarity[7 - 1]]!, negativeBonus).mul(-1).mul(player.talismanLevels[7 - 1]).mul(G.challenge15Rewards.talismanBonus)
      }
    }
  } else {
    for (let i = 1; i <= 5; i++) {
      G.talisman1Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[1 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman2Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[2 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman3Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[3 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman4Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[4 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman5Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[5 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman6Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[6 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
      G.talisman7Effect[i] = Decimal.add(G.talismanPositiveModifier[player.talismanRarity[1 - 1]]!, positiveBonus)
        .mul(player.talismanLevels[7 - 1])
        .mul(G.challenge15Rewards.talismanBonus)
    }
  }
  const talismansEffects = [
    G.talisman1Effect,
    G.talisman2Effect,
    G.talisman3Effect,
    G.talisman4Effect,
    G.talisman5Effect,
    G.talisman6Effect,
    G.talisman7Effect
  ]
  const runesTalisman = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
  talismansEffects.forEach((talismanEffect) => {
    talismanEffect.forEach((levels, runeNumber) => {
      runesTalisman[runeNumber] = runesTalisman[runeNumber].add(levels!)
    })
  })
  ;[ , G.rune1Talisman, G.rune2Talisman, G.rune3Talisman, G.rune4Talisman, G.rune5Talisman] = runesTalisman
  G.talisman6Power = 0
  G.talisman7Quarks = 0
  if (player.talismanRarity[1 - 1] === 6) {
    G.rune2Talisman = G.rune2Talisman.add(400)
  }
  if (player.talismanRarity[2 - 1] === 6) {
    G.rune1Talisman = G.rune1Talisman.add(400)
  }
  if (player.talismanRarity[3 - 1] === 6) {
    G.rune4Talisman = G.rune4Talisman.add(400)
  }
  if (player.talismanRarity[4 - 1] === 6) {
    G.rune3Talisman = G.rune3Talisman.add(400)
  }
  if (player.talismanRarity[5 - 1] === 6) {
    G.rune5Talisman = G.rune5Talisman.add(400)
  }
  if (player.talismanRarity[6 - 1] === 6) {
    G.talisman6Power = 2.5
  }
  if (player.talismanRarity[7 - 1] === 6) {
    G.talisman7Quarks = 2
  }
}

export const calculateRuneLevels = () => {
  calculateTalismanEffects()
  if (player.currentChallenge.reincarnation !== 9) {
    const antUpgrade8 = player.antUpgrades[8] ?? 0
    let runeLevel = Array(5).fill(new Decimal(0))
    for (let i = 0; i < 5; i++) {
      runeLevel[i] = Decimal.max(
        1,
        Decimal.add(player.runelevels[i], Decimal.min(1e7, Decimal.add(antUpgrade8, G.bonusant9)))
          .add([G.rune1Talisman, G.rune2Talisman, G.rune3Talisman, G.rune4Talisman, G.rune5Talisman][i])
          .add(player.constantUpgrades[7].mul(7))
      )
    }
    G.rune1level = runeLevel[0]
    G.rune2level = runeLevel[1]
    G.rune3level = runeLevel[2]
    G.rune4level = runeLevel[3]
    G.rune5level = runeLevel[4]
  }

  G.runeSum = sumContentsDecimal([
    G.rune1level,
    G.rune2level,
    G.rune3level,
    G.rune4level,
    G.rune5level
  ])
  calculateRuneBonuses()
}

export const calculateRuneBonuses = () => {
  G.blessingMultiplier = new Decimal(1)
  G.spiritMultiplier = new Decimal(1)

  G.blessingMultiplier = G.blessingMultiplier.mul(1 + (6.9 * player.researches[134]) / 100)
  G.blessingMultiplier = G.blessingMultiplier.mul(1 + (player.talismanRarity[3 - 1] - 1) / 10)
  G.blessingMultiplier = G.blessingMultiplier.mul(player.epicFragments.add(1).log10().mul(player.researches[174]).mul(0.1).add(1))
  G.blessingMultiplier = G.blessingMultiplier.mul(1 + (2 * player.researches[194]) / 100)
  if (player.researches[160] > 0) {
    G.blessingMultiplier = G.blessingMultiplier.mul(Decimal.pow(1.25, 8))
  }
  G.spiritMultiplier = G.spiritMultiplier.mul(1 + (8 * player.researches[164]) / 100)
  if (player.researches[165] > 0 && player.currentChallenge.ascension !== 0) {
    G.spiritMultiplier = G.spiritMultiplier.mul(Decimal.pow(2, 8))
  }
  G.blessingMultiplier = G.blessingMultiplier.mul(player.legendaryFragments.add(1).log10().mul(player.researches[189]).mul(0.15).add(1))
  G.spiritMultiplier = G.spiritMultiplier.mul(1 + (2 * player.researches[194]) / 100)
  G.spiritMultiplier = G.spiritMultiplier.mul(1 + (player.talismanRarity[5 - 1] - 1) / 100)

  for (let i = 1; i <= 5; i++) {
    G.runeBlessings[i] = Decimal.mul(G.blessingMultiplier, Decimal.mul(player.runelevels[i - 1], player.runeBlessingLevels[i]))
    G.runeSpirits[i] = Decimal.mul(G.spiritMultiplier, Decimal.mul(player.runelevels[i - 1], player.runeSpiritLevels[i]))
  }

  for (let i = 1; i <= 5; i++) {
    let eff = G.runeBlessings[i].root(8).div(75).mul(G.challenge15Rewards.blessingBonus)
    if (eff.gte(75)) { eff = eff.div(75).root(3).mul(3) }
    G.effectiveRuneBlessingPower[i] = eff

    eff = G.runeSpirits[i].root(8).div(75).mul(G.challenge15Rewards.spiritBonus)
    if (eff.gte(17.75)) { eff = eff.div(17.75).root(3).mul(17.75) }
    G.effectiveRuneSpiritPower[i] = eff
  }
}

export const calculateAnts = () => {
  let bonusLevels = new Decimal(0)
  bonusLevels = bonusLevels.add(2 * (player.talismanRarity[6 - 1] - 1))
  bonusLevels = bonusLevels.add(CalcECC('reincarnation', player.challengecompletions[9]))
  bonusLevels = bonusLevels.add(player.constantUpgrades[6].mul(2))
  bonusLevels = bonusLevels.add(CalcECC('ascension', player.challengecompletions[11]).mul(12))
  bonusLevels = bonusLevels.add(Decimal.floor((1 / 200) * player.researches[200]))
  bonusLevels = bonusLevels.mul(G.challenge15Rewards.bonusAntLevel)
  let c11 = new Decimal(0)
  let c11bonus = new Decimal(0)
  if (player.currentChallenge.ascension === 11) {
    c11 = new Decimal(999)
  }
  if (player.currentChallenge.ascension === 11) {
    c11bonus = Decimal.floor(
      player.challengecompletions[8].mul(4).add(player.challengecompletions[9].mul(23)).mul(Decimal.sub(1, player.challengecompletions[11].div(10)).max(0))
    )
  }

  let bonus: Array<Decimal> = Array(12).fill(new Decimal(0))
  for (let i = 0; i < 12; i++) {
    bonus[i] = Decimal.min(
      Decimal.add(player.antUpgrades[i]!, c11),
      Decimal.mul(player.researches[i >= 6 ? 98 : 97], 4).add(bonusLevels).add(player.researches[102]).add(2 * player.researches[132]).add(c11bonus)
    )
  }

  G.bonusant1 = bonus[0]
  G.bonusant2 = bonus[1]
  G.bonusant3 = bonus[2]
  G.bonusant4 = bonus[3]
  G.bonusant5 = bonus[4]
  G.bonusant6 = bonus[5]
  G.bonusant7 = bonus[6]
  G.bonusant8 = bonus[7]
  G.bonusant9 = bonus[8]
  G.bonusant10 = bonus[9]
  G.bonusant11 = bonus[10]
  G.bonusant12 = bonus[11]
}

export const calculateAntSacrificeELO = () => {
  G.antELO = new Decimal(0)
  G.effectiveELO = new Decimal(0)
  const antUpgradeSum = sumContentsNumber(player.antUpgrades as number[])
  if (player.antPoints.gte('1e40')) {
    G.antELO = G.antELO.add(Decimal.log(player.antPoints, 10))
    G.antELO = G.antELO.add((1 / 2) * antUpgradeSum)
    G.antELO = G.antELO.add((1 / 10) * player.firstOwnedAnts)
    G.antELO = G.antELO.add((1 / 5) * player.secondOwnedAnts)
    G.antELO = G.antELO.add((1 / 3) * player.thirdOwnedAnts)
    G.antELO = G.antELO.add((1 / 2) * player.fourthOwnedAnts)
    G.antELO = G.antELO.add(player.fifthOwnedAnts)
    G.antELO = G.antELO.add(2 * player.sixthOwnedAnts)
    G.antELO = G.antELO.add(4 * player.seventhOwnedAnts)
    G.antELO = G.antELO.add(8 * player.eighthOwnedAnts)
    G.antELO = G.antELO.add(666 * player.researches[178])
    G.antELO = G.antELO.mul(1
      + 0.01 * player.achievements[180]
      + 0.02 * player.achievements[181]
      + 0.03 * player.achievements[182])
    G.antELO = G.antELO.mul(1 + player.researches[110] / 100)
    G.antELO = G.antELO.mul(1 + (2.5 * player.researches[148]) / 100)

    if (player.achievements[176] === 1) {
      G.antELO = G.antELO.add(25)
    }
    if (player.achievements[177] === 1) {
      G.antELO = G.antELO.add(50)
    }
    if (player.achievements[178] === 1) {
      G.antELO = G.antELO.add(75)
    }
    if (player.achievements[179] === 1) {
      G.antELO = G.antELO.add(100)
    }
    G.antELO = G.antELO.add(25 * player.researches[108])
    G.antELO = G.antELO.add(25 * player.researches[109])
    G.antELO = G.antELO.add(40 * player.researches[123])
    G.antELO = G.antELO.add(CalcECC('reincarnation', player.challengecompletions[10]).mul(100))
    G.antELO = G.antELO.add(75 * player.upgrades[80])
    G.antELO = G.antELO.mul(10).floor().div(10)
 
    G.effectiveELO = G.effectiveELO.add(Decimal.mul(0.5, Decimal.min(3500, G.antELO)))
    G.effectiveELO = G.effectiveELO.add(Decimal.mul(0.1, Decimal.min(4000, G.antELO)))
    G.effectiveELO = G.effectiveELO.add(Decimal.mul(0.1, Decimal.min(6000, G.antELO)))
    G.effectiveELO = G.effectiveELO.add(Decimal.mul(0.1, Decimal.min(10000, G.antELO)))
    G.effectiveELO = G.effectiveELO.add(Decimal.mul(0.2, G.antELO))
    G.effectiveELO = G.effectiveELO.add(G.cubeBonusMultiplier[8] - 1)
    G.effectiveELO = G.effectiveELO.add(player.cubeUpgrades[50])
    G.effectiveELO = G.effectiveELO.mul(1 + 0.03 * player.upgrades[124])
  }
}

const calculateAntSacrificeMultipliers = () => {
  G.timeMultiplier = Decimal.min(1, Decimal.pow(player.antSacrificeTimer.div(10), 2))
  if (player.achievements[177] === 0) {
    G.timeMultiplier = G.timeMultiplier.mul(Decimal.min(
      1000,
      Decimal.max(1, player.antSacrificeTimer.div(10))
    ))
  }
  if (player.achievements[177] > 0) {
    G.timeMultiplier = G.timeMultiplier.mul(Decimal.max(1, player.antSacrificeTimer.div(10)))
  }

  G.upgradeMultiplier = new Decimal(1)
  G.upgradeMultiplier = G.upgradeMultiplier.mul(Decimal.sub(1, Decimal.add(player.antUpgrades[11 - 1]!, G.bonusant11).div(-125).pow_base(2)).mul(2).add(1))
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + player.researches[103] / 20)
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + player.researches[104] / 20)
  if (player.achievements[132] === 1) {
    G.upgradeMultiplier = G.upgradeMultiplier.mul(1.25)
  }
  if (player.achievements[137] === 1) {
    G.upgradeMultiplier = G.upgradeMultiplier.mul(1.25)
  }
  G.upgradeMultiplier = G.upgradeMultiplier.mul(G.effectiveRuneBlessingPower[3].mul(20/3).add(1))
  G.upgradeMultiplier = G.upgradeMultiplier.mul(CalcECC('reincarnation', player.challengecompletions[10]).mul(0.02).add(1))
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (1 / 50) * player.researches[122])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (3 / 100) * player.researches[133])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (2 / 100) * player.researches[163])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (1 / 100) * player.researches[193])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (1 / 10) * player.upgrades[79])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + (1 / 4) * player.upgrades[40])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(G.cubeBonusMultiplier[7])
  G.upgradeMultiplier = G.upgradeMultiplier.mul(1 + calculateEventBuff(BuffType.AntSacrifice))
  G.upgradeMultiplier = Decimal.min(1e300, G.upgradeMultiplier) // cap :3
}

interface IAntSacRewards {
  antSacrificePoints: Decimal
  offerings: Decimal
  obtainium: Decimal
  talismanShards: Decimal
  commonFragments: Decimal
  uncommonFragments: Decimal
  rareFragments: Decimal
  epicFragments: Decimal
  legendaryFragments: Decimal
  mythicalFragments: Decimal
}

export const calculateAntSacrificeRewards = (): IAntSacRewards => {
  calculateAntSacrificeELO()
  calculateAntSacrificeMultipliers()

  const maxCap = 1e300 // cap :3
  const rewardsMult = Decimal.min(maxCap, Decimal.mul(G.timeMultiplier, G.upgradeMultiplier))
  const rewards: IAntSacRewards = {
    antSacrificePoints: Decimal.mul(G.effectiveELO, rewardsMult).div(85),
    offerings: Decimal.min(
      maxCap,
      (Decimal.mul(player.offeringpersecond, G.effectiveELO).mul(0.15).mul(rewardsMult)).div(180)
    ),
    obtainium: Decimal.min(
      maxCap,
      (Decimal.mul(player.maxobtainiumpersecond, G.effectiveELO).mul(0.24).mul(rewardsMult)).div(180)
    ),
    talismanShards: G.antELO.gte(500)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(210)), 
              Decimal.pow(Decimal.mul((1 / 4), Decimal.max(0, G.effectiveELO.sub(500))), 2))
          )
        )
      )
      : new Decimal(0),
    commonFragments: G.antELO.gte(750)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(110)), 
              Decimal.pow(Decimal.mul((1 / 9), Decimal.max(0, G.effectiveELO.sub(750))), 1.83))
          )
        )
      )
      : new Decimal(0),
    uncommonFragments: G.antELO.gte(1000)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(170)), 
              Decimal.pow(Decimal.mul((1 / 16), Decimal.max(0, G.effectiveELO.sub(1000))), 1.66))
          )
        )
      )
      : new Decimal(0),
    rareFragments: G.antELO.gte(1500)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(200)), 
              Decimal.pow(Decimal.mul((1 / 25), Decimal.max(0, G.effectiveELO.sub(1500))), 1.5))
          )
        )
      )
      : new Decimal(0),
    epicFragments: G.antELO.gte(2000)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(200)), 
              Decimal.pow(Decimal.mul((1 / 36), Decimal.max(0, G.effectiveELO.sub(2000))), 1.33))
          )
        )
      )
      : new Decimal(0),
    legendaryFragments: G.antELO.gte(3000)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(230)), 
              Decimal.pow(Decimal.mul((1 / 49), Decimal.max(0, G.effectiveELO.sub(3000))), 1.16))
          )
        )
      )
      : new Decimal(0),
    mythicalFragments: G.antELO.gte(5000)
      ? Decimal.min(
        maxCap,
        Decimal.max(
          1,
          Decimal.floor(
            Decimal.mul((rewardsMult.div(220)), 
              Decimal.pow(Decimal.mul((1 / 64), Decimal.max(0, G.effectiveELO.sub(4150))), 1))
          )
        )
      )
      : new Decimal(0)
  }

  return rewards
}

export const timeWarp = async () => {
  const time = await Prompt(i18next.t('calculate.timePrompt'))
  const timeUse = Number(time)
  if (Number.isNaN(timeUse) || timeUse <= 0) {
    return Alert(i18next.t('calculate.timePromptError'))
  }

  DOMCacheGetOrSet('offlineContainer').style.display = 'flex'
  DOMCacheGetOrSet('offlineBlur').style.display = ''
  await calculateOffline(timeUse)
}

export const calculateOffline = async (forceTime = 0) => {
  disableHotkeys()

  G.timeWarp = true

  // Variable Declarations i guess
  const maximumTimer = 86400 * 3
    + 7200 * 2 * player.researches[31]
    + 7200 * 2 * player.researches[32]
  const updatedTime = Date.now()
  const timeAdd = Decimal.min(
    maximumTimer,
    Decimal.max(forceTime, (updatedTime - player.offlinetick) / 1000)
  )
  const timeTick = Decimal.div(timeAdd, 200)
  let resourceTicks = 200

  DOMCacheGetOrSet('offlineTimer').textContent = i18next.t(
    'calculate.offlineTimer',
    { value: format(timeAdd, 0) }
  )

  // May 11, 2021: I've revamped calculations for this significantly. Note to May 11 Platonic: Fuck off -May 15 Platonic
  // Some one-time tick things that are relatively important
  toggleTalismanBuy(player.buyTalismanShardPercent)
  updateTalismanInventory()

  const offlineDialog = player.offlinetick > 0

  player.offlinetick = player.offlinetick < 1.5e12 ? Date.now() : player.offlinetick

  G.timeMultiplier = calculateTimeAcceleration().mult
  calculateObtainium()
  const obtainiumGain = calculateAutomaticObtainium()

  const resetAdd = {
    prestige: Decimal.div(timeAdd, Decimal.max(0.01, player.fastestprestige)),
    transcension: Decimal.div(timeAdd, Decimal.max(0.01, player.fastesttranscend)),
    reincarnation: Decimal.div(timeAdd, Decimal.max(0.01, player.fastestreincarnate)),
    offering: Decimal.floor(timeAdd),
    obtainium: Decimal.mul(timeAdd, obtainiumGain).mul(G.timeMultiplier)
  }

  const timerAdd = {
    prestige: Decimal.mul(timeAdd, G.timeMultiplier),
    transcension: Decimal.mul(timeAdd, G.timeMultiplier),
    reincarnation: Decimal.mul(timeAdd, G.timeMultiplier),
    ants: Decimal.mul(timeAdd, G.timeMultiplier),
    antsReal: timeAdd,
    ascension: player.ascensionCounter, // Calculate this after the fact
    quarks: quarkHandler().gain // Calculate this after the fact
  }

  addTimers('ascension', timeAdd)
  addTimers('quarks', timeAdd)
  addTimers('goldenQuarks', timeAdd)
  addTimers('singularity', timeAdd)
  addTimers('octeracts', timeTick)
  addTimers('ambrosia', timeAdd)

  player.prestigeCount = player.prestigeCount.add(resetAdd.prestige)
  player.transcendCount = player.transcendCount.add(resetAdd.transcension)
  player.reincarnationCount = player.reincarnationCount.add(resetAdd.reincarnation)
  timerAdd.ascension = Decimal.sub(player.ascensionCounter, timerAdd.ascension)
  timerAdd.quarks = Decimal.sub(quarkHandler().gain, timerAdd.quarks)

  // 200 simulated all ticks [July 12, 2021]
  const runOffline = setInterval(() => {
    G.timeMultiplier = calculateTimeAcceleration().mult
    calculateObtainium()

    // Reset Stuff lmao!
    addTimers('prestige', timeTick)
    addTimers('transcension', timeTick)
    addTimers('reincarnation', timeTick)
    addTimers('octeracts', timeTick)

    resourceGain(Decimal.mul(timeTick, G.timeMultiplier))

    // Auto Obtainium Stuff
    if (player.researches[61] > 0 && player.currentChallenge.ascension !== 14) {
      automaticTools('addObtainium', timeTick)
    }

    // Auto Ant Sacrifice Stuff
    if (player.achievements[173] > 0) {
      automaticTools('antSacrifice', timeTick)
    }

    // Auto Offerings
    automaticTools('addOfferings', timeTick)
    // Auto Rune Sacrifice Stuff
    if (player.shopUpgrades.offeringAuto > 0 && player.autoSacrificeToggle) {
      automaticTools('runeSacrifice', timeTick)
    }

    if (resourceTicks % 5 === 1) {
      // 196, 191, ... , 6, 1 ticks remaining
      updateAll()
    }

    resourceTicks -= 1
    // Misc functions
    if (resourceTicks < 1) {
      clearInterval(runOffline)
      G.timeWarp = false
    }
  }, 0)

  DOMCacheGetOrSet('offlinePrestigeCountNumber').textContent = format(
    resetAdd.prestige,
    0,
    true
  )
  DOMCacheGetOrSet('offlinePrestigeTimer').innerHTML = i18next.t(
    'offlineProgress.currentPrestigeTimer',
    {
      value: format(timerAdd.prestige, 2, false)
    }
  )
  DOMCacheGetOrSet('offlineOfferingCount').innerHTML = i18next.t(
    'offlineProgress.offeringsGenerated',
    {
      value: format(resetAdd.offering, 0, true)
    }
  )
  DOMCacheGetOrSet('offlineTranscensionCount').innerHTML = i18next.t(
    'offlineProgress.transcensionCount',
    {
      value: format(resetAdd.transcension, 0, true)
    }
  )
  DOMCacheGetOrSet('offlineTranscensionTimer').innerHTML = i18next.t(
    'offlineProgress.currentTranscensionCounter',
    {
      value: format(timerAdd.transcension, 2, false)
    }
  )
  DOMCacheGetOrSet('offlineReincarnationCount').innerHTML = i18next.t(
    'offlineProgress.reincarnationCount',
    {
      value: format(resetAdd.reincarnation, 0, true)
    }
  )
  DOMCacheGetOrSet('offlineReincarnationTimer').innerHTML = i18next.t(
    'offlineProgress.currentReincarnationTimer',
    {
      value: format(timerAdd.reincarnation, 2, false)
    }
  )
  DOMCacheGetOrSet('offlineObtainiumCount').innerHTML = i18next.t(
    'offlineProgress.obtainiumGenerated',
    {
      value: format(resetAdd.obtainium, 0, true)
    }
  )
  DOMCacheGetOrSet('offlineAntTimer').innerHTML = i18next.t(
    'offlineProgress.ingameAntSacTimer',
    {
      value: format(timerAdd.ants, 2, false)
    }
  )
  DOMCacheGetOrSet('offlineRealAntTimer').innerHTML = i18next.t(
    'offlineProgress.realAntSacTimer',
    {
      value: format(timerAdd.antsReal, 2, true)
    }
  )
  DOMCacheGetOrSet('offlineAscensionTimer').innerHTML = i18next.t(
    'offlineProgress.currentAscensionTimer',
    {
      value: format(timerAdd.ascension, 2, true)
    }
  )
  DOMCacheGetOrSet('offlineQuarkCount').innerHTML = i18next.t(
    'offlineProgress.exportQuarks',
    {
      value: format(timerAdd.quarks, 0, true)
    }
  )

  DOMCacheGetOrSet('progressbardescription').textContent = i18next.t(
    'calculate.offlineEarnings'
  )

  player.offlinetick = updatedTime
  if (!player.loadedNov13Vers) {
    if (
      player.challengecompletions[14].gt(0)
      || player.highestchallengecompletions[14].gt(0)
    ) {
      const ascCount = player.ascensionCount
      reset('ascensionChallenge')
      player.ascensionCount = ascCount.add(1)
    }
    player.loadedNov13Vers = true
  }

  await saveSynergy()

  updateTalismanInventory()
  calculateObtainium()
  calculateAnts()
  calculateRuneLevels()

  // allow aesthetic offline progress
  if (offlineDialog) {
    const el = DOMCacheGetOrSet('notification')
    el.classList.add('slide-out')
    el.classList.remove('slide-in')
    document.body.classList.remove('scrollbar')
    document.body.classList.add('loading')
    DOMCacheGetOrSet('exitOffline').style.visibility = 'hidden'
    DOMCacheGetOrSet('offlineContainer').style.display = 'flex'
    DOMCacheGetOrSet('transparentBG').style.display = 'block'
  } else {
    exitOffline()
  }
}

export const exitOffline = () => {
  document.body.classList.remove('loading')
  document.body.classList.add('scrollbar')
  DOMCacheGetOrSet('transparentBG').style.display = 'none'
  DOMCacheGetOrSet('offlineContainer').style.display = 'none'
  DOMCacheGetOrSet('offlineBlur').style.display = 'none'
  enableHotkeys()
}

export const calculateSigmoid = (
  constant: number | Decimal,
  factor: number | Decimal,
  divisor: number | Decimal
) => {
  return Decimal.sub(constant, 1).mul(Decimal.sub(1, Decimal.pow(2, Decimal.neg(factor).div(divisor)))).add(1)
}

export const calculateSigmoidExponential = (
  constant: number | Decimal,
  coefficient: number | Decimal
) => {
  return Decimal.sub(constant, 1).mul(Decimal.sub(1, Decimal.neg(coefficient).exp())).add(1)
}


export const calculateCubeBlessings = () => {
  // The visual updates are handled in visualUpdateCubes()
  const cubeArray = [
    player.cubeBlessings.accelerator,
    player.cubeBlessings.multiplier,
    player.cubeBlessings.offering,
    player.cubeBlessings.runeExp,
    player.cubeBlessings.obtainium,
    player.cubeBlessings.antSpeed,
    player.cubeBlessings.antSacrifice,
    player.cubeBlessings.antELO,
    player.cubeBlessings.talismanBonus,
    player.cubeBlessings.globalSpeed
  ]
  const powerBonus = [
    player.cubeUpgrades[45].div(100),
    player.cubeUpgrades[35].div(100),
    player.cubeUpgrades[24].div(100),
    player.cubeUpgrades[14].div(100),
    player.cubeUpgrades[40].div(100),
    player.cubeUpgrades[22].div(40),
    player.cubeUpgrades[15].div(100),
    player.cubeUpgrades[25].div(100),
    player.cubeUpgrades[44].div(100),
    player.cubeUpgrades[34].div(100)
  ]

  for (let i = 1; i <= 10; i++) {
    let power = 1
    let mult = 1
    if (cubeArray[i - 1] >= 1000) {
      power = G.blessingDRPower[i]!
      mult *= Decimal.pow(
        1000,
        (1 - G.blessingDRPower[i]!) * (1 + powerBonus[i - 1])
      )
    }
    if (i === 6) {
      power = 2.25
      mult = 1
    }

    G.cubeBonusMultiplier[i] = Decimal.min(
      1e300,
      1
        + mult
          * G.blessingbase[i]!
          * Decimal.pow(cubeArray[i - 1], power * (1 + powerBonus[i - 1]))
          * G.tesseractBonusMultiplier[i]!
    )
  }
  calculateRuneLevels()
  calculateAntSacrificeELO()
  calculateObtainium()
}

export const calculateTotalOcteractCubeBonus = () => {
  if (player.singularityChallenges.noOcteracts.enabled) {
    return 1
  }
  if (player.totalWowOcteracts.lt(1000)) {
    const bonus = 1 + (2 / 1000) * player.totalWowOcteracts // At 1,000 returns 3
    return bonus > 1.00001 ? bonus : 1
  } else {
    const power = 2 + +player.singularityChallenges.noOcteracts.rewards.octeractPow
    return 3 * Decimal.pow(Decimal.log10(player.totalWowOcteracts) - 2, power) // At 1,000 returns 3
  }
}

export const calculateTotalOcteractQuarkBonus = () => {
  if (player.singularityChallenges.noOcteracts.enabled) {
    return 1
  }
  if (player.totalWowOcteracts.lt(1000)) {
    const bonus = 1 + (0.2 / 1000) * player.totalWowOcteracts // At 1,000 returns 1.20
    return bonus > 1.00001 ? bonus : 1
  } else {
    return 1.1 + 0.1 * (Decimal.log10(player.totalWowOcteracts) - 2) // At 1,000 returns 1.20
  }
}

export const calculateTotalOcteractOfferingBonus = () => {
  if (!player.singularityChallenges.noOcteracts.rewards.offeringBonus) {
    return 1
  }
  return Decimal.pow(calculateTotalOcteractQuarkBonus(), 1.5)
}

export const calculateTotalOcteractObtainiumBonus = () => {
  if (!player.singularityChallenges.noOcteracts.rewards.obtainiumBonus) {
    return 1
  }
  return Decimal.pow(calculateTotalOcteractQuarkBonus(), 1.4)
}

export const calculateAllCubeMultiplier = () => {
  const arr: (number | Decimal)[] = [
    // Ascension Time Multiplier to cubes
    Decimal.div(player.achievements[204], 4).add(Decimal.div(player.achievements[211], 4)).add(Decimal.div(player.achievements[218], 2)).mul(Decimal.max(0, player.ascensionCounter.div(10).sub(1))).add(1),
    // Sun and Moon achievements
    1
    + (6 / 100) * player.achievements[250]
    + (10 / 100) * player.achievements[251],
    // Speed Achievement
    calculateTimeAcceleration().mult.add(0.01).log10().mul(0.05).max(0.1).min(0.5).mul(player.achievements[240]).add(1),
    // Challenge 15: All Cube Gain bonuses 1-5
    new Decimal(G.challenge15Rewards.cube1)
    .mul(G.challenge15Rewards.cube2)
    .mul(G.challenge15Rewards.cube3)
    .mul(G.challenge15Rewards.cube4)
    .mul(G.challenge15Rewards.cube5),
    // Rune 6: Infinite Ascent
    calculateEffectiveIALevel().mul(0.01).add(1),
    // BETA: 2x Cubes
    1 + player.platonicUpgrades[10],
    // OMEGA: C9 Cube Bonus
    Decimal.pow(
      1.01,
      Decimal.mul(player.platonicUpgrades[15], player.challengecompletions[9])
    ),
    // Powder Bonus
    calculateCubeMultFromPowder(),
    // Event
    1 + calculateEventBuff(BuffType.Cubes),
    // Singularity Factor
    1 / calculateSingularityDebuff('Cubes'),
    // Wow Pass Y
    1 + (0.75 * player.shopUpgrades.seasonPassY) / 100,
    // BUY THIS! Golden Quark Upgrade
    1 + 4 * (player.singularityUpgrades.starterPack.getEffect().bonus ? 1 : 0),
    // Cube Flame [GQ]
    player.singularityUpgrades.singCubes1.getEffect().bonus,
    // Cube Blaze [GQ]
    player.singularityUpgrades.singCubes2.getEffect().bonus,
    // Cube Inferno [GQ]
    player.singularityUpgrades.singCubes3.getEffect().bonus,
    // Wow Pass Z
    1 + (player.shopUpgrades.seasonPassZ * player.singularityCount) / 100,
    // Cookie Upgrade 16
    player.cubeUpgrades[66].mul(1 - player.platonicUpgrades[15]).add(1),
    // Cookie Upgrade 8 (now actually works)
    player.cubeUpgrades[58].mul(G.isEvent ? 1 : 0).mul(0.25).add(1),
    // Wow Octeract Bonus
    calculateTotalOcteractCubeBonus(),
    // No Singularity Upgrades Challenge
    player.singularityChallenges.noSingularityUpgrades.rewards.cubes,
    // Singularity Citadel
    player.singularityUpgrades.singCitadel.getEffect().bonus,
    // Singularity Citadel 2
    player.singularityUpgrades.singCitadel2.getEffect().bonus,
    // Platonic DELTA
    Decimal.min(9, player.singularityCounter.div(3600 * 24)).mul(player.singularityUpgrades.platonicDelta.getEffect().bonus).add(1),
    // Wow Pass INF
    Decimal.pow(1.02, player.shopUpgrades.seasonPassInfinity),
    // Ambrosia Mult
    calculateAmbrosiaCubeMult(),
    // Module - Tutorial
    new Decimal(player.blueberryUpgrades.ambrosiaTutorial.bonus.cubes),
    // Module - Cubes 1
    new Decimal(player.blueberryUpgrades.ambrosiaCubes1.bonus.cubes),
    // Module - Luck-Cube 1
    new Decimal(player.blueberryUpgrades.ambrosiaLuckCube1.bonus.cubes),
    // Module - Quark-Cube 1
    new Decimal(player.blueberryUpgrades.ambrosiaQuarkCube1.bonus.cubes),
    // Module - Cubes 2
    new Decimal(player.blueberryUpgrades.ambrosiaCubes2.bonus.cubes),
    // Module - Hyperflux
    new Decimal(player.blueberryUpgrades.ambrosiaHyperflux.bonus.hyperFlux),
    // 20 Ascension Challenge - X20 Bonus
    +calculateEXALTBonusMult(),
    // Cash Grab Ultra
    +calculateCashGrabCubeBonus(),
    // EX Ultra
    +calculateEXUltraCubeBonus(),
    // Total Global Cube Multipliers: 33
  ]

  const extraMult = G.isEvent && G.eventClicked ? 1.05 : 1
  return {
    mult: Decimal.mul(productContentsDecimal(arr), extraMult),
    list: arr
  }
}

export const calculateCubeMultiplier = (score = new Decimal(-1)) => {
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const arr = [
    // Ascension Score Multiplier
    score.div(3000).root(4.1),
    // Global Multiplier
    calculateAllCubeMultiplier().mult,
    // Season Pass 1
    1 + (2.25 * player.shopUpgrades.seasonPass) / 100,
    // Researches (Excl 8x25)
    (1 + player.researches[119] / 400) // 5x19
    * (1 + player.researches[120] / 400) // 5x20
    * (1 + player.researches[137] / 100) // 6x12
    * (1 + (0.9 * player.researches[152]) / 100) // 7x2
    * (1 + (0.8 * player.researches[167]) / 100) // 7x17
    * (1 + (0.7 * player.researches[182]) / 100) // 8x7
    * (1
      + (0.03 / 100) * player.researches[192] * player.antUpgrades[12 - 1]!) // 8x17
    * (1 + (0.6 * player.researches[197]) / 100), // 8x22
    // Research 8x25
    1 + (0.004 / 100) * player.researches[200],
    // Cube Upgrades
    (1 + player.cubeUpgrades[1] / 6) // 1x1
    * (1 + player.cubeUpgrades[11] / 11) // 2x1
    * (1 + 0.4 * player.cubeUpgrades[30]), // 3x10
    // Constant Upgrade 10
    player.ascendShards.add(1).log(4).mul(Decimal.min(1, player.constantUpgrades[10])).mul(0.01).add(1),
    // Achievement 189 Bonus
    1 + player.achievements[189] * Decimal.min(2, player.ascensionCount / 2.5e8),
    // Achievement 193 Bonus
    player.ascendShards.add(1).log10().mul(player.achievements[193]).div(400).add(1),
    // Achievement 195 Bonus
    Decimal.min(
      250, player.ascendShards.add(1).log10().mul(player.achievements[195]).div(400).add(1)
    ),
    // Achievement 198-201 Bonus
    1
    + (4 / 100)
      * (player.achievements[198]
        + player.achievements[199]
        + player.achievements[200])
    + (3 / 100) * player.achievements[201],
    // Achievement 254 Bonus
    1
    + Decimal.min(0.15, (0.6 / 100) * score.add(1).log10())
      * player.achievements[254],
    // Spirit Power
    1 + (calculateCorruptionPoints() / 400) * G.effectiveRuneSpiritPower[2],
    // Platonic Cube Opening Bonus
    G.platonicBonusMultiplier[0],
    // Platonic 1x1
    1
    + 0.00009
      * sumContentsNumber(player.usedCorruptions)
      * player.platonicUpgrades[1],
    // Cube Upgrade 63 (Cx13)
    1
    + Decimal.pow(1.03, Decimal.log10(Decimal.max(1, player.wowAbyssals)))
      * player.cubeUpgrades[63]
    - player.cubeUpgrades[63]
    // Total Multipliers to cubes: 15
  ]

  // Decided to return a copy of list as well as the actual multiplier, instead of differentiating
  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateTesseractMultiplier = (score = new Decimal(-1)) => {
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const corrSum = sumContentsNumber(player.usedCorruptions.slice(2, 10))
  const arr = [
    // Ascension Score Multiplier
    Decimal.pow(Decimal.add(1, Decimal.max(0, score - 1e5) / 1e4), 0.35),
    // Global Multiplier
    calculateAllCubeMultiplier().mult,
    // Season Pass 1
    1 + (2.25 * player.shopUpgrades.seasonPass) / 100,
    // 10th Const Upgrade +Tesseract%
    player.ascendShards.add(1).log(4).mul(Decimal.min(1, player.constantUpgrades[10])).mul(0.01).add(1),
    // Cube Upgrade 3x10
    1 + 0.4 * player.cubeUpgrades[30],
    // Cube Upgrade 4x8
    1 + (1 / 200) * player.cubeUpgrades[38] * corrSum,
    // Achievement 195 Bonus
    Decimal.min(
      250,
      Decimal.mul(player.achievements[195], player.ascendShards.add(1).log10()).div(400)
    ).add(1),
    // Achievement 202 Bonus
    1 + player.achievements[202] * Decimal.min(2, player.ascensionCount / 5e8),
    // Achievement 205-208 Bonus
    1
    + (4 / 100)
      * (player.achievements[205]
        + player.achievements[206]
        + player.achievements[207])
    + (3 / 100) * player.achievements[208],
    // Achievement 255 Bonus
    1
    + Decimal.min(0.15, (0.6 / 100) * score.add(1).log10())
      * player.achievements[255],
    // Platonic Cube Bonus
    G.platonicBonusMultiplier[1],
    // Platonic Upgrade 1x2
    1 + 0.00018 * corrSum * player.platonicUpgrades[2]
    // Total Tesseract Multipliers: 12
  ]

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateHypercubeMultiplier = (score = new Decimal(-1)) => {
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const arr = [
    // Ascension Score Multiplier
    Decimal.pow(Decimal.add(1, Decimal.max(0, score - 1e9) / 1e8), 0.5),
    // Global Multiplier
    calculateAllCubeMultiplier().mult,
    // Season Pass 2
    1 + (1.5 * player.shopUpgrades.seasonPass2) / 100,
    // Achievement 212 - 215 Bonus
    1
    + (4 / 100)
      * (player.achievements[212]
        + player.achievements[213]
        + player.achievements[214])
    + (3 / 100) * player.achievements[215],
    // Achievement 216 Bonus
    1 + player.achievements[216] * Decimal.min(2, player.ascensionCount / 1e9),
    // Achievement 253 Bonus
    1 + (1 / 10) * player.achievements[253],
    // Achievement 256 Bonus
    1
    + Decimal.min(0.15, (0.6 / 100) * score.add(1).log10())
      * player.achievements[256],
    // Achievement 265 Bonus
    1 + Decimal.min(2, player.ascensionCount / 2.5e10) * player.achievements[265],
    // Platonic Cubes Opened Bonus
    G.platonicBonusMultiplier[2],
    // Platonic Upgrade 1x3
    1
    + 0.00054
      * sumContentsNumber(player.usedCorruptions)
      * player.platonicUpgrades[3],
    // Hyperreal Hepteract Bonus
    1 + (0.6 / 1000) * hepteractEffective('hyperrealism')
    // Total Hypercube Multipliers: 11
  ]

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculatePlatonicMultiplier = (score = new Decimal(-1)) => {
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const arr = [
    // Ascension Score Multiplier
    Decimal.pow(Decimal.add(1, Decimal.max(0, score - 2666e9) / 2666e8), 0.75),
    // Global Multipliers
    calculateAllCubeMultiplier().mult,
    // Season Pass 2
    1 + (1.5 * player.shopUpgrades.seasonPass2) / 100,
    // Achievement 196 Bonus
    1
    + Decimal.min(
      20,
      ((player.achievements[196] * 1) / 5000)
        * player.ascendShards.add(1).log10()
    ),
    // Achievement 219-222 Bonus
    1
    + (4 / 100)
      * (player.achievements[219]
        + player.achievements[220]
        + player.achievements[221])
    + (3 / 100) * player.achievements[222],
    // Achievement 223 Bonus
    1 + player.achievements[223] * Decimal.min(2, player.ascensionCount / 1.337e9),
    // Achievement 257 Bonus
    1
    + Decimal.min(0.15, (0.6 / 100) * score.add(1).log10())
      * player.achievements[257],
    // Platonic Cube Opening Bonus
    G.platonicBonusMultiplier[3],
    // Platonic Upgrade 1x4
    1 + (1.2 * player.platonicUpgrades[4]) / 50
    // Total Platonic Multipliers: 9
  ]

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateHepteractMultiplier = (score = new Decimal(-1)) => {
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const arr = [
    // Ascension Score Multiplier
    Decimal.pow(Decimal.add(1, Decimal.max(0, score - 1666e13) / 3333e13), 0.85),
    // Global Multiplier
    calculateAllCubeMultiplier().mult,
    // Season Pass 3
    1 + (1.5 * player.shopUpgrades.seasonPass3) / 100,
    // Achievement 258 Bonus
    1
    + Decimal.min(0.15, (0.6 / 100) * score.add(1).log10())
      * player.achievements[258],
    // Achievement 264 Bonus [Max: 8T Asc]
    1 + Decimal.min(0.4, player.ascensionCount / 2e13) * player.achievements[264],
    // Achievement 265 Bonus [Max: 160T Asc]
    1 + Decimal.min(0.2, player.ascensionCount / 8e14) * player.achievements[265],
    // Achievement 270 Bonus
    Decimal.min(
      2,
      1
        + (1 / 1000000)
          * player.ascendShards.add(1).log10()
          * player.achievements[270]
    )
    // Total Hepteract Multipliers: 7
  ]

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const getOcteractValueMultipliers = () => {
  const corruptionLevelSum = sumContentsNumber(player.usedCorruptions.slice(2, 10))
  return [
    1 + (1.5 * player.shopUpgrades.seasonPass3) / 100,
    1 + (0.75 * player.shopUpgrades.seasonPassY) / 100,
    1 + (player.shopUpgrades.seasonPassZ * player.singularityCount) / 100,
    1 + player.shopUpgrades.seasonPassLost / 1000,
    // cube upgrade 70, ie Cx20
    1 + (+(corruptionLevelSum >= 14 * 8) * player.cubeUpgrades[70]) / 10000,
    1
    + +(corruptionLevelSum >= 14 * 8)
      * +player.singularityUpgrades.divinePack.getEffect().bonus,
    // next three are flame/blaze/inferno
    +player.singularityUpgrades.singCubes1.getEffect().bonus,
    +player.singularityUpgrades.singCubes2.getEffect().bonus,
    +player.singularityUpgrades.singCubes3.getEffect().bonus,
    // absinthe through eighth wonder
    +player.singularityUpgrades.singOcteractGain.getEffect().bonus,
    +player.singularityUpgrades.singOcteractGain2.getEffect().bonus,
    +player.singularityUpgrades.singOcteractGain3.getEffect().bonus,
    +player.singularityUpgrades.singOcteractGain4.getEffect().bonus,
    +player.singularityUpgrades.singOcteractGain5.getEffect().bonus,
    // Patreon bonus
    1
    + (player.worlds.BONUS / 100)
      * +player.singularityUpgrades.singOcteractPatreonBonus.getEffect().bonus,
    // octeracts for dummies
    1 + 0.2 * +player.octeractUpgrades.octeractStarter.getEffect().bonus,
    // cogenesis and trigenesis
    +player.octeractUpgrades.octeractGain.getEffect().bonus,
    +player.octeractUpgrades.octeractGain2.getEffect().bonus,
    derpsmithCornucopiaBonus(),
    // digital octeract accumulator
    Decimal.pow(
      1
        + +player.octeractUpgrades.octeractAscensionsOcteractGain.getEffect()
          .bonus,
      1 + Decimal.floor(Decimal.log10(1 + player.ascensionCount))
    ),
    1 + calculateEventBuff(BuffType.Octeract),
    1
    + +player.singularityUpgrades.platonicDelta.getEffect().bonus
      * Decimal.min(9, player.singularityCounter / (3600 * 24)),
    // No Singulairty Upgrades
    +player.singularityChallenges.noSingularityUpgrades.rewards.cubes,
    // Wow Pass INF
    Decimal.pow(1.02, player.shopUpgrades.seasonPassInfinity),
    // Ambrosia Mult
    calculateAmbrosiaCubeMult(),
    // Module- Tutorial
    +player.blueberryUpgrades.ambrosiaTutorial.bonus.cubes,
    // Module- Cubes 1
    +player.blueberryUpgrades.ambrosiaCubes1.bonus.cubes,
    // Module- Luck-Cube 1
    +player.blueberryUpgrades.ambrosiaLuckCube1.bonus.cubes,
    // Module- Quark-Cube 1
    +player.blueberryUpgrades.ambrosiaQuarkCube1.bonus.cubes,
    // Module- Cubes 2
    +player.blueberryUpgrades.ambrosiaCubes2.bonus.cubes,
    // Cash Grab ULTRA
    +calculateCashGrabCubeBonus(),
    // EX ULTRA
    +calculateEXUltraCubeBonus(),
  ]
}

export const octeractGainPerSecond = () => {
  const SCOREREQ = 1e23
  const currentScore = calculateAscensionScore().effectiveScore

  const baseMultiplier = Decimal.gte(currentScore, SCOREREQ) ? Decimal.div(currentScore, SCOREREQ) : 0

  const valueMultipliers = getOcteractValueMultipliers()

  const ascensionSpeed = player.singularityUpgrades.oneMind.getEffect().bonus
    ? Decimal.pow(10, 1 / 2)
    : calculateAscensionAcceleration().sqrt()
  const oneMindModifier = player.singularityUpgrades.oneMind.getEffect().bonus
    ? Decimal.pow(
      calculateAscensionAcceleration().div(10),
      player.octeractUpgrades.octeractOneMindImprover.getEffect().bonus
    )
    : 1
  const extraMult = G.isEvent && G.eventClicked ? 1.05 : 1
  const perSecond = Decimal.mul(baseMultiplier, productContentsDecimal(valueMultipliers)).mul(ascensionSpeed).mul(oneMindModifier).mul(extraMult).div(24 * 3600 * 365 * 1e15)
  return perSecond
}

// This is an old calculation used only for Stats for Nerds
export const calculateOcteractMultiplier = (score = new Decimal(-1)) => {
  const SCOREREQ = 1e23
  if (score.lt(0)) {
    score = calculateAscensionScore().effectiveScore
  }

  const arr = getOcteractValueMultipliers()

  // add base score to the beginning and ascension speed mult to the end of the list
  arr.unshift(Decimal.gte(score, SCOREREQ) ? Decimal.div(score, SCOREREQ).toNumber() : 0)
  const ascensionSpeed = calculateAscensionAcceleration()

  const ascensionSpeedMulti = player.singularityUpgrades.oneMind.getEffect()
      .bonus
    ? Decimal.pow(10, 1 / 2)
      * Decimal.pow(
        ascensionSpeed / 10,
        +player.octeractUpgrades.octeractOneMindImprover.getEffect().bonus
      )
    : Decimal.pow(ascensionSpeed, 1 / 2)
  arr.push(ascensionSpeedMulti)

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateTimeAcceleration = () => {
  const preCorruptionArr = [
    1 + (1 / 300) * Decimal.log10(player.maxobtainium.add(1)) * player.upgrades[70], // Particle upgrade 2x5
    1 + player.researches[121] / 50, // research 5x21
    1 + 0.015 * player.researches[136], // research 6x11
    1 + 0.012 * player.researches[151], // research 7x1
    1 + 0.009 * player.researches[166], // research 7x16
    1 + 0.006 * player.researches[181], // research 8x6
    1 + 0.003 * player.researches[196], // research 8x21
    1 + 8 * G.effectiveRuneBlessingPower[1], // speed blessing
    1 + (calculateCorruptionPoints() / 400) * G.effectiveRuneSpiritPower[1], // speed SPIRIT
    G.cubeBonusMultiplier[10], // Chronos cube blessing
    1 + player.cubeUpgrades[18] / 5, // cube upgrade 2x8
    calculateSigmoid(2, player.antUpgrades[12 - 1]! + G.bonusant12, 69), // ant 12
    1 + 0.1 * (player.talismanRarity[2 - 1] - 1), // Chronos Talisman bonus
    G.challenge15Rewards.globalSpeed, // Challenge 15 reward
    1 + 0.01 * player.cubeUpgrades[52] // cube upgrade 6x2 (Cx2)
  ]

  // Global Speed softcap + Corruption / Corruption-like effects
  const corruptionArr: (number | Decimal)[] = [
    G.lazinessMultiplier[player.usedCorruptions[3]] // Corruption:  Spacial Dilation
  ]

  const corruptableTimeMult = productContentsDecimal(preCorruptionArr).mul(corruptionArr[0]) // DR applies after base corruption.

  if (corruptableTimeMult.gt(100)) {
    const postSoftcap = corruptableTimeMult.sqrt().mul(10)
    const softcapRatio = Decimal.div(postSoftcap, corruptableTimeMult)

    corruptionArr.push(softcapRatio)
  } else {
    corruptionArr.push(new Decimal(1))
  }

  if (corruptableTimeMult.lt(1)) {
    const postPlat2x2 = corruptableTimeMult.pow(1 - player.platonicUpgrades[7] / 30)
    const plat2x2Ratio = Decimal.div(postPlat2x2, corruptableTimeMult)

    corruptionArr.push(plat2x2Ratio)
  } else {
    corruptionArr.push(new Decimal(1))
  }

  corruptionArr.push(Decimal.recip(calculateSingularityDebuff('Global Speed')))

  // Uncorruptable effects
  const postCorruptionArr = [
    G.platonicBonusMultiplier[7], // Chronos statue
    1 + (player.singularityUpgrades.intermediatePack.getEffect().bonus ? 1 : 0),
    1
    + +player.octeractUpgrades.octeractImprovedGlobalSpeed.getEffect().bonus
      * player.singularityCount
  ]

  const timeMult = productContentsDecimal(preCorruptionArr).mul(productContentsDecimal(corruptionArr)).mul(productContentsDecimal(postCorruptionArr))

  if (player.usedCorruptions[3] >= 6 && player.achievements[241] < 1) {
    achievementaward(241)
  }
  if (timeMult.gt(3600) && player.achievements[242] < 1) {
    achievementaward(242)
  }

  return {
    preList: preCorruptionArr,
    drList: corruptionArr,
    postList: postCorruptionArr,
    mult: timeMult
  }
}

export const calculateLimitedAscensionsDebuff = () => {
  if (!player.singularityChallenges.limitedAscensions.enabled) {
    return new Decimal(1)
  } else {
    let exponent = player.ascensionCount
      .sub(Decimal.max(
        0,
        Decimal.sub(20, player.singularityChallenges.limitedAscensions.completions)
      ))
    exponent = Decimal.max(0, exponent)
    return Decimal.pow(2, exponent)
  }
}

export const calculateAscensionSpeedMultiplier = () => {
  const arr = [
    1 + (1.2 / 100) * player.shopUpgrades.chronometer, // Chronometer
    1 + (0.6 / 100) * player.shopUpgrades.chronometer2, // Chronometer 2
    1 + (1.5 / 100) * player.shopUpgrades.chronometer3, // Chronometer 3
    1 + (0.6 / 1000) * hepteractEffective('chronos'), // Chronos Hepteract
    Decimal.log10(player.ascensionCount.add(1)).mul(0.0001).min(0.1).mul(player.achievements[262]).add(1), // Achievement 262 Bonus
    Decimal.log10(player.ascensionCount.add(1)).mul(0.0001).min(0.1).mul(player.achievements[263]).add(1), // Achievement 263 Bonus
    sumContentsDecimal(player.usedCorruptions).mul(player.platonicUpgrades[15]).mul(0.002).add(1), // Platonic Omega
    G.challenge15Rewards.ascensionSpeed, // Challenge 15 Reward
    player.cubeUpgrades[59].mul(0.0025).add(1), // Cookie Upgrade 9
    1
    + 0.5
      * (player.singularityUpgrades.intermediatePack.getEffect().bonus ? 1 : 0), // Intermediate Pack, Sing Shop
    1 + (1 / 1000) * player.singularityCount * player.shopUpgrades.chronometerZ, // Chronometer Z
    1
    + +player.octeractUpgrades.octeractImprovedAscensionSpeed.getEffect()
        .bonus
      * player.singularityCount, // Abstract Photokinetics, Oct Upg
    1
    + +player.octeractUpgrades.octeractImprovedAscensionSpeed2.getEffect()
        .bonus
      * player.singularityCount, // Abstract Exokinetics, Oct Upg
    1 + calculateEventBuff(BuffType.AscensionSpeed), // Event
    player.singularityUpgrades.singAscensionSpeed2.level > 0
      && player.runelevels[6].lt(1)
      ? 6
      : 1, // A mediocre ascension speedup!
    Decimal.pow(1.01, player.shopUpgrades.chronometerInfinity), // Chronometer INF
    calculateLimitedAscensionsDebuff().recip(), // EXALT Debuff
    Decimal.pow(
      1
        + player.singularityChallenges.limitedAscensions.rewards
          .ascensionSpeedMult,
      Decimal.max(0, Decimal.floor(Decimal.log10(player.ascensionCount))).add(1)
    ) // EXALT Buff                                                                                                 // EXALT Buff
  ]

  // A hecking good ascension speedup!
  const baseMultiplier = productContentsDecimal(arr)
  const exponent = player.singularityUpgrades.singAscensionSpeed.level > 0
    ? baseMultiplier.gt(1)
      ? 1.03
      : 0.97
    : 1
  arr.push(baseMultiplier.pow(exponent).div(baseMultiplier))

  // Singularity Penalty
  arr.push(1 / calculateSingularityDebuff('Ascension Speed'))

  let multiplier = productContentsDecimal(arr)
  if (!Decimal.isFinite(multiplier)) {
    multiplier = new Decimal(0)
  }

  return {
    list: arr,
    mult: multiplier
  }
}

export const calculateAscensionAcceleration = () => {
  return calculateAscensionSpeedMultiplier().mult
}

export const calculateSingularityQuarkMilestoneMultiplier = () => {
  let multiplier = 1
  // dprint-ignore
  const singThresholds = [
    5, 7, 10, 20, 35, 50, 65, 80, 90, 100, 121, 144, 150, 160, 166, 169, 170,
    175, 180, 190, 196, 200, 201, 202, 203, 204, 205, 210, 212, 214, 216, 218,
    220, 225, 250, 255, 260, 261, 262,
  ];
  for (const sing of singThresholds) {
    if (player.highestSingularityCount >= sing) {
      multiplier *= 1.05
    }
  }

  if (player.highestSingularityCount >= 200) {
    multiplier *= Decimal.pow((player.highestSingularityCount - 179) / 20, 2)
  }

  return multiplier
}

export const calculateQuarkMultiplier = () => {
  let multiplier = 1
  if (player.achievementPoints > 0) {
    // Achievement Points
    multiplier += player.achievementPoints / 25000 // Cap of +0.20 at 5,000 Pts
  }
  if (player.achievements[250] > 0) {
    // Max research 8x25
    multiplier += 0.1
  }
  if (player.achievements[251] > 0) {
    // Max Wow! Cube Upgrade 5x10
    multiplier += 0.1
  }
  if (player.platonicUpgrades[5] > 0) {
    // Platonic ALPHA upgrade
    multiplier += 0.2
  }
  if (player.platonicUpgrades[10] > 0) {
    // Platonic BETA Upgrade
    multiplier += 0.25
  }
  if (player.platonicUpgrades[15] > 0) {
    // Platonic OMEGA upgrade
    multiplier += 0.3
  }
  if (player.challenge15Exponent.gte(1e11)) {
    // Challenge 15: Exceed 1e11 exponent reward
    multiplier += G.challenge15Rewards.quarks.sub(1).toNumber() // not yet
  }
  if (player.shopUpgrades.infiniteAscent) {
    // Purchased Infinite Ascent Rune
    multiplier *= 1.1 + (0.15 / 75) * calculateEffectiveIALevel()
  }
  if (player.challenge15Exponent.gte(1e15)) {
    // Challenge 15: Exceed 1e15 exponent reward
    multiplier *= 1 + (5 / 10000) * hepteractEffective('quark')
  }
  if (player.overfluxPowder.gt(0)) {
    // Overflux Powder [Max: 10% at 10,000]
    multiplier *= calculateQuarkMultFromPowder()
  }
  if (player.achievements[266] > 0) {
    // Achievement 266 [Max: 10% at 1Qa Ascensions]
    multiplier *= 1 + Decimal.min(0.1, player.ascensionCount / 1e16)
  }
  if (player.singularityCount > 0) {
    // Singularity Modifier
    multiplier *= 1 + player.singularityCount / 10
  }
  if (G.isEvent) {
    multiplier *= 1
      + calculateEventBuff(BuffType.Quark)
      + calculateEventBuff(BuffType.OneMind)
  }
  if (player.cubeUpgrades[53].gt(0)) {
    // Cube Upgrade 6x3 (Cx3)
    multiplier *= 1 + (0.1 * player.cubeUpgrades[53]) / 100
  }
  if (player.cubeUpgrades[68].gt(0)) {
    // Cube Upgrade 7x8
    multiplier *= 1
      + (1 / 10000) * player.cubeUpgrades[68]
      + 0.05 * Decimal.floor(player.cubeUpgrades[68] / 1000)
  }

  multiplier *= calculateSingularityQuarkMilestoneMultiplier()

  multiplier *= +player.octeractUpgrades.octeractQuarkGain.getEffect().bonus // Oct Improver 1
  multiplier *= 1 + 0.3 * +player.octeractUpgrades.octeractStarter.getEffect().bonus // Oct Starter Pack

  multiplier *= 1
    + (1 / 10000)
      * Decimal.floor(player.octeractUpgrades.octeractQuarkGain.level / 111)
      * player.octeractUpgrades.octeractQuarkGain2.level
      * Decimal.floor(1 + Decimal.log10(Decimal.max(1, player.hepteractCrafts.quark.BAL))) // Improver 2

  multiplier *= 1
    + 0.02 * player.singularityUpgrades.intermediatePack.level // 1.02
    + 0.04 * player.singularityUpgrades.advancedPack.level // 1.06
    + 0.06 * player.singularityUpgrades.expertPack.level // 1.12
    + 0.08 * player.singularityUpgrades.masterPack.level // 1.20
    + 0.1 * player.singularityUpgrades.divinePack.level // 1.30

  multiplier *= 1 + +player.singularityUpgrades.singQuarkImprover1.getEffect().bonus // Doohickey
  multiplier *= calculateTotalOcteractQuarkBonus()

  multiplier *= calculateAmbrosiaQuarkMult()
  multiplier *= +player.blueberryUpgrades.ambrosiaTutorial.bonus.quarks
  multiplier *= +player.blueberryUpgrades.ambrosiaQuarks1.bonus.quarks
  multiplier *= +player.blueberryUpgrades.ambrosiaCubeQuark1.bonus.quarks
  multiplier *= +player.blueberryUpgrades.ambrosiaLuckQuark1.bonus.quarks
  multiplier *= +player.blueberryUpgrades.ambrosiaQuarks2.bonus.quarks
  multiplier *= calculateCashGrabQuarkBonus()

  if (player.highestSingularityCount === 0) {
    multiplier *= 1.25
  }

  return multiplier
}

/**
 * Calculate the number of Golden Quarks earned in current singularity
 */
export const calculateGoldenQuarkMultiplier = (computeMultiplier = false) => {
  const base = 2 * player.singularityCount + 10

  let bonus = player.singularityCount < 10 ? 200 - 10 * player.singularityCount : 0
  if (player.singularityCount === 0) {
    bonus += 200
  }

  let perkMultiplier = 1
  if (player.highestSingularityCount >= 200) {
    perkMultiplier = 3
  }
  if (player.highestSingularityCount >= 208) {
    perkMultiplier = 5
  }
  if (player.highestSingularityCount >= 221) {
    perkMultiplier = 8
  }

  const arr = [
    player.challenge15Exponent.add(1).log10().sub(20).max(0).div(2).add(1), // Challenge 15 Exponent
    1 + player.worlds.BONUS / 100, // Patreon Bonus
    +player.singularityUpgrades.goldenQuarks1.getEffect().bonus, // Golden Quarks I
    player.cubeUpgrades[69].mul(0.12).add(1), // Cookie Upgrade 19
    +player.singularityChallenges.noSingularityUpgrades.rewards.goldenQuarks, // No Singularity Upgrades
    1 + calculateEventBuff(BuffType.GoldenQuark), // Event
    1 + getFastForwardTotalMultiplier(), // Singularity Fast Forwards
    player.highestSingularityCount >= 100
      ? Decimal.min(1, player.highestSingularityCount / 250).add(1)
      : 1, // Golden Revolution II
    perkMultiplier // Immaculate Alchemy
  ]

  // Total Quarks Coefficient
  arr.push(
    computeMultiplier
      ? 1 / 1e5
      : Decimal.div((Decimal.mul((base + player.quarksThisSingularity / 1e5), productContentsDecimal(arr)).add(bonus)), productContentsDecimal(arr))
  )

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateGoldenQuarkGain = (computeMultiplier = false): number => {
  return calculateGoldenQuarkMultiplier(computeMultiplier).mult.toNumber() // nope not yet
}

export const calculateCorruptionPoints = () => {
  let basePoints = new Decimal(400)
  const bonusLevel = player.singularityUpgrades.corruptionFifteen.getEffect()
      .bonus
    ? 1
    : 0

  for (let i = 1; i <= 9; i++) {
    basePoints = basePoints.add(Decimal.pow(player.usedCorruptions[i] + bonusLevel, 2).mul(16))
  }

  return basePoints
}

export const calculateSummationLinearDecimal = (
  baseLevel: number | Decimal,
  baseCost: number | Decimal,
  resourceAvailable: number | Decimal,
  differenceCap = 1e9
): [Decimal, Decimal] => {
  const subtractCost = Decimal.mul(baseLevel, Decimal.add(baseLevel, 1)).mul(baseCost).div(2)
  const buyToLevel = Decimal.min(
    Decimal.add(baseLevel, differenceCap),
    Decimal.add(resourceAvailable, subtractCost).mul(2).div(baseCost).add(0.25).sqrt().sub(0.5).floor()
    
  )
  const realCost = buyToLevel.mul(buyToLevel.add(1)).mul(baseCost).div(2).sub(subtractCost)

  return [buyToLevel, realCost]
}

// If you want to sum from a baseline level baseLevel to some level where the cost per level is base * (1 + level * diffPerLevel), this finds out how many total levels you can buy.
export const calculateSummationNonLinearDecimal = (
  baseLevel: number | Decimal,
  baseCost: number | Decimal,
  resourceAvailable: number | Decimal,
  diffPerLevel: number | Decimal,
  buyAmount: number | Decimal
): { levelCanBuy: Decimal; cost: Decimal } => {
  const c = Decimal.div(diffPerLevel, 2)
  resourceAvailable = resourceAvailable || 0
  const alreadySpent = c.mul(Decimal.pow(baseLevel, 2)).add(Decimal.mul(baseLevel, Decimal.sub(1, c))).mul(baseCost)
  resourceAvailable = Decimal.add(resourceAvailable, alreadySpent)
  const v = Decimal.div(resourceAvailable, baseCost)
  let buyToLevel = c.gt(0)
    ? Decimal.max(
      0,
      Decimal.floor(
        c.sub(1).div(c.mul(2)).add(Decimal.sub(1, c).pow(2).add(c.mul(v).mul(4)).sqrt().div(c.mul(2)))
      )
    )
    : Decimal.floor(v)

  buyToLevel = Decimal.min(buyToLevel, Decimal.add(buyAmount, baseLevel))
  buyToLevel = Decimal.max(buyToLevel, baseLevel)
  let totalCost = c.mul(buyToLevel.pow(2)).add(Decimal.mul(buyToLevel, Decimal.sub(1, c))).mul(baseCost).sub(alreadySpent)
  if (Decimal.eq(buyToLevel, baseLevel)) {
    totalCost = c.mul(baseLevel).mul(2).add(1).mul(baseCost)
  }
  return {
    levelCanBuy: buyToLevel,
    cost: totalCost
  }
}

export const calculateSummationCubicDecimal = (n: number | Decimal) => {
  if (Decimal.lt(n, 0)) {
    return new Decimal(-1)
  }
  if (!Decimal.floor(n).eq(n)) {
    return new Decimal(-1)
  }

  return Decimal.add(n, 1).mul(n).div(2).pow(2)
}

/**
 * Solves a*n^2 + b*n + c = 0 for real solutions.
 * @param a Coefficient of n^2. Must be nonzero!
 * @param b Coefficient of n.
 * @param c Coefficient of constant term
 * @param positive Boolean which if true makes solution use positive discriminant.
 * @returns Positive root of the quadratic, if it exists, and positive is true, otherwise false
 */
export const solveQuadraticNumber = (
  a: number,
  b: number,
  c: number,
  positive: boolean
) => {
  if (a < 0) {
    throw new Error(String(i18next.t('calculate.quadraticImproperError')))
  }
  const determinant = Math.pow(b, 2) - 4 * a * c
  if (determinant < 0) {
    throw new Error(String(i18next.t('calculate.quadraticDeterminantError')))
  }

  if (determinant === 0) {
    return -b / (2 * a)
  }
  const numeratorPos = -b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)
  const numeratorNeg = -b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)

  if (positive) {
    return numeratorPos / (2 * a)
  } else {
    return numeratorNeg / (2 * a)
  }
}

export const solveQuadraticDecimal = (
  a: number | Decimal,
  b: number | Decimal,
  c: number | Decimal,
  positive: boolean
) => {
  if (Decimal.lt(a, 0)) {
    throw new Error(String(i18next.t('calculate.quadraticImproperError')))
  }
  const determinant = Decimal.pow(b, 2).sub(Decimal.mul(a, c).mul(4))
  if (determinant.lt(0)) {
    throw new Error(String(i18next.t('calculate.quadraticDeterminantError')))
  }

  if (determinant.eq(0)) {
    return Decimal.div(Decimal.neg(b), Decimal.mul(a, 2))
  }
  const numeratorPos = Decimal.sqrt(Decimal.pow(b, 2).sub(Decimal.mul(a, c).mul(4))).sub(b)
  const numeratorNeg = Decimal.sqrt(Decimal.pow(b, 2).sub(Decimal.mul(a, c).mul(4))).neg().sub(b)

  if (positive) {
    return Decimal.div(numeratorPos, Decimal.mul(2, a))
  } else {
    return Decimal.div(numeratorNeg, Decimal.mul(2, a))
  }
}

export const calculateCubicSumDataDecimal = (
  initialLevel: number | Decimal,
  baseCost: number | Decimal,
  amountToSpend: number | Decimal,
  maxLevel: number | Decimal
): { levelCanBuy: Decimal; cost: Decimal } => {
  if (Decimal.gte(initialLevel, maxLevel)) {
    return {
      levelCanBuy: new Decimal(maxLevel),
      cost: new Decimal(0)
    }
  }
  const alreadySpent = Decimal.mul(baseCost, calculateSummationCubicDecimal(initialLevel))
  const totalToSpend = Decimal.add(alreadySpent, amountToSpend)

  // Solves (n(n+1)/2)^2 * baseCost = totalToSpend
  /* Create a det = Sqrt(totalToSpend / baseCost)
   *  Simplification gives n * (n+1) = 2 * det
   *  We can rewrite as n^2 + n - 2 * det = 0 and solve for n.
   */
  if (totalToSpend.lt(0)) {
    throw new Error(String(i18next.t('calculate.cubicSumNegativeError')))
  }

  const determinantRoot = Decimal.div(totalToSpend, baseCost).sqrt() // Assume nonnegative!
  const solution = solveQuadraticDecimal(1, 1, determinantRoot.mul(-2), true)

  const levelToBuy = Decimal.max(
    Decimal.min(maxLevel, Decimal.floor(solution)),
    initialLevel
  )
  const realCost = Decimal.eq(levelToBuy, initialLevel)
    ? Decimal.mul(baseCost, Decimal.pow(Decimal.add(initialLevel, 1), 3))
    : Decimal.mul(baseCost, calculateSummationCubicDecimal(levelToBuy).sub(alreadySpent))

  return {
    levelCanBuy: levelToBuy,
    cost: realCost
  }
}

// IDEA: Rework this shit to be friendly for Stats for Nerds
/* May 25, 2021 - Platonic
    Reorganize this function to make sense, because right now it aint
    What I did was use the separation of cube gain method on other cube types, and made some methods their
    own function (specifically: calc of effective score and other global multipliers) to make it easy.
*/

export const computeAscensionScoreBonusMultiplier = () => {
  let multiplier = new Decimal(1)
  multiplier = multiplier.mul(G.challenge15Rewards.score)
  multiplier = multiplier.mul(G.platonicBonusMultiplier[6])

  if (player.cubeUpgrades[21].gt(0)) {
    multiplier = multiplier.mul(player.cubeUpgrades[21].mul(0.05).add(1))
  }
  if (player.cubeUpgrades[31].gt(0)) {
    multiplier = multiplier.mul(player.cubeUpgrades[31].mul(0.05).add(1))
  }
  if (player.cubeUpgrades[41].gt(0)) {
    multiplier = multiplier.mul(player.cubeUpgrades[41].mul(0.05).add(1))
  }
  if (player.achievements[267] > 0) {
    multiplier = multiplier.mul(player.ascendShards.add(1).log10().div(1e5).min(1).add(1))
  }
  if (player.achievements[259] > 0) {
    multiplier = multiplier.mul(Decimal.max(
      1,
      Decimal.pow(1.01, Math.log2(player.hepteractCrafts.abyss.CAP))
    ))
  }
  if (G.isEvent) {
    multiplier = multiplier.mul(1 + calculateEventBuff(BuffType.AscensionScore))
  }

  return multiplier
}

export const calculateAscensionScore = () => {
  let baseScore = new Decimal(0)
  let corruptionMultiplier = 1
  let effectiveScore = new Decimal(0)

  let bonusLevel = player.singularityUpgrades.corruptionFifteen.getEffect()
      .bonus
    ? 1
    : 0
  bonusLevel += player.singularityChallenges.oneChallengeCap.rewards.freeCorruptionLevel
  // Init Arrays with challenge values :)
  const challengeScoreArrays1 = [new Decimal(0), new Decimal(8), new Decimal(10), new Decimal(12), new Decimal(15), new Decimal(20), new Decimal(60), new Decimal(80), new Decimal(120), new Decimal(180),   new Decimal(300)]
  const challengeScoreArrays2 = [new Decimal(0), new Decimal(10), new Decimal(12), new Decimal(15), new Decimal(20), new Decimal(30), new Decimal(80), new Decimal(120), new Decimal(180), new Decimal(300), new Decimal(450)]
  const challengeScoreArrays3 = [
    new Decimal(0),
    new Decimal(20),
    new Decimal(30),
    new Decimal(50),
    new Decimal(100),
    new Decimal(200),
    new Decimal(250),
    new Decimal(300),
    new Decimal(400),
    new Decimal(500),
    new Decimal(750)
  ]
  const challengeScoreArrays4 = [
    new Decimal(0),
    new Decimal(10000),
    new Decimal(10000),
    new Decimal(10000),
    new Decimal(10000),
    new Decimal(10000),
    new Decimal(2000),
    new Decimal(3000),
    new Decimal(4000),
    new Decimal(5000),
    new Decimal(7500)
  ]

  challengeScoreArrays1[1] = Decimal.add(challengeScoreArrays1[1], player.cubeUpgrades[56])
  challengeScoreArrays1[2] = Decimal.add(challengeScoreArrays1[2], player.cubeUpgrades[56])
  challengeScoreArrays1[3] = Decimal.add(challengeScoreArrays1[3], player.cubeUpgrades[56])

  // Iterate challenges 1 through 10 and award base score according to the array values
  // Transcend Challenge: First Threshold at 75 completions, second at 750
  // Reincarnation Challenge: First at 25, second at 60. It probably should be higher but Platonic is a dumb dumb
  for (let i = 1; i <= 10; i++) {
    baseScore = baseScore.add(Decimal.mul(challengeScoreArrays1[i], player.highestchallengecompletions[i]))
    if (i <= 5 && player.highestchallengecompletions[i].gte(75)) {
      baseScore = baseScore.add(challengeScoreArrays2[i].mul(player.highestchallengecompletions[i].sub(75)))
      if (player.highestchallengecompletions[i].gte(750)) {
        baseScore = baseScore.add(challengeScoreArrays3[i]
          .mul(player.highestchallengecompletions[i].sub(750)))
      }
      if (player.highestchallengecompletions[i].gte(9000)) {
        baseScore = baseScore.add(challengeScoreArrays4[i]
          .mul(player.highestchallengecompletions[i].sub(9000)))
      }
    }
    if (i <= 10 && i > 5 && player.highestchallengecompletions[i].gte(25)) {
      baseScore = baseScore.add(challengeScoreArrays2[i].mul(player.highestchallengecompletions[i].sub(25)))
      if (player.highestchallengecompletions[i].gte(60)) {
        baseScore = baseScore.add(challengeScoreArrays3[i]
          .mul(player.highestchallengecompletions[i].sub(60)))
      }
    }
  }

  // Calculation of Challenge 10 Exponent (It gives a constant multiplier per completion)
  // 1.03 +
  // 0.005 from Cube 3x9 +
  // 0.0025 from Platonic ALPHA (Plat 1x5)
  // 0.005 from Platonic BETA (Plat 2x5)
  // Max: 1.0425
  baseScore = baseScore.mul(Decimal.pow(
    player.cubeUpgrades[39].mul(0.005).add(Decimal.add(player.platonicUpgrades[5], player.platonicUpgrades[10]).mul(0.0025)).add(1.03),
    player.highestchallengecompletions[10]
  ))
  // Corruption Multiplier is the product of all Corruption Score multipliers based on used corruptions
  let bonusVal = player.singularityUpgrades.advancedPack.getEffect().bonus
    ? 0.33
    : 0
  bonusVal += +player.singularityChallenges.oneChallengeCap.rewards.corrScoreIncrease
  for (let i = 2; i < 10; i++) {
    const exponent = i === 2 && player.usedCorruptions[i] >= 10
      ? 1
        + 2 * Decimal.min(1, player.platonicUpgrades[17])
        + 0.04 * player.platonicUpgrades[17]
      : 1
    corruptionMultiplier *= Decimal.pow(
      G.corruptionPointMultipliers[player.usedCorruptions[i] + bonusLevel],
      exponent
    ) + bonusVal

    if (
      player.usedCorruptions[i] >= 14
      && player.singularityUpgrades.masterPack.getEffect().bonus
    ) {
      corruptionMultiplier *= 1.1
    }
  }

  const bonusMultiplier = computeAscensionScoreBonusMultiplier()

  effectiveScore = Decimal.mul(baseScore, corruptionMultiplier).mul(bonusMultiplier)
  if (effectiveScore.gt(1e23)) {
    effectiveScore = effectiveScore.div(1e23).sqrt().mul(1e23)
  }

  player.singularityUpgrades.expertPack.getEffect().bonus
    ? (effectiveScore = effectiveScore.mul(1.5))
    : (effectiveScore)

  return {
    baseScore,
    corruptionMultiplier,
    bonusMultiplier,
    effectiveScore
  }
}

export const CalcCorruptionStuff = () => {
  let cubeBank = new Decimal(0)
  let challengeModifier = 1
  const scores = calculateAscensionScore()

  const baseScore = scores.baseScore
  const corruptionMultiplier = scores.corruptionMultiplier
  const bonusMultiplier = scores.bonusMultiplier
  const effectiveScore = scores.effectiveScore

  for (let i = 1; i <= 10; i++) {
    challengeModifier = i >= 6 ? 2 : 1
    cubeBank = cubeBank.add(Decimal.mul(challengeModifier, player.highestchallengecompletions[i])) 
  }

  const oneMindModifier = player.singularityUpgrades.oneMind.getEffect().bonus
    ? calculateAscensionAcceleration().div(10)
    : 1

  // Calculation of Cubes :)
  let cubeGain = cubeBank
  cubeGain = cubeGain.mul(calculateCubeMultiplier(effectiveScore).mult)
  cubeGain = cubeGain.mul(oneMindModifier)

  const bonusCubeExponent = player.singularityUpgrades.platonicTau.getEffect()
      .bonus
    ? 1.01
    : 1
  cubeGain = Decimal.pow(cubeGain, bonusCubeExponent)

  // Calculation of Tesseracts :))
  let tesseractGain = new Decimal(1)
  if (effectiveScore.gte(1e5)) {
    tesseractGain = tesseractGain.add(0.5)
  }
  tesseractGain = tesseractGain.mul(calculateTesseractMultiplier(effectiveScore).mult)
  tesseractGain = tesseractGain.mul(oneMindModifier)

  // Calculation of Hypercubes :)))
  let hypercubeGain = effectiveScore.gte(1e9) ? new Decimal(1) : new Decimal(0)
  hypercubeGain = hypercubeGain.mul(calculateHypercubeMultiplier(effectiveScore).mult)
  hypercubeGain = hypercubeGain.mul(oneMindModifier)

  // Calculation of Platonic Cubes :))))
  let platonicGain = effectiveScore.gte(2.666e12) ? new Decimal(1) : new Decimal(0)
  platonicGain = platonicGain.mul(calculatePlatonicMultiplier(effectiveScore).mult)
  platonicGain = platonicGain.mul(oneMindModifier)

  // Calculation of Hepteracts :)))))
  let hepteractGain = G.challenge15Rewards.hepteractUnlocked
      && effectiveScore.gte(1.666e17)
      && player.achievements[255] > 0
    ? new Decimal(1) : new Decimal(0)
  hepteractGain = hepteractGain.mul(calculateHepteractMultiplier(effectiveScore).mult)
  hepteractGain = hepteractGain.mul(oneMindModifier)

  return [
    cubeBank,
    Decimal.floor(baseScore),
    corruptionMultiplier,
    Decimal.floor(effectiveScore),
    Decimal.min(1e300, Decimal.floor(cubeGain)),
    Decimal.min(
      1e300,
      Decimal.max(player.singularityCount, Decimal.floor(tesseractGain))
    ),
    Decimal.min(1e300, Decimal.floor(hypercubeGain)),
    Decimal.min(1e300, Decimal.floor(platonicGain)),
    Decimal.min(1e300, Decimal.floor(hepteractGain)),
    bonusMultiplier
  ]
}

export const calcAscensionCount = () => {
  let ascCount = new Decimal(1)

  if (player.singularityChallenges.limitedAscensions.enabled) {
    return ascCount
  }

  if (player.challengecompletions[10].gt(0) && player.achievements[197] === 1) {
    const { effectiveScore } = calculateAscensionScore()

    if (player.ascensionCounter.gte(10)) {
      if (player.achievements[188] > 0) {
        ascCount = ascCount.add(99)
      }

      ascCount = ascCount.mul(
        (player.ascensionCounter.div(10).sub(1)).mul(0.2).mul(player.achievements[189]
          + player.achievements[202]
          + player.achievements[209]
          + player.achievements[216]
          + player.achievements[223]).add(1))
    }

    ascCount = ascCount.mul(player.achievements[187] && Decimal.floor(effectiveScore).gt(1e8)
      ? Decimal.log10(Decimal.floor(effectiveScore).add(1)).sub(1)
      : 1)
    ascCount = ascCount.mul(G.challenge15Rewards.ascensions)
    ascCount = ascCount.mul(player.achievements[260] > 0 ? 1.1 : 1)
    ascCount = ascCount.mul(player.achievements[261] > 0 ? 1.1 : 1)
    ascCount = ascCount.mul(player.platonicUpgrades[15] > 0 ? 2 : 1)
    ascCount = ascCount.mul(1 + 0.02 * player.platonicUpgrades[16])
    ascCount = ascCount.mul(Decimal.min(1, player.overfluxPowder.div(100000)).mul(player.platonicUpgrades[16]).mul(0.02).add(1))
    ascCount = ascCount.mul(1 + player.singularityCount / 10)
    ascCount = ascCount.mul(+player.singularityUpgrades.ascensions.getEffect().bonus)
    ascCount = ascCount.mul(+player.octeractUpgrades.octeractAscensions.getEffect().bonus)
    ascCount = ascCount.mul(+player.octeractUpgrades.octeractAscensions2.getEffect().bonus)
    ascCount = ascCount.mul(player.singularityUpgrades.oneMind.getEffect().bonus
      ? calculateAscensionAcceleration().div(10)
      : 1)
  }

  return Decimal.floor(ascCount)
}

/**
 * Calculates the product of all Powder bonuses.
 * @returns The amount of Powder gained per Expired Orb on day reset
 */
export const calculatePowderConversion = () => {
  const arr = [
    1 / 100, // base
    G.challenge15Rewards.powder, // Challenge 15: Powder Bonus
    1 + player.shopUpgrades.powderEX / 50, // powderEX shop upgrade, 2% per level max 20%
    1 + player.achievements[256] / 20, // Achievement 256, 5%
    1 + player.achievements[257] / 20, // Achievement 257, 5%
    1 + 0.01 * player.platonicUpgrades[16], // Platonic Upgrade 4x1
    1 + calculateEventBuff(BuffType.PowderConversion) // Event
  ]

  return {
    list: arr,
    mult: productContentsDecimal(arr)
  }
}

export const calculateCubeQuarkMultiplier = () => {
  return (
    (calculateSigmoid(2, Decimal.pow(player.overfluxOrbs, 0.5), 40)
      .add(calculateSigmoid(1.5, Decimal.pow(player.overfluxOrbs, 0.5), 160))
      .add(calculateSigmoid(1.5, Decimal.pow(player.overfluxOrbs, 0.5), 640))
      .add(calculateSigmoid(
        1.15,
        (player.highestSingularityCount >= 1) ? new Decimal(1) : new Decimal(0).mul(Decimal.pow(player.overfluxOrbs, 0.45)),
        2560
      ))
      .add(calculateSigmoid(
        1.15,
        (player.highestSingularityCount >= 2) ? new Decimal(1) : new Decimal(0).mul(Decimal.pow(player.overfluxOrbs, 0.4)),
        10000
      ))
      .add(calculateSigmoid(
        1.25,
        (player.highestSingularityCount >= 5) ? new Decimal(1) : new Decimal(0).mul(Decimal.pow(player.overfluxOrbs, 0.35)),
        40000
      ))
      .add(calculateSigmoid(
        1.25,
        (player.highestSingularityCount >= 10 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.32)),
        160000
      ))
      .add(calculateSigmoid(
        1.35,
        (player.highestSingularityCount >= 15 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.27)),
        640000
      ))
      .add(calculateSigmoid(
        1.45,
        (player.highestSingularityCount >= 20 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.24)),
        2e6
      ))
      .add(calculateSigmoid(
        1.55,
        (player.highestSingularityCount >= 25 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.21)),
        1e7
      ))
      .add(calculateSigmoid(
        1.85,
        (player.highestSingularityCount >= 30 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.18)),
        4e7
      ))
      .add(calculateSigmoid(
        3,
        (player.highestSingularityCount >= 35 ? new Decimal(1) : new Decimal(0)).mul(Decimal.pow(player.overfluxOrbs, 0.15)),
        1e8
      ))
      .sub(11))
    .mul(1 + (1 / 500) * player.shopUpgrades.cubeToQuarkAll)
    .mul(player.autoWarpCheck ? 1 + player.dailyPowderResetUses : 1)
  )
}

export const calculateCubeMultFromPowder = () => {
  return player.overfluxPowder.gt(10000)
    ? Decimal.pow(Decimal.log10(player.overfluxPowder), 2).div(16).add(1)
    : player.overfluxPowder.div(10000).add(1)
}

export const calculateQuarkMultFromPowder = () => {
  return player.overfluxPowder.gt(10000)
    ? Decimal.log10(player.overfluxPowder).div(40).add(1)
    : player.overfluxPowder.div(100000).add(1)
}

export const calculateSingularityAmbrosiaLuckMilestoneBonus = () => {
  let bonus = 0
  const singThresholds1 = [35, 42, 49, 56, 63, 70, 77]
  const singThresholds2 = [135, 142, 149, 156, 163, 170, 177]

  for (const sing of singThresholds1) {
    if (player.highestSingularityCount >= sing) {
      bonus += 5
    }
  }

  for (const sing of singThresholds2) {
    if (player.highestSingularityCount >= sing) {
      bonus += 6
    }
  }

  return bonus
}

export const calculateAmbrosiaGenerationShopUpgrade = () => {
  const multipliers = [
    1 + player.shopUpgrades.shopAmbrosiaGeneration1 / 100,
    1 + player.shopUpgrades.shopAmbrosiaGeneration2 / 100,
    1 + player.shopUpgrades.shopAmbrosiaGeneration3 / 100,
    1 + player.shopUpgrades.shopAmbrosiaGeneration4 / 1000
  ]

  return productContentsNumber(multipliers)
}

export const calculateAmbrosiaLuckShopUpgrade = () => {
  const vals = [
    2 * player.shopUpgrades.shopAmbrosiaLuck1,
    2 * player.shopUpgrades.shopAmbrosiaLuck2,
    2 * player.shopUpgrades.shopAmbrosiaLuck3,
    0.6 * player.shopUpgrades.shopAmbrosiaLuck4
  ]

  return sumContentsNumber(vals)
}

export const calculateAmbrosiaGenerationSingularityUpgrade = () => {
  const vals = [
    +player.singularityUpgrades.singAmbrosiaGeneration.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaGeneration2.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaGeneration3.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaGeneration4.getEffect().bonus
  ]

  return productContentsNumber(vals)
}

export const calculateAmbrosiaLuckSingularityUpgrade = () => {
  const vals = [
    +player.singularityUpgrades.singAmbrosiaLuck.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaLuck2.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaLuck3.getEffect().bonus,
    +player.singularityUpgrades.singAmbrosiaLuck4.getEffect().bonus
  ]

  return sumContentsNumber(vals)
}

export const calculateAmbrosiaGenerationOcteractUpgrade = () => {
  const vals = [
    +player.octeractUpgrades.octeractAmbrosiaGeneration.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaGeneration2.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaGeneration3.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaGeneration4.getEffect().bonus
  ]

  return productContentsNumber(vals)
}

export const calculateAmbrosiaLuckOcteractUpgrade = () => {
  const vals = [
    +player.octeractUpgrades.octeractAmbrosiaLuck.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaLuck2.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaLuck3.getEffect().bonus,
    +player.octeractUpgrades.octeractAmbrosiaLuck4.getEffect().bonus
  ]

  return sumContentsNumber(vals)
}

export const calculateRequiredBlueberryTime = () => {
  let val = G.TIME_PER_AMBROSIA // Currently 600
  val += Decimal.floor(player.lifetimeAmbrosia / 30)

  const baseVal = val

  const timeThresholds = [
    5000,
    25000,
    75000,
    250000,
    500000,
    1e6,
    2e6,
    4e6,
    1e7,
    2e7,
    4e7,
    1e8
  ]
  for (const threshold of timeThresholds) {
    if (baseVal >= threshold) {
      val *= 2
    }
  }
  return val
}

export const calculateSingularityMilestoneBlueberries = () => {
  let val = 0
  if (player.highestSingularityCount >= 270) val = 5
  else if (player.highestSingularityCount >= 256) val = 4
  else if (player.highestSingularityCount >= 192) val = 3
  else if (player.highestSingularityCount >= 128) val = 2
  else if (player.highestSingularityCount >= 64) val = 1

  return val
}

export const calculateAmbrosiaCubeMult = () => {
  const effectiveAmbrosia = (player.singularityChallenges.noAmbrosiaUpgrades.enabled) ? 0 : player.lifetimeAmbrosia
  let multiplier = new Decimal(1)
  multiplier = multiplier.add(Decimal.min(1.5, Decimal.floor(effectiveAmbrosia / 66) / 100))
  if (effectiveAmbrosia >= 10000) {
    multiplier = multiplier.add(Decimal.min(
      1.5,
      Decimal.floor(effectiveAmbrosia / 666) / 100
    ))
  }
  if (effectiveAmbrosia >= 100000) {
    multiplier = multiplier.add(Decimal.floor(effectiveAmbrosia / 6666) / 100)
  }

  return multiplier
}

export const calculateAmbrosiaQuarkMult = () => {
  const effectiveAmbrosia = (player.singularityChallenges.noAmbrosiaUpgrades.enabled) ? 0 : player.lifetimeAmbrosia
  let multiplier = new Decimal(1)
  multiplier = multiplier.add(Decimal.min(0.3, Decimal.floor(effectiveAmbrosia / 1666) / 100))
  if (effectiveAmbrosia >= 50000) {
    multiplier = multiplier.add(Decimal.min(
      0.3,
      Decimal.floor(effectiveAmbrosia / 16666) / 100
    ))
  }
  if (effectiveAmbrosia >= 500000) {
    multiplier = multiplier.add(Decimal.floor(effectiveAmbrosia / 166666) / 100)
  }

  return multiplier
}

export const calculateCashGrabBonus = (extra: number) => {
  return Decimal.min(1, Decimal.pow(Decimal.div(player.lifetimeAmbrosia, 1e7), 1/3)).mul(extra).mul(player.shopUpgrades.shopCashGrabUltra).add(1)
}

export const calculateCashGrabBlueberryBonus = () => {
  return calculateCashGrabBonus(CASH_GRAB_ULTRA_BLUEBERRY)
}

export const calculateCashGrabCubeBonus = () => {
  return calculateCashGrabBonus(CASH_GRAB_ULTRA_CUBE)
}

export const calculateCashGrabQuarkBonus = () => {
  return calculateCashGrabBonus(CASH_GRAB_ULTRA_QUARK)
}

export const calculateEXUltraBonus = (extra: number) => {
  return Decimal.min(player.shopUpgrades.shopEXUltra, Decimal.floor(player.lifetimeAmbrosia / 1000).div(125)).mul(extra).add(1)
}

export const calculateEXUltraOfferingBonus = () => {
  return calculateEXUltraBonus(EX_ULTRA_OFFERING)
}

export const calculateEXUltraObtainiumBonus = () => {
  return calculateEXUltraBonus(EX_ULTRA_OBTAINIUM)
}

export const calculateEXUltraCubeBonus = () => {
  return calculateEXUltraBonus(EX_ULTRA_CUBES)
}

export const calculateEXALTBonusMult = () => {
  if (!player.singularityChallenges.limitedAscensions.rewards.exaltBonus)
    return 1

  if (G.currentSingChallenge !== undefined) {
    return Decimal.pow(1.04, player.singularityChallenges[G.currentSingChallenge].completions)
  }
    return 1
}

export const calculateDilatedFiveLeafBonus = () => {
  const singThresholds = [100, 200, 250, 260, 266]
  for (let i = 0; i < singThresholds.length; i++) {
    if (player.highestSingularityCount <= singThresholds[i]) return i / 100
  }

  return singThresholds.length / 100
}

export const dailyResetCheck = () => {
  if (!player.dayCheck) {
    return
  }
  const now = new Date(getTimePinnedToLoadDate())
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  player.dayTimer = 60 * 60 * 24 - 60 * 60 * h - 60 * m - s

  // Daily is not reset even if it is set to a past time.
  // If the daily is not reset, the data may have been set to a future time.
  if (day.getTime() - 3600000 > player.dayCheck.getTime()) {
    player.dayCheck = day

    forcedDailyReset(true)
    player.dailyPowderResetUses = 1 + player.shopUpgrades.extraWarp
    player.dailyCodeUsed = false

    DOMCacheGetOrSet('cubeQuarksOpenRequirement').style.display = 'block'
    if (player.challengecompletions[11].gt(0)) {
      DOMCacheGetOrSet('tesseractQuarksOpenRequirement').style.display = 'block'
    }
    if (player.challengecompletions[13].gt(0)) {
      DOMCacheGetOrSet('hypercubeQuarksOpenRequirement').style.display = 'block'
    }
    if (player.challengecompletions[14].gt(0)) {
      DOMCacheGetOrSet('platonicCubeQuarksOpenRequirement').style.display = 'block'
    }
  }
}

/**
 * Resets Cube Counts and stuff. NOTE: It is intentional it does not award powder or expire orbs.
 */
export const forcedDailyReset = (rewards = false) => {
  player.cubeQuarkDaily = 0
  player.tesseractQuarkDaily = 0
  player.hypercubeQuarkDaily = 0
  player.platonicCubeQuarkDaily = 0
  player.cubeOpenedDaily = 0
  player.tesseractOpenedDaily = 0
  player.hypercubeOpenedDaily = 0
  player.platonicCubeOpenedDaily = 0

  if (rewards) {
    player.overfluxPowder = player.overfluxPowder.add(player.overfluxOrbs.mul(calculatePowderConversion().mult))
    player.overfluxOrbs = G.challenge15Rewards.freeOrbs
  }
}

export const calculateEventBuff = (buff: BuffType) => {
  if (!G.isEvent) {
    return 0
  }
  return calculateEventSourceBuff(buff)
}

export const derpsmithCornucopiaBonus = () => {
  let counter = 0
  const singCounts = [
    18,
    38,
    58,
    78,
    88,
    98,
    118,
    148,
    178,
    188,
    198,
    208,
    218,
    228,
    238,
    248
  ]
  for (const sing of singCounts) {
    if (player.highestSingularityCount >= sing) {
      counter += 1
    }
  }

  return 1 + (counter * player.highestSingularityCount) / 100
}
