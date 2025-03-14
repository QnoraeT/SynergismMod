import Decimal, { type DecimalSource } from 'break_eternity.js'
import i18next from 'i18next'
import { achievementaward } from './Achievements'
import { ant7Effect } from './Ants'
import { DOMCacheGetOrSet } from './Cache/DOM'
import {
  calculateCorruptionPoints,
  calculateRuneBonuses,
  calculateSummationLinearDecimal,
  constantEffects
} from './Calculate'
import { CalcECC } from './Challenges'
import { thriftRuneEffect } from './Runes'
import { format, player, updateAllMultiplier, updateAllTick } from './Synergism'
import type { FirstToFifth, OneToFive, ZeroToFour } from './types/Synergism'
import { crystalupgradedescriptions, upgradeupdate } from './Upgrades'
import { Globals as G, Upgrade } from './Variables'

export const getReductionValue = () => {
  let reduction = new Decimal(1)
  reduction = reduction.add(thriftRuneEffect())
  reduction = reduction.add(
    (player.researches[56] + player.researches[57] + player.researches[58] + player.researches[59]
      + player.researches[60]) / 200
  )
  reduction = reduction.add(CalcECC('transcend', player.challengecompletions[4]).div(200))
  reduction = reduction.add(ant7Effect())
  reduction = reduction.mul(constantEffects().buildingSlowDown)
  return reduction
}

const coinBuildingCosts = [
  new Decimal(100),
  new Decimal(1000),
  new Decimal(2e4),
  new Decimal(4e5),
  new Decimal(8e6)
] as const
const diamondBuildingCosts = [
  new Decimal(100),
  new Decimal(1e5),
  new Decimal(1e15),
  new Decimal(1e40),
  new Decimal(1e100)
] as const
const mythosAndParticleBuildingCosts = [
  new Decimal(1),
  new Decimal(1e2),
  new Decimal(1e4),
  new Decimal(1e8),
  new Decimal(1e16)
] as const

const getOriginalCostAndNum = (index: OneToFive, type: keyof typeof buyProducerTypes) => {
  const originalCostArray = type === 'Coin'
    ? coinBuildingCosts
    : type === 'Diamonds'
    ? diamondBuildingCosts
    : mythosAndParticleBuildingCosts
  const num = type === 'Coin' ? index : index * (index + 1) / 2
  const originalCost = originalCostArray[index - 1 as ZeroToFour]
  return [originalCost, num] as const
}

export const getCost = (index: OneToFive, type: keyof typeof buyProducerTypes, buyingTo: Decimal) => {
  const [originalCost] = getOriginalCostAndNum(index, type)
  return getMiscBuildingCost(buyingTo.sub(1), originalCost, index, type)
}

export const buyMax = (index: OneToFive, type: keyof typeof buyProducerTypes) => {
  const zeroIndex = index - 1 as ZeroToFour
  const pos = G.ordinals[zeroIndex]
  const [originalCost] = getOriginalCostAndNum(index, type)

  const tag = buyProducerTypes[type][0]

  const posOwnedType = `${pos}Owned${type}` as const
  const posCostType = `${pos}Cost${type}` as const
  if (
    getMiscBuildingTarget(player[tag], originalCost, zeroIndex + 1, type).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player[tag], Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtBuild = getMiscBuildingTarget(player[tag], originalCost, zeroIndex + 1, type).sub(9).floor().max(
      player[posOwnedType]
    )
    player[posCostType] = getMiscBuildingCost(boughtBuild, originalCost, zeroIndex + 1, type)
    for (let i = 0; i < 10; i++) {
      if (player[tag].lt(player[posCostType])) {
        break
      }
      player[tag] = player[tag].sub(getMiscBuildingCost(boughtBuild, originalCost, zeroIndex + 1, type))
      boughtBuild = boughtBuild.add(1)
      player[posOwnedType] = boughtBuild
      const cost = getMiscBuildingCost(boughtBuild, originalCost, zeroIndex + 1, type)
      player[posCostType] = cost
    }
  } else {
    const boughtBuild = getMiscBuildingTarget(player[tag], originalCost, zeroIndex + 1, type).floor().add(1).max(
      player[posOwnedType]
    )
    player[posOwnedType] = boughtBuild
    const cost = getMiscBuildingCost(boughtBuild, originalCost, zeroIndex + 1, type)
    player[posCostType] = cost
  }
}

const buyProducerTypes = {
  Diamonds: ['prestigePoints', 'crystal'],
  Mythos: ['transcendPoints', 'mythos'],
  Particles: ['reincarnationPoints', 'particle'],
  Coin: ['coins', 'coin']
} as const

export const buyProducer = (
  pos: FirstToFifth,
  type: keyof typeof buyProducerTypes
) => {
  const fckYou = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5
  }

  if (type === 'Particles') {
    buyParticleBuilding(fckYou[pos] as OneToFive)
  } else {
    buyMax(fckYou[pos] as OneToFive, type)
  }
}

