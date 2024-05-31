import {
  calculateCorruptionPoints,
  calculateEffectiveIALevel,
  calculateMaxRunes,
  calculateOfferings,
  calculateRuneExpGiven,
  calculateRuneExpToLevel,
  calculateRuneLevels
} from './Calculate'
import { format, player } from './Synergism'
import { Globals as G } from './Variables'

import Decimal from 'break_eternity.js'
import i18next, { type StringMap } from 'i18next'
import { DOMCacheGetOrSet } from './Cache/DOM'
import type { resetNames } from './types/Synergism'

export const displayRuneInformation = (i: number, updatelevelup = true) => {
  const m = G.effectiveLevelMult
  const SILevelMult = 1
    + player.researches[84] / 200 * (1 + 1 * G.effectiveRuneSpiritPower[5] * calculateCorruptionPoints() / 400)
  const amountPerOffering = calculateRuneExpGiven(i - 1, false, player.runelevels[i - 1])

  let options: StringMap

  if (i === 1) {
    options = {
      bonus: format(Decimal.floor(Decimal.pow(Decimal.mul(G.rune1level, m).div(4), 1.25))),
      percent: format(Decimal.mul(G.rune1level, m).div(4), 2, true),
      boost: format(Decimal.floor(Decimal.mul(G.rune1level, m).div(20)))
    }
  } else if (i === 2) {
    options = {
      mult1: format(Decimal.floor(Decimal.mul(G.rune2level, m).div(10)).mul(Decimal.floor(Decimal.mul(G.rune2level, m).div(10).add(1))).div(2)),
      mult2: format(Decimal.mul(m, G.rune2level).div(4), 1, true),
      tax: Decimal.sub(1, Decimal.mul(G.rune2level, m).div(-1000).pow_base(6)).mul(99.9).toNumber().toPrecision(4)
    }
  } else if (i === 3) {
    options = {
      mult: format(Decimal.pow(Decimal.mul(G.rune3level, m).div(2), 2).times(Decimal.pow(2, Decimal.mul(G.rune3level, m).div(2).sub(8))).add(1), 3),
      gain: format(Decimal.floor(Decimal.mul(G.rune3level, m).div(16)))
    }
  } else if (i === 4) {
    options = {
      delay: Decimal.mul(G.rune4level, m).div(8).toNumber().toPrecision(3),
      chance: Decimal.min(25, Decimal.div(G.rune4level, 16)),
      tax: Decimal.sub(1, Decimal.sub(400, G.rune4level).div(1100).min(0).pow_base(4)).mul(99).toNumber().toPrecision(4)
    }
  } else if (i === 5) {
    options = {
      gain: format(Decimal.mul(G.rune5level, m).mul(SILevelMult).div(200).add(1), 2, true),
      speed: format(Decimal.pow(Decimal.mul(G.rune5level, m).mul(SILevelMult), 2).div(2500).add(1)),
      offerings: format(Decimal.mul(G.rune5level, m).mul(SILevelMult).div(200), 3, true)
    }
  } else if (i === 6) {
    options = {
      percent1: format(calculateEffectiveIALevel().mul(15/75).add(10), 1, true),
      percent2: format(calculateEffectiveIALevel(), 0, true)
    }
  } else if (i === 7 && updatelevelup) {
    options = { exp: format(Decimal.add(player.singularityCount, 1).mul(1e256)) }
  }

  if (updatelevelup) {
    DOMCacheGetOrSet('runeshowlevelup').textContent = i18next.t(`runes.levelup.${i}`, options!)
  }

  DOMCacheGetOrSet(`runeshowpower${i}`).textContent = i18next.t(`runes.power.${i}`, options!)

  if (updatelevelup) {
    const arr = calculateOfferingsToLevelXTimes(i - 1, player.runelevels[i - 1], player.offeringbuyamount)
    let offerings = 0
    let j = 0
    while (j < arr.length && (Decimal.lte(offerings + arr[j], player.runeshards) || j === 0)) {
      offerings += arr[j]
      j++
    }
    const s = j === 1 ? 'once' : `${j} times`

    DOMCacheGetOrSet('runeDisplayInfo').textContent = i18next.t('runes.perOfferingText', {
      exp: format(amountPerOffering),
      x: format(offerings),
      y: s
    })
  }
}

export const resetofferings = (input: resetNames) => {
  player.runeshards = Decimal.min(1e300, Decimal.add(player.runeshards, calculateOfferings(input)))
}

export const unlockedRune = (runeIndexPlusOne: number) => {
  // Whether or not a rune is unlocked array
  const unlockedRune = [
    false,
    true,
    player.achievements[38] > 0.5,
    player.achievements[44] > 0.5,
    player.achievements[102] > 0.5,
    player.researches[82] > 0.5,
    player.shopUpgrades.infiniteAscent,
    player.platonicUpgrades[20] > 0
  ]
  return unlockedRune[runeIndexPlusOne]
}

/**
 * checkMaxRunes returns how many unique runes are at the maximum level.
 * Does not take in params, returns a number equal to number of maxed runes.
 */
export const checkMaxRunes = (runeIndex: number) => {
  let maxed = 0
  for (let i = 0; i < runeIndex; i++) {
    if (!unlockedRune(i + 1) || Decimal.gte(player.runelevels[i], calculateMaxRunes(i + 1))) {
      maxed++
    }
  }
  return maxed
}

