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
import type { OneToFive, resetNames } from './types/Synergism'

export const thriftRuneEffect = () => {
  let i = getRuneEffective(4)
  i = i.div(800).add(1).ln()
  return i
}

export const siEffective = () => {
  let i = Decimal.mul(player.researches[84], Decimal.mul(G.effectiveRuneSpiritPower[5], calculateCorruptionPoints()).div(400).add(1))
  i = i.div(200).add(1)
  return i
}

export const getRuneEffective = (id: OneToFive) => {
  let i = G[`rune${id}level`]
  i = Decimal.mul(i, G.effectiveLevelMult)
  if (id === 5) {
    i = i.mul(siEffective())
  }
  return i
}

export const displayRuneInformation = (i: number, updatelevelup = true) => {
  const amountPerOffering = calculateRuneExpGiven(i - 1, false, player.runelevels[i - 1])

  let options: StringMap

  if (i === 1) {
    options = {
      bonus: format(Decimal.floor(Decimal.pow(getRuneEffective(1).div(4), 1.5))),
      percent: format(getRuneEffective(1).div(2), 2, true),
      boost: format(Decimal.floor(getRuneEffective(1).div(10)))
    }
  } else if (i === 2) {
    options = {
      mult1: format(Decimal.floor(getRuneEffective(2).div(10)).mul(Decimal.floor(getRuneEffective(2).div(10).add(1))).div(2)),
      mult2: format(getRuneEffective(2).div(4), 1, true),
      tax: Decimal.sub(1, getRuneEffective(2).div(-1000).pow_base(6)).mul(99.9).toNumber().toPrecision(4)
    }
  } else if (i === 3) {
    options = {
      mult: format(Decimal.pow(getRuneEffective(3).div(2), 2).times(Decimal.pow(2, getRuneEffective(3).div(2).sub(8))).add(1), 3),
      gain: format(Decimal.floor(getRuneEffective(3).div(16)))
    }
  } else if (i === 4) {
    options = {
      delay: format(thriftRuneEffect().mul(100), 3),
      chance: Decimal.min(25, Decimal.div(G.rune4level, 16)),
      tax: Decimal.sub(1, Decimal.sub(400, G.rune4level).div(1100).min(0).pow_base(4)).mul(99).toNumber().toPrecision(4)
    }
  } else if (i === 5) {
    options = {
      gain: format(getRuneEffective(5).div(200).add(1), 2, true),
      speed: format(Decimal.pow(getRuneEffective(5), 2).div(2500).add(1)),
      offerings: format(getRuneEffective(5).div(200), 3, true)
    }
  } else if (i === 6) {
    options = {
      percent1: format(calculateEffectiveIALevel().mul(0.2).add(10), 1, true),
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
    let offerings = new Decimal(0)
    let j = 0
    while (j < arr.length && (Decimal.lte(Decimal.add(offerings, arr[j]), player.runeshards) || j === 0)) {
      offerings = offerings.add(arr[j])
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
  player.runeshards = Decimal.add(player.runeshards, calculateOfferings(input))
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
  if (player.runeshards.gt(0) && Decimal.lt(player.runelevels[runeIndex], calculateMaxRunes(runeIndex + 1))&& unlockedRune(runeIndex + 1)) {
    let all = new Decimal(0)
    const maxLevel = calculateMaxRunes(runeIndex + 1)
    const amountArr = calculateOfferingsToLevelXTimes(runeIndex, player.runelevels[runeIndex], levelsToAdd)
    let toSpendTotal = Decimal.min(player.runeshards, amountArr.reduce((x, y) => Decimal.add(x, y), new Decimal(0)))
    if (cubeUpgraded.gt(0)) {
      toSpendTotal = Decimal.min(player.runeshards, cubeUpgraded)
    }
    const fact = calculateRuneExpGiven(runeIndex, false, player.runelevels[runeIndex], true)
    const a = player.upgrades[71] / 25
    const add =  Decimal.sub(fact[0], Decimal.mul(player.runelevels[runeIndex], a))
    const mult = fact.slice(1, fact.length).reduce((x, y) => x * y, 1)
    while (toSpendTotal.gt(0) && Decimal.lt(levelsAdded, levelsToAdd) && Decimal.lt(player.runelevels[runeIndex], maxLevel)) {
      const exp = Decimal.sub(calculateRuneExpToLevel(runeIndex, player.runelevels[runeIndex]), player.runeexp[runeIndex])
      const expPerOff = Decimal.mul(player.runelevels[runeIndex], a).add(add).mul(mult)
      let toSpend = Decimal.min(toSpendTotal, Decimal.ceil(Decimal.div(exp, expPerOff)))
      if (Decimal.isNaN(toSpend)) {
        toSpend = toSpendTotal
      }
      toSpendTotal = toSpendTotal.sub(toSpend)
      player.runeshards = player.runeshards.sub(toSpend)
      player.runeexp[runeIndex] = Decimal.add(player.runeexp[runeIndex], Decimal.mul(toSpend, expPerOff))
      all = all.add(toSpend)
      while (
        Decimal.gte(player.runeexp[runeIndex], calculateRuneExpToLevel(runeIndex)) && Decimal.lt(player.runelevels[runeIndex], maxLevel)
      ) {
        player.runelevels[runeIndex] = Decimal.add(player.runelevels[runeIndex], 1)
        levelsAdded++
      }
    }
    for (let runeToUpdate = 0; runeToUpdate < 5; ++runeToUpdate) {
      if (unlockedRune(runeToUpdate + 1)) {
        if (runeToUpdate !== runeIndex) {
          player.runeexp[runeToUpdate] = Decimal.add(player.runeexp[runeToUpdate], Decimal.mul(all, calculateRuneExpGiven(runeToUpdate, true)))
        }
        while (
          Decimal.gte(player.runeexp[runeToUpdate], calculateRuneExpToLevel(runeToUpdate))
          && Decimal.lt(player.runelevels[runeToUpdate], calculateMaxRunes(runeToUpdate + 1))
        ) {
          player.runelevels[runeToUpdate] = Decimal.add(player.runelevels[runeToUpdate], 1)
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

export const calculateOfferingsToLevelXTimes = (runeIndex: number, runeLevel: Decimal, levels: number | Decimal) => {
  let exp = Decimal.sub(calculateRuneExpToLevel(runeIndex, runeLevel), player.runeexp[runeIndex])
  const maxLevel = calculateMaxRunes(runeIndex + 1)
  const arr = []
  let sum = new Decimal(0)
  const off = player.runeshards
  let levelsAdded = 0
  const fact = calculateRuneExpGiven(runeIndex, false, runeLevel, true)
  const a = player.upgrades[71] / 25
  const add = Decimal.sub(fact[0], Decimal.mul(runeLevel, a))
  const mult = fact.slice(1, fact.length).reduce((x, y) => x * y, 1)
  while (Decimal.lt(levelsAdded, levels) && Decimal.add(runeLevel, levelsAdded).lt(maxLevel) && Decimal.lt(sum, off)) {
    const expPerOff = Decimal.add(runeLevel, levelsAdded).mul(a).add(add).mul(mult)
    const amount = Decimal.ceil(Decimal.div(exp, expPerOff))
    sum = sum.add(amount)
    arr.push(amount)
    levelsAdded += 1
    exp = Decimal.sub(calculateRuneExpToLevel(runeIndex, Decimal.add(runeLevel, levelsAdded))
      , calculateRuneExpToLevel(runeIndex, Decimal.add(runeLevel, levelsAdded).sub(1)))
  }
  return arr
}