export const buyUpgrades = (type: Upgrade, pos: number, state?: boolean) => {
  const currency = type
  if (player[currency].gte(Decimal.pow(10, G.upgradeCosts[pos])) && player.upgrades[pos] === 0) {
    player[currency] = player[currency].sub(Decimal.pow(10, G.upgradeCosts[pos]))
    player.upgrades[pos] = 1
    upgradeupdate(pos, state)
  }

  if (type === Upgrade.transcend) {
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
  if (type === Upgrade.prestige) {
    player.transcendnocoinorprestigeupgrades = false
    player.reincarnatenocoinorprestigeupgrades = false
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
  if (type === Upgrade.coin) {
    player.prestigenocoinupgrades = false
    player.transcendnocoinupgrades = false
    player.transcendnocoinorprestigeupgrades = false
    player.reincarnatenocoinupgrades = false
    player.reincarnatenocoinorprestigeupgrades = false
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
}

export const calculateCrystalBuy = (i: number) => {
  const u = i - 1
  const exponent = Decimal.log(player.prestigeShards.add(1), 10)

  const toBuy = Decimal.floor(
    Decimal.sub(exponent, G.crystalUpgradesCost[u]).div(G.crystalUpgradeCostIncrement[u]).mul(2).add(0.25).max(0).sqrt()
      .add(0.5)
  )
  return toBuy
}

export const buyCrystalUpgrades = (i: number, auto = false) => {
  const u = i - 1

  let c = new Decimal(0)
  c = c.add(Decimal.mul(G.rune3level, G.effectiveLevelMult).div(16).floor())
  if (player.upgrades[73] > 0.5 && player.currentChallenge.reincarnation !== 0) {
    c = c.add(10)
  }

  const toBuy = calculateCrystalBuy(i)

  if (Decimal.add(toBuy, c).gt(player.crystalUpgrades[u])) {
    player.crystalUpgrades[u] = Decimal.add(toBuy, c)
    if (toBuy.gt(0)) {
      player.prestigeShards = player.prestigeShards.sub(
        Decimal.mul(G.crystalUpgradeCostIncrement[u], toBuy.sub(0.5).pow(2).div(2).sub(0.125)).add(
          G.crystalUpgradesCost[u]
        ).pow10()
      )
      if (!auto) {
        crystalupgradedescriptions(i)
      }
    }
  }
}

export const buyParticleBuilding = (
  index: OneToFive
) => {
  const zeroIndex = index - 1 as ZeroToFour
  const originalCost = mythosAndParticleBuildingCosts[zeroIndex]
  const pos = G.ordinals[zeroIndex]
  const key = `${pos}OwnedParticles` as const

  if (
    getParticleTarget(player.reincarnationPoints, originalCost).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player.reincarnationPoints, Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtPartBuild = getParticleTarget(player.reincarnationPoints, originalCost).sub(9).floor().max(player[key])
    player[`${pos}CostParticles` as const] = getParticleCostq(boughtPartBuild, originalCost)
    for (let i = 0; i < 10; i++) {
      if (player.reincarnationPoints.lt(player[`${pos}CostParticles` as const])) {
        break
      }
      player.reincarnationPoints = player.reincarnationPoints.sub(getParticleCostq(boughtPartBuild, originalCost))
      boughtPartBuild = boughtPartBuild.add(1)
      player[key] = boughtPartBuild
      const cost = getParticleCostq(boughtPartBuild, originalCost)
      player[`${pos}CostParticles` as const] = cost
    }
  } else {
    const boughtPartBuild = getParticleTarget(player.reincarnationPoints, originalCost).floor().add(1).max(player[key])
    player[key] = boughtPartBuild
    const cost = getParticleCostq(boughtPartBuild, originalCost)
    player[`${pos}CostParticles` as const] = cost
  }
}

export const tesseractBuildingCosts = [1, 10, 100, 1000, 10000] as const

// The nth tesseract building of tier i costs
//   tesseractBuildingCosts[i-1] * n^3.
// so the first n tesseract buildings of tier i costs
//   cost(n) = tesseractBuildingCosts[i-1] * (n * (n+1) / 2)^2
// in total. Use cost(owned+buyAmount) - cost(owned) to figure the cost of
// buying multiple buildings.

export type TesseractBuildings = [
  DecimalSource | null,
  DecimalSource | null,
  DecimalSource | null,
  DecimalSource | null,
  DecimalSource | null
]

const buyTessBuildingsToCheapestPrice = (
  ownedBuildings: TesseractBuildings,
  cheapestPrice: Decimal
): [Decimal, TesseractBuildings] => {
  const buyToBuildings = ownedBuildings.map((currentlyOwned, index) => {
    if (currentlyOwned === null) {
      return null
    }
    // thisPrice >= cheapestPrice = tesseractBuildingCosts[index] * (buyTo+1)^3
    // buyTo = cuberoot(cheapestPrice / tesseractBuildingCosts[index]) - 1
    // If buyTo has a fractional part, we want to round UP so that this
    // price costs more than the cheapest price.
    // If buyTo doesn't have a fractional part, thisPrice = cheapestPrice.
    const buyTo = Decimal.div(cheapestPrice, tesseractBuildingCosts[index]).root(3).sub(1).ceil()
    // It could be possible that cheapestPrice is less than the CURRENT
    // price of this building, so take the max of the number of buildings
    // we currently have.
    return Decimal.max(currentlyOwned, buyTo)
  }) as TesseractBuildings

  let price = new Decimal(0)
  for (let i = 0; i < ownedBuildings.length; i++) {
    const buyFrom = ownedBuildings[i]
    const buyTo = buyToBuildings[i]
    if (buyFrom === null || buyTo === null) {
      continue
    }
    price = price.add(
      Decimal.mul(buyTo, Decimal.add(buyTo, 1)).div(2).pow(2).sub(
        Decimal.mul(buyFrom, Decimal.add(buyFrom, 1)).div(2).pow(2)
      )
    ).mul(tesseractBuildingCosts[i])
  }

  return [price, buyToBuildings]
}

/**
 * Calculate the result of repeatedly buying the cheapest tesseract building,
 * given an initial list of owned buildings and a budget.
 *
 * This function is pure and does not rely on any global state other than
 * constants for ease of testing.
 *
 * For tests:
 * calculateInBudget([0, 0, 0, 0, 0], 100) = [3, 1, 0, 0, 0]
 * calculateInBudget([null, 0, 0, 0, 0], 100) = [null, 2, 0, 0, 0]
 * calculateInBudget([3, 1, 0, 0, 0], 64+80-1) = [4, 1, 0, 0, 0]
 * calculateInBudget([3, 1, 0, 0, 0], 64+80) = [4, 2, 0, 0, 0]
 * calculateInBudget([9, 100, 100, 0, 100], 1000) = [9, 100, 100, 1, 100]
 * calculateInBudget([9, 100, 100, 0, 100], 2000) = [10, 100, 100, 1, 100]
 *
 * and calculateInBudget([0, 0, 0, 0, 0], 1e46) should run in less than a
 * second.
 *
 * @param ownedBuildings The amount of buildings owned, or null if the building
 * should not be bought.
 * @param budget The number of tesseracts to spend.
 * @returns The amount of buildings owned after repeatedly buying the cheapest
 * building with the budget.
 */
export const calculateTessBuildingsInBudget = (
  ownedBuildings: TesseractBuildings,
  budget: DecimalSource
): TesseractBuildings => {
  // Nothing is affordable.
  // Also catches the case when budget <= 0, and all values are null.
  let minCurrentPrice: Decimal | null = null
  for (let i = 0; i < ownedBuildings.length; i++) {
    const owned = ownedBuildings[i]
    if (owned === null) {
      continue
    }
    const price = Decimal.pow(Decimal.add(owned, 1), 3).mul(tesseractBuildingCosts[i])
    if (minCurrentPrice === null || Decimal.lt(price, minCurrentPrice)) {
      minCurrentPrice = price
    }
  }

  if (minCurrentPrice === null || Decimal.gt(minCurrentPrice, budget)) {
    return ownedBuildings
  }

  // Every time the cheapest building is bought, the cheapest price either
  // stays constant (if there are two or more cheapest buildings), or
  // increases.
  //
  // Additionally, given the price of a building, calculating
  // - the amount of buildings needed to hit that price and
  // - the cumulative cost to buy to that amount of buildings
  // can be done with a constant number of floating point operations.
  //
  // Therefore, by binary searching over "cheapest price when finished", we
  // are able to efficiently (O(log budget)) determine the number of buildings
  // owned after repeatedly buying the cheapest building. Calculating the
  // cheapest building and buying one at a time would take O(budget^(1/4))
  // time - and as the budget could get very large (this is Synergism after
  // all), this is probably too slow.
  //
  // That is, we have a function f(cheapestPrice) which returns the cost of
  // buying buildings until all prices to buy are cheapestPrice or higher, and
  // we want to find the maximum value of cheapestPrice such that
  // f(cheapestPrice) <= budget.
  // In this case, f(x) = buyTessBuildingsToCheapestPrice(ownedBuildings, x)[0].

  // f(minCurrentPrice) = 0 < budget. We also know that we can definitely buy
  // at least one thing.
  let lo = minCurrentPrice
  // Do an exponential search to find the upper bound.
  let hi = Decimal.mul(lo, 2)
  while (Decimal.lte(buyTessBuildingsToCheapestPrice(ownedBuildings, hi)[0], budget)) {
    lo = hi
    hi = hi.mul(2)
  }
  // Invariant:
  // f(lo) <= budget < f(hi).
  while (Decimal.sub(hi, lo).gt(0.5)) {
    const mid = Decimal.sub(hi, lo).div(2).add(lo)
    // It's possible to get into an infinite loop if mid here is equal to
    // the boundaries, even if hi !== lo (due to floating point inaccuracy).
    if (Decimal.eq(mid, lo) || Decimal.eq(mid, hi)) {
      break
    }
    if (Decimal.lte(buyTessBuildingsToCheapestPrice(ownedBuildings, mid)[0], budget)) {
      lo = mid
    } else {
      hi = mid
    }
  }

  // Binary search is done (with lo being the best candidate).
  const [cost, buildings] = buyTessBuildingsToCheapestPrice(ownedBuildings, lo)

  // Note that this has a slight edge case when 2 <= N <= 5 buildings are the
  // same price, and it is optimal to buy only M < N of them at that price.
  // The result of this edge case is that we can finish the binary search with
  // a set of buildings which are affordable, but more buildings can still be
  // bought. To fix this, we greedily buy the cheapest building one at a time,
  // which should take 4 or less iterations to run out of budget.
  let remainingBudget = Decimal.sub(budget, cost)
  const currentPrices = buildings.map((num, index) => {
    if (num === null) {
      return null
    }
    return Decimal.pow(Decimal.add(num, 1), 3).mul(tesseractBuildingCosts[index])
  })

  for (let iteration = 1; iteration <= 5; iteration++) {
    let minimum: { price: Decimal; index: number } | null = null
    for (let index = 0; index < currentPrices.length; index++) {
      const price = currentPrices[index]
      if (price === null) {
        continue
      }
      // <= is used instead of < to prioritise the higher tier buildings
      // over the lower tier ones if they have the same price.
      if (minimum === null || Decimal.lte(price, minimum.price)) {
        minimum = { price, index }
      }
    }
    if (minimum !== null && Decimal.lte(minimum.price, remainingBudget)) {
      remainingBudget = Decimal.sub(remainingBudget, minimum.price)
      // buildings[minimum.index] should always be a number.
      // In extreme situations (when buildings[minimum.index] is bigger
      // than Number.MAX_SAFE_INTEGER), this below increment won't work.
      // However, that requires 1e47 tesseracts to get to, which shouldn't
      // ever happen.
      buildings[minimum.index]! = Decimal.add(buildings[minimum.index]!, 1)
      currentPrices[minimum.index] = Decimal.pow(Decimal.add(buildings[minimum.index]!, 1), 3).mul(
        tesseractBuildingCosts[minimum.index]
      )
    } else {
      // Can't afford cheapest any more - break.
      break
    }
  }

  return buildings
}

/**
 * @param index Which tesseract building to get the cost of.
 * @param amount The amount to buy. Defaults to tesseract buy amount.
 * @param checkCanAfford Whether to limit the purchase amount to the number of buildings the player can afford.
 * @returns A pair of [number of buildings after purchase, cost of purchase].
 */
export const getTesseractCost = (
  index: OneToFive,
  amount?: Decimal,
  checkCanAfford = true,
  buyFrom?: Decimal
): [Decimal, Decimal] => {
  amount ??= new Decimal(player.tesseractbuyamount)
  buyFrom ??= new Decimal(player[`ascendBuilding${index}` as const].owned)
  const intCost = tesseractBuildingCosts[index - 1]
  const subCost = buyFrom.mul(buyFrom.add(1)).div(2).pow(2).mul(intCost)

  let actualBuy: Decimal
  if (checkCanAfford) {
    const buyTo = player.wowTesseracts.value.add(subCost).div(intCost).sqrt().mul(8).add(1).sqrt().div(2).sub(0.5)
      .floor()
    actualBuy = Decimal.min(buyTo, Decimal.add(buyFrom, amount))
  } else {
    actualBuy = Decimal.add(buyFrom, amount)
  }
  const actualCost = actualBuy.mul(actualBuy.add(1)).div(2).pow(2).mul(intCost).sub(subCost)
  return [actualBuy, actualCost]
}

export const buyTesseractBuilding = (index: OneToFive, amount: DecimalSource = player.tesseractbuyamount) => {
  const intCost = tesseractBuildingCosts[index - 1]
  const ascendBuildingIndex = `ascendBuilding${index}` as const
  // Destructuring FTW!
  const [buyTo, actualCost] = getTesseractCost(index, new Decimal(amount))

  player[ascendBuildingIndex].owned = buyTo
  player.wowTesseracts.sub(actualCost)
  player[ascendBuildingIndex].cost = Decimal.pow(buyTo.add(1), 3).mul(intCost)
}

export const buyRuneBonusLevels = (type: 'Blessings' | 'Spirits', index: number) => {
  const unlocked = type === 'Spirits' ? Decimal.gt(player.challengecompletions[12], 0) : player.achievements[134] === 1
  if (unlocked && Decimal.isFinite(player.runeshards) && player.runeshards.gt(0)) {
    let baseCost: number
    let baseLevels: Decimal
    let levelCap: number
    if (type === 'Spirits') {
      baseCost = G.spiritBaseCost
      baseLevels = player.runeSpiritLevels[index]
      levelCap = player.runeSpiritBuyAmount
    } else {
      baseCost = G.blessingBaseCost
      baseLevels = player.runeBlessingLevels[index]
      levelCap = player.runeBlessingBuyAmount
    }

    const [level, cost] = calculateSummationLinearDecimal(baseLevels, baseCost, player.runeshards, levelCap)
    if (type === 'Spirits') {
      player.runeSpiritLevels[index] = level
    } else {
      player.runeBlessingLevels[index] = level
    }

    player.runeshards = player.runeshards.sub(cost)

    if (player.runeshards.lt(0)) {
      player.runeshards = new Decimal(0)
    }

    updateRuneBlessing(type, index)
  }
}

export const updateRuneBlessing = (type: 'Blessings' | 'Spirits', index: number) => {
  if (index === 1) {
    const requirementArray = [0, 1e5, 1e8, 1e11]
    for (let i = 1; i <= 3; i++) {
      if (Decimal.gte(player.runeBlessingLevels[1], requirementArray[i]) && player.achievements[231 + i] < 1) {
        achievementaward(231 + i)
      }
      if (Decimal.gte(player.runeSpiritLevels[1], 10 * requirementArray[i]) && player.achievements[234 + i] < 1) {
        achievementaward(234 + i)
      }
    }
    if (Decimal.gte(player.runeBlessingLevels[1], 1e22) && player.achievements[245] < 1) {
      achievementaward(245)
    }
  }

  calculateRuneBonuses()

  if (type === 'Blessings') {
    const blessingMultiplierArray = [0, 8, 10, 6.66, 2, 1]
    const t = (index === 5) ? 1 : 0
    DOMCacheGetOrSet(`runeBlessingPower${index}Value1`).innerHTML = i18next.t('runes.blessings.blessingPower', {
      reward: i18next.t(`runes.blessings.rewards.${index - 1}`),
      value: format(G.runeBlessings[index]),
      speed: format(
        Decimal.sub(1, Decimal.mul(blessingMultiplierArray[index], G.effectiveRuneBlessingPower[index]).add(t)),
        4,
        true
      )
    })
  } else if (type === 'Spirits') {
    const spiritMultiplierArray = [
      new Decimal(0),
      new Decimal(1),
      new Decimal(1),
      new Decimal(20),
      new Decimal(1),
      new Decimal(100)
    ]
    spiritMultiplierArray[index] = spiritMultiplierArray[index].mul(calculateCorruptionPoints().div(400))
    const t = (index === 3) ? 1 : 0

    DOMCacheGetOrSet(`runeSpiritPower${index}Value1`).innerHTML = i18next.t('runes.spirits.spiritPower', {
      reward: i18next.t(`runes.spirits.rewards.${index - 1}`),
      value: format(G.runeSpirits[index]),
      speed: format(
        Decimal.sub(1, Decimal.mul(spiritMultiplierArray[index], G.effectiveRuneSpiritPower[index]).add(t)),
        4,
        true
      )
    })
  }
}

export const buyAllBlessings = (type: 'Blessings' | 'Spirits', percentage = 100, auto = false) => {
  const unlocked = type === 'Spirits' ? player.challengecompletions[12].gt(0) : player.achievements[134] === 1
  if (unlocked) {
    const runeshards = Decimal.floor(player.runeshards.div(100).mul(percentage).div(5))
    for (let index = 1; index < 6; index++) {
      if (Decimal.isFinite(player.runeshards) && Decimal.gt(player.runeshards, 0)) {
        let baseCost: number
        let baseLevels: Decimal
        const levelCap = Number.POSITIVE_INFINITY
        if (type === 'Spirits') {
          baseCost = G.spiritBaseCost
          baseLevels = player.runeSpiritLevels[index]
        } else {
          baseCost = G.blessingBaseCost
          baseLevels = player.runeBlessingLevels[index]
        }

        const [level, cost] = calculateSummationLinearDecimal(baseLevels, baseCost, runeshards, levelCap)
        if (
          Decimal.gt(level, baseLevels) && (!auto || Decimal.gt(Decimal.sub(level, baseLevels).mul(10000), baseLevels))
        ) {
          if (type === 'Spirits') {
            player.runeSpiritLevels[index] = level
          } else {
            player.runeBlessingLevels[index] = level
          }

          player.runeshards = player.runeshards.sub(cost)

          if (player.runeshards.lt(0)) {
            player.runeshards = new Decimal(0)
          }

          updateRuneBlessing(type, index)
        }
      }
    }
  }
}

// heck you

export const getAccelScaling = (): Array<Decimal> => {
  const scaling = [new Decimal(125), new Decimal(2000)]
  scaling[0] = scaling[0].add(Decimal.mul(5, CalcECC('transcend', player.challengecompletions[4])))
  scaling[1] = scaling[1].add(Decimal.mul(5, CalcECC('transcend', player.challengecompletions[4])))

  scaling[0] = scaling[0].mul(constantEffects().accelScale[0])
  scaling[1] = scaling[1].mul(constantEffects().accelScale[1])
  return scaling
}

export const getMulScaling = (): Array<Decimal> => {
  const scaling = [new Decimal(75), new Decimal(2000)]
  scaling[0] = scaling[0].add(Decimal.mul(2, CalcECC('transcend', player.challengecompletions[4])))
  scaling[1] = scaling[1].add(Decimal.mul(2, CalcECC('transcend', player.challengecompletions[4])))

  scaling[0] = scaling[0].mul(constantEffects().multScale[0])
  scaling[1] = scaling[1].mul(constantEffects().multScale[1])
  return scaling
}

export const getBoostScaling = (): Decimal => {
  let scaling = Decimal.mul(G.effectiveRuneBlessingPower[4], 2).add(1).mul(1000)
  scaling = scaling.mul(constantEffects().boostScale)
  return scaling
}

export const getAccelCost = (bought: number | Decimal): Decimal => {
  let i = new Decimal(bought)
  const scaling = getAccelScaling()

  if (player.currentChallenge.reincarnation === 8) {
    i = i.add(2.512).pow(2.5).log10().pow(1.2).pow10().sub(10.001356440896176)
  }

  if (player.currentChallenge.transcension === 4) {
    i = i.pow(2)
  }

  if (i.gte(scaling[1])) {
    i = i.div(scaling[1]).pow(2).mul(scaling[1])
  }

  if (i.gte(scaling[0])) {
    i = i.sub(scaling[0]).mul(2).add(scaling[0])
    i = i.div(scaling[0]).pow(1.35).mul(scaling[0])
  }

  const baseCost = new Decimal(500)
  return Decimal.pow(4, i.div(G.costDivisor)).mul(baseCost)
}

export const getAccelTarget = (amt: Decimal): Decimal => {
  const baseCost = new Decimal(500)
  if (amt.lt(baseCost)) return new Decimal(0)
  let i = Decimal.mul(amt.div(baseCost).log(4), G.costDivisor)

  const scaling = getAccelScaling()
  if (i.gte(scaling[0])) {
    i = i.div(scaling[0]).root(1.35).mul(scaling[0])
    i = i.sub(scaling[0]).div(2).add(scaling[0])
  }

  if (i.gte(scaling[1])) {
    i = i.div(scaling[1]).root(2).mul(scaling[1])
  }

  if (player.currentChallenge.transcension === 4) {
    i = i.root(2)
  }

  if (player.currentChallenge.reincarnation === 8) {
    i = i.add(10.001356440896176).log10().root(1.2).pow10().root(2.5).sub(2.512)
  }

  return i
}

export const getMulCost = (bought: number | Decimal): Decimal => {
  let i = new Decimal(bought)
  const scaling = getMulScaling()

  if (player.currentChallenge.reincarnation === 8) {
    i = i.add(2.512).pow(2.5).log10().pow(1.2).pow10().sub(10.001356440896176)
  }

  if (player.currentChallenge.transcension === 4) {
    i = i.pow(2)
  }

  if (i.gte(scaling[1])) {
    i = i.div(scaling[1]).pow(2).mul(scaling[1])
  }

  if (i.gte(scaling[0])) {
    i = i.sub(scaling[0]).mul(2).add(scaling[0])
    i = i.div(scaling[0]).pow(1.35).mul(scaling[0])
  }

  const baseCost = new Decimal(1e4)
  return i.div(G.costDivisor).pow10().mul(baseCost)
}

export const getMulTarget = (amt: Decimal): Decimal => {
  const baseCost = new Decimal(1e4)
  if (amt.lt(baseCost)) return new Decimal(0)
  let i = Decimal.mul(amt.div(baseCost).log10(), G.costDivisor)

  const scaling = getMulScaling()
  if (i.gte(scaling[0])) {
    i = i.div(scaling[0]).root(1.35).mul(scaling[0])
    i = i.sub(scaling[0]).div(2).add(scaling[0])
  }

  if (i.gte(scaling[1])) {
    i = i.div(scaling[1]).root(2).mul(scaling[1])
  }

  if (player.currentChallenge.transcension === 4) {
    i = i.root(2)
  }

  if (player.currentChallenge.reincarnation === 8) {
    i = i.add(10.001356440896176).log10().root(1.2).pow10().root(2.5).sub(2.512)
  }

  return i
}

export const getAccelBoostCost = (bought: number | Decimal): Decimal => {
  let i = new Decimal(bought)
  const scaling = getBoostScaling()

  if (i.gte(1e15)) {
    i = i.div(1e15).pow(7 / 3).mul(1e15)
  }

  if (i.gte(scaling)) {
    i = i.div(scaling).pow(3).mul(scaling)
  }

  return i.pow(2).mul(0.5).add(i.mul(10.5)).add(3).pow10()
}

export const getAccelBoostTarget = (amt: Decimal): Decimal => {
  if (amt.lt(1000)) return new Decimal(0)
  let i = Decimal.mul(8, amt.log10()).add(417).sqrt().mul(0.5).sub(10.5)
  const scaling = getBoostScaling()

  if (i.gte(scaling)) {
    i = i.div(scaling).root(3).mul(scaling)
  }

  if (i.gte(1e15)) {
    i = i.div(1e15).root(7 / 3).mul(1e15)
  }

  return i
}

function particleBuildScale () {
  let i = (player.currentChallenge.ascension !== 15) ? new Decimal(300000) : new Decimal(1000)
  if (player.currentChallenge.ascension !== 15) {
    i = i.add(constantEffects().particleBuildingScale)
  }

  return i
}

export const getParticleCostq = (bought: number | Decimal, baseCost: number | Decimal): Decimal => {
  let i = new Decimal(bought)
  const scaling = particleBuildScale()

  if (i.gte(scaling)) {
    i = i.div(scaling).pow(2).mul(scaling)
  }

  return Decimal.pow(2, i.sub(1)).mul(baseCost)
}

export const getParticleTarget = (amt: Decimal, baseCost: number | Decimal): Decimal => {
  if (amt.lt(baseCost)) return new Decimal(0)
  let i = amt.div(baseCost).log(2).add(1)
  const scaling = particleBuildScale()

  if (Decimal.gte(i, scaling)) {
    i = Decimal.div(i, scaling).root(2).mul(scaling)
  }

  return i
}

export const gqScaling = () => {
  const scaling = [
    { start: new Decimal(100), power: new Decimal(2) },
    { start: new Decimal(1000), power: new Decimal(3) },
    { start: new Decimal(10000), power: new Decimal(1.25) },
    { start: new Decimal(1e6), power: new Decimal(2) }
  ]
  return scaling
}


export const buyGoldenQuarkBuilding = (
  index: OneToFive
) => {
  const originalCost = [1e2, 1e3, 1e6, 1e9, 1e12][index - 1]
  const key = `gcBuilding${index}` as const

  if (
    getGQTarget(player.goldenQuarks, originalCost).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player.goldenQuarks, Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtGQ = getGQTarget(player.goldenQuarks, originalCost).sub(9).floor().max(player[key].owned)
    player[`gcBuilding${index}` as const].cost = getGQCost(boughtGQ, originalCost)
    for (let i = 0; i < 10; i++) {
      if (player.goldenQuarks.lt(player[`gcBuilding${index}` as const].cost)) {
        break
      }
      player.goldenQuarks = player.goldenQuarks.sub(getGQCost(boughtGQ, originalCost))
      boughtGQ = boughtGQ.add(1)
      player[key].owned = boughtGQ
      const cost = getGQCost(boughtGQ, originalCost)
      player[`gcBuilding${index}` as const].cost = cost
    }
  } else {
    const boughtGQ = getGQTarget(player.goldenQuarks, originalCost).floor().add(1).max(player[key].owned)
    player[key].owned = boughtGQ
    const cost = getGQCost(boughtGQ, originalCost)
    player[`gcBuilding${index}` as const].cost = cost
  }
}

export const getGQCost = (bought: number | Decimal, baseCost: number | Decimal): Decimal => {
  let i = new Decimal(bought)
  const scaling = gqScaling()

  if (i.gte(scaling[3].start)) {
    i = i.log(scaling[3].start).pow(scaling[3].power).pow_base(scaling[3].start).sub(scaling[3].start).div(scaling[3].power).add(scaling[3].start)
  }

  if (i.gte(scaling[2].start)) {
    i = i.div(scaling[2].start).pow(scaling[2].power.sub(1)).sub(1).div(scaling[2].power.sub(1)).exp().mul(scaling[2].start)
  }

  if (i.gte(scaling[1].start)) {
    i = i.div(scaling[1].start).sub(1).div(scaling[1].power).add(1).pow(scaling[1].power).mul(scaling[1].start)
  }

  if (i.gte(scaling[0].start)) {
    i = i.div(scaling[0].start).sub(1).div(scaling[0].power).add(1).pow(scaling[0].power).mul(scaling[0].start)
  }

  return Decimal.pow(1.25, i.sub(1)).mul(baseCost)
}

export const getGQTarget = (amt: Decimal, baseCost: number | Decimal): Decimal => {
  if (amt.lt(baseCost)) return new Decimal(0)
  let i = amt.div(baseCost).log(1.25).add(1)
  const scaling = gqScaling()

  if (i.gte(scaling[0].start)) {
    i = i.div(scaling[0].start).root(scaling[0].power).sub(1).mul(scaling[0].power).add(1).mul(scaling[0].start)
  }

  if (i.gte(scaling[1].start)) {
    i = i.div(scaling[1].start).root(scaling[1].power).sub(1).mul(scaling[1].power).add(1).mul(scaling[1].start)
  }

  if (i.gte(scaling[2].start)) {
    i = i.div(scaling[2].start).ln().mul(scaling[2].power.sub(1)).add(1).root(scaling[2].power.sub(1).mul(scaling[2].start))
  }

  if (i.gte(scaling[3].start)) {
    i = i.sub(scaling[3].start).mul(scaling[3].power).add(scaling[3].start).log(scaling[3].start).root(scaling[3].power).pow_base(scaling[3].start)
  }

  return i
}
export const getMiscBuildingCost = (
  bought: number | Decimal,
  baseCost: Decimal,
  index: number,
  type: string
): Decimal => {
  let i = new Decimal(bought)

  if (type === 'Coin' || type === 'Diamonds' || type === 'Mythos') {
    if (player.currentChallenge.reincarnation === 8) {
      i = i.add(2.512).pow(2.5).log10().pow(1.2).pow10().sub(10.001356440896176)
    }
  }

  if (type === 'Coin' || type === 'Diamonds') {
    if (player.currentChallenge.transcension === 4) {
      i = i.pow(2)
    }
  }

  i = i.div(getReductionValue())
  i = i.pow(2).mul(Decimal.log10(1 + ((type === 'Mythos') ? 0.0025 : 0.0005 * index))).add(
    i.mul(Decimal.pow(1.25, index).log10())
  ).pow10().mul(baseCost)
  return i
}

export const getMiscBuildingTarget = (amt: Decimal, baseCost: Decimal, index: number, type: string): Decimal => {
  if (amt.lt(baseCost)) return new Decimal(0)
  let i = amt
  i = inverseQuad(
    i.log10(),
    Decimal.log10(1 + ((type === 'Mythos') ? 0.0025 : 0.0005 * index)),
    Decimal.pow(1.25, index).log10(),
    baseCost.log10()
  )

  i = i.mul(getReductionValue())

  if (type === 'Coin' || type === 'Diamonds') {
    if (player.currentChallenge.transcension === 4) {
      i = i.root(2)
    }
  }

  if (type === 'Coin' || type === 'Diamonds' || type === 'Mythos') {
    if (player.currentChallenge.reincarnation === 8) {
      i = i.add(10.001356440896176).log10().root(1.2).pow10().root(2.5).sub(2.512)
    }
  }
  return i
}

export const inverseQuad = (x: Decimal, a: Decimal, b: Decimal, c: Decimal): Decimal => {
  return a.eq(0)
    ? x.sub(c).div(b)
    : x.sub(c).mul(a).mul(4).add(b.pow(2)).sqrt().sub(b).div(a.mul(2))
}

export const buyMaxAccels = () => {
  if (
    getAccelTarget(player.coins).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player.coins, Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtAccel = getAccelTarget(player.coins).sub(9).floor().max(player.acceleratorBought)
    player.acceleratorCost = getAccelCost(boughtAccel)
    for (let i = 0; i < 10; i++) {
      if (player.coins.lt(player.acceleratorCost)) {
        break
      }
      player.coins = player.coins.sub(getAccelCost(boughtAccel))
      boughtAccel = boughtAccel.add(1)
      player.acceleratorBought = boughtAccel
      const cost = getAccelCost(boughtAccel)
      player.acceleratorCost = cost
    }
  } else {
    const boughtAccel = getAccelTarget(player.coins).floor().add(1).max(player.acceleratorBought)
    player.acceleratorBought = boughtAccel
    const cost = getAccelCost(boughtAccel)
    player.acceleratorCost = cost
  }

  player.prestigenoaccelerator = false
  player.transcendnoaccelerator = false
  player.reincarnatenoaccelerator = false
  updateAllTick()
  if (player.acceleratorBought.gte(5) && player.achievements[148] === 0) {
    achievementaward(148)
  }
  if (player.acceleratorBought.gte(25) && player.achievements[149] === 0) {
    achievementaward(149)
  }
  if (player.acceleratorBought.gte(100) && player.achievements[150] === 0) {
    achievementaward(150)
  }
  if (player.acceleratorBought.gte(666) && player.achievements[151] === 0) {
    achievementaward(151)
  }
  if (player.acceleratorBought.gte(2000) && player.achievements[152] === 0) {
    achievementaward(152)
  }
  if (player.acceleratorBought.gte(12500) && player.achievements[153] === 0) {
    achievementaward(153)
  }
  if (player.acceleratorBought.gte(100000) && player.achievements[154] === 0) {
    achievementaward(154)
  }
}

export const buyMaxMuls = () => {
  if (
    getMulTarget(player.coins).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player.coins, Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtMul = getMulTarget(player.coins).sub(9).floor().max(player.multiplierBought)
    player.multiplierCost = getMulCost(boughtMul)
    for (let i = 0; i < 10; i++) {
      if (player.coins.lt(player.multiplierCost)) {
        break
      }
      player.coins = player.coins.sub(getMulCost(boughtMul))
      boughtMul = boughtMul.add(1)
      player.multiplierBought = boughtMul
      const cost = getMulCost(boughtMul)
      player.multiplierCost = cost
    }
  } else {
    const boughtMul = getMulTarget(player.coins).floor().add(1).max(player.multiplierBought)
    player.multiplierBought = boughtMul
    const cost = getMulCost(boughtMul)
    player.multiplierCost = cost
  }

  player.prestigenomultiplier = false
  player.transcendnomultiplier = false
  player.reincarnatenomultiplier = false
  updateAllMultiplier()
  if (player.multiplierBought.gte(2) && player.achievements[155] === 0) {
    achievementaward(155)
  }
  if (player.multiplierBought.gte(20) && player.achievements[156] === 0) {
    achievementaward(156)
  }
  if (player.multiplierBought.gte(100) && player.achievements[157] === 0) {
    achievementaward(157)
  }
  if (player.multiplierBought.gte(500) && player.achievements[158] === 0) {
    achievementaward(158)
  }
  if (player.multiplierBought.gte(2000) && player.achievements[159] === 0) {
    achievementaward(159)
  }
  if (player.multiplierBought.gte(12500) && player.achievements[160] === 0) {
    achievementaward(160)
  }
  if (player.multiplierBought.gte(100000) && player.achievements[161] === 0) {
    achievementaward(161)
  }
}

export const buyMaxBoostAccel = () => {
  if (
    getAccelBoostTarget(player.prestigePoints).lt(Number.MAX_SAFE_INTEGER)
    && Decimal.lt(player.prestigePoints, Decimal.pow10(Number.MAX_SAFE_INTEGER))
  ) {
    let boughtAccelBoost = getAccelBoostTarget(player.prestigePoints).sub(9).floor().max(player.acceleratorBoostBought)
    player.acceleratorBoostCost = getAccelBoostCost(boughtAccelBoost)
    for (let i = 0; i < 10; i++) {
      if (player.prestigePoints.lt(player.acceleratorBoostCost)) {
        break
      }
      player.prestigePoints = player.prestigePoints.sub(getAccelBoostCost(boughtAccelBoost))
      boughtAccelBoost = boughtAccelBoost.add(1)
      player.acceleratorBoostBought = boughtAccelBoost
      const cost = getAccelBoostCost(boughtAccelBoost)
      player.acceleratorBoostCost = cost
    }
  } else {
    const boughtAccelBoost = getAccelBoostTarget(player.prestigePoints).floor().add(1).max(
      player.acceleratorBoostBought
    )
    player.acceleratorBoostBought = boughtAccelBoost
    const cost = getAccelBoostCost(boughtAccelBoost)
    player.acceleratorBoostCost = cost
  }
  player.transcendnoaccelerator = false
  player.reincarnatenoaccelerator = false

  if (player.acceleratorBoostBought.gte(2) && player.achievements[162] === 0) {
    achievementaward(162)
  }
  if (player.acceleratorBoostBought.gte(10) && player.achievements[163] === 0) {
    achievementaward(163)
  }
  if (player.acceleratorBoostBought.gte(50) && player.achievements[164] === 0) {
    achievementaward(164)
  }
  if (player.acceleratorBoostBought.gte(200) && player.achievements[165] === 0) {
    achievementaward(165)
  }
  if (player.acceleratorBoostBought.gte(1000) && player.achievements[166] === 0) {
    achievementaward(166)
  }
  if (player.acceleratorBoostBought.gte(5000) && player.achievements[167] === 0) {
    achievementaward(167)
  }
  if (player.acceleratorBoostBought.gte(15000) && player.achievements[168] === 0) {
    achievementaward(168)
  }
}