export const redeemShards = (runeIndexPlusOne: number, auto = false, cubeUpgraded = new Decimal(0)) => {
  // if automated && 2x10 cube upgrade bought, this will be >0.
  // runeIndex, the rune being added to
  const runeIndex = runeIndexPlusOne - 1

  let levelsToAdd = new Decimal(player.offeringbuyamount)
  if (auto) {
    levelsToAdd = Decimal.pow(2, player.shopUpgrades.offeringAuto)
  }
  if (auto && cubeUpgraded.gt(0)) {
    levelsToAdd = Decimal.min(1e4, calculateMaxRunes(runeIndex + 1)) // limit to max 10k levels per call so the execution doesn't take too long if things get stuck
  }
  let levelsAdded = 0
  if (
    player.runeshards.gt(0) && player.runelevels[runeIndex].lt(calculateMaxRunes(runeIndex + 1))
    && unlockedRune(runeIndex + 1)
  ) {
    let all = new Decimal(0)
    const maxLevel = calculateMaxRunes(runeIndex + 1)
    const amountArr = calculateOfferingsToLevelXTimes(runeIndex, player.runelevels[runeIndex], levelsToAdd)
    let toSpendTotal = Decimal.min(player.runeshards, amountArr.reduce((x, y) => x + y, 0))
    if (cubeUpgraded.gt(0)) {
      toSpendTotal = Decimal.min(player.runeshards, cubeUpgraded)
    }
    const fact = calculateRuneExpGiven(runeIndex, false, player.runelevels[runeIndex], true)
    const a = player.upgrades[71] / 25
    const add = fact[0] - a * player.runelevels[runeIndex]
    const mult = fact.slice(1, fact.length).reduce((x, y) => x * y, 1)
    while (toSpendTotal.gt(0) && levelsAdded < levelsToAdd && player.runelevels[runeIndex] < maxLevel) {
      const exp = calculateRuneExpToLevel(runeIndex, player.runelevels[runeIndex]) - player.runeexp[runeIndex]
      const expPerOff = Math.min(1e300, (add + a * player.runelevels[runeIndex]) * mult)
      let toSpend = Decimal.min(toSpendTotal, Math.ceil(exp / expPerOff))
      if (Decimal.isNaN(toSpend)) {
        toSpend = toSpendTotal
      }
      toSpendTotal = toSpendTotal.sub(toSpend)
      player.runeshards = player.runeshards.sub(toSpend)
      player.runeexp[runeIndex] = player.runeexp[runeIndex].add(Decimal.mul(toSpend, expPerOff))
      all = all.add(toSpend)
      while (
        player.runeexp[runeIndex].gte(calculateRuneExpToLevel(runeIndex)) && player.runelevels[runeIndex].lt(maxLevel)
      ) {
        player.runelevels[runeIndex] = player.runelevels[runeIndex].add(1)
        levelsAdded++
      }
    }
    for (let runeToUpdate = 0; runeToUpdate < 5; ++runeToUpdate) {
      if (unlockedRune(runeToUpdate + 1)) {
        if (runeToUpdate !== runeIndex) {
          player.runeexp[runeToUpdate] = player.runeexp[runeToUpdate].add(all * calculateRuneExpGiven(runeToUpdate, true))
        }
        while (
          player.runeexp[runeToUpdate].gte(calculateRuneExpToLevel(runeToUpdate))
          && player.runelevels[runeToUpdate].lt(calculateMaxRunes(runeToUpdate + 1))
        ) {
          player.runelevels[runeToUpdate] = player.runelevels[runeToUpdate].add(1)
        }
      }
    }
    if (!auto) {
      displayRuneInformation(runeIndexPlusOne)
    }
  }
  calculateRuneLevels()
  if (player.runeshards.lt(0) || !player.runeshards) {
    player.runeshards.eq(0)
  }
}

export const calculateOfferingsToLevelXTimes = (runeIndex: number, runeLevel: Decimal, levels: number) => {
  let exp = Decimal.sub(calculateRuneExpToLevel(runeIndex, runeLevel), player.runeexp[runeIndex])
  const maxLevel = calculateMaxRunes(runeIndex + 1)
  const arr = []
  let sum = 0
  const off = player.runeshards
  let levelsAdded = 0
  const fact = calculateRuneExpGiven(runeIndex, false, runeLevel, true)
  const a = player.upgrades[71] / 25
  const add = fact[0] - a * runeLevel
  const mult = fact.slice(1, fact.length).reduce((x, y) => x * y, 1)
  while (levelsAdded < levels && Decimal.add(runeLevel, levelsAdded) < maxLevel && sum < off) {
    const expPerOff = (add + a * (Decimal.add(runeLevel, levelsAdded))) * mult
    const amount = Math.ceil(exp / expPerOff)
    sum += amount
    arr.push(amount)
    levelsAdded += 1
    exp = calculateRuneExpToLevel(runeIndex, Decimal.add(runeLevel, levelsAdded))
      - calculateRuneExpToLevel(runeIndex, Decimal.add(runeLevel, levelsAdded) - 1)
  }
  return arr
}
