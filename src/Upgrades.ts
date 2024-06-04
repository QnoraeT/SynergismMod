import Decimal from 'break_eternity.js'
import i18next from 'i18next'
import { buyAutobuyers, buyGenerator } from './Automation'
import { buyUpgrades } from './Buy'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateAnts, calculateCorruptionPoints, calculateRuneLevels } from './Calculate'
import { format, player } from './Synergism'
import { revealStuff } from './UpdateHTML'
import { sumContentsDecimal } from './Utility'
import { Globals as G, Upgrade } from './Variables'

const crystalupgdesc: Record<number, () => Record<string, string>> = {
  3: () => ({
    max: format(
      player.commonFragments.add(1).log(4).mul(player.researches[129]).mul(0.001).add(Decimal.mul(0.88, player.upgrades[122]).add(0.12)).mul(100)
      ,
      2,
      true
    )
  }),
  4: () => ({
    max: format(
      player.commonFragments.add(1).log(4).mul(player.researches[129]).mul(0.05).add(10).add(Decimal.mul(calculateCorruptionPoints(), G.effectiveRuneSpiritPower[3]).div(20))
    )
  })
}

const constantUpgDesc: Record<number, () => Record<string, string>> = {
  1: () => ({ level: format(5 + player.achievements[270] + 0.1 * player.platonicUpgrades[18], 1, true) }),
  2: () => ({
    max: format(
      Decimal.add(player.achievements[270], player.shopUpgrades.constantEX)
      .add(G.challenge15Rewards.exponent.sub(1).mul(100))
        .add(Decimal.mul(0.3, player.platonicUpgrades[18]))
        .add(10),
      2,
      true
    )
  })
}

const upgradetexts = [
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format((G.totalCoinOwned.add(1)).mul(Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))), 2),
  () => format(Decimal.add(player.fifthOwnedCoin, 1).log10().floor().add(1).min(4)),
  () => format(player.multiplierBought.div(7).floor()),
  () => format(player.acceleratorBought.div(10).floor()),
  () => format(Decimal.pow(2, Decimal.min(50, player.secondOwnedCoin.div(15))), 2),
  () => format(Decimal.pow(1.02, G.freeAccelerator), 2),
  () => format(Decimal.min(1e4, Decimal.pow(1.01, player.prestigeCount)), 2),
  () =>
    format(
      Decimal.min(
        1e50,
        Decimal.pow(player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1), 4 / 3).times(1e10)
      ),
      2
    ),
  () => format(Decimal.pow(1.15, G.freeAccelerator), 2),
  () => format(Decimal.pow(1.15, G.freeAccelerator), 2),
  () => {
    let i = G.acceleratorEffect.root(3)
    if (i.gte("e1000")) {
      i = i.log10().log10().div(3).pow(0.75).mul(3).pow10().pow10()
    }
    return format(i, 2)
  },
  () => null,
  () => format(Decimal.min(1e125, player.transcendShards.add(1))),
  () => format(Decimal.min(1e200, player.transcendPoints.times(1e30).add(1))),
  () => format(Decimal.mul((G.totalCoinOwned.add(1)), Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))).pow(10), 2),
  () => ({
    x: format(Decimal.floor(G.freeMultiplier.div(101).add(1))),
    y: format(Decimal.floor(G.freeAccelerator.div(101).add(5)))
  }),
  () => ({
    x: format(Decimal.floor(G.freeMultiplier.div(101).add(1))),
    y: format(Decimal.floor(G.freeAccelerator.div(101).add(4)))
  }),
  () => ({
    x: format(Decimal.floor(G.freeMultiplier.div(101).add(1))),
    y: format(Decimal.floor(G.freeAccelerator.div(101).add(3)))
  }),
  () => ({
    x: format(Decimal.floor(G.freeMultiplier.div(101).add(1))),
    y: format(Decimal.floor(G.freeAccelerator.div(101).add(2)))
  }),
  () => ({
    x: format(Decimal.floor(G.freeMultiplier.div(101).add(1))),
    y: format(Decimal.floor(G.freeAccelerator.div(101).add(1)))
  }),
  () => null,
  () =>
    format(
      player.coins.add(1).log(1e3).floor().min(250).add(player.coins.add(1).log(1e15).floor().sub(50).min(1750).max(0))
    ),
  () =>
    format(
      Decimal.min(
        1000,
        Decimal.floor(
          Decimal.add(player.firstOwnedCoin, player.secondOwnedCoin).add(player.thirdOwnedCoin).add(player.fourthOwnedCoin).add(player.fifthOwnedCoin).div(160)
        )
      )
    ),
  () =>
    format(
      Decimal.floor(
        Decimal.min(
          2000,
          Decimal.add(player.firstOwnedCoin, player.secondOwnedCoin).add(player.thirdOwnedCoin).add(player.fourthOwnedCoin).add(player.fifthOwnedCoin).div(80)
        )
      )
    ),
  () =>
    format(
      Decimal.min(75, Decimal.floor(player.coins.add(1).log10().div(10))).add(Decimal.min(925, Decimal.floor(player.coins.add(1).log10().div(30))))
    ),
  () => format(Decimal.floor(G.totalCoinOwned.div(2000))),
  () => format(Decimal.min(500, Decimal.floor(player.prestigePoints.add(1).log10().div(25)))),
  () => format(G.totalAcceleratorBoost),
  () => format(Decimal.floor(G.freeMultiplier.mul(3/103))),
  () => format(Decimal.floor(G.freeMultiplier.mul(2/102))),
  () => format(Decimal.min('1e5000', Decimal.pow(player.prestigePoints, 1 / 500)), 2),
  () => format(Decimal.pow(Decimal.log(player.prestigePoints.add(10), 10), 2), 2),
  () => null,
  () => null,
  () => null,
  () => format(Decimal.min(1e30, Decimal.pow(player.transcendPoints.add(1), 1 / 2))),
  () => format(Decimal.min(1e50, Decimal.pow(player.prestigePoints.add(1), 1 / 50).dividedBy(2.5).add(1)), 2),
  () => format(Decimal.min(1e30, Decimal.pow(1.01, player.transcendCount)), 2),
  () => format(Decimal.min(1e6, Decimal.pow(1.01, player.transcendCount)), 2),
  () => format(Decimal.min(2500, Decimal.floor(player.transcendShards.add(1).log10()))),
  () => null,
  () => format(Math.pow(1.05, player.achievementPoints) * (player.achievementPoints + 1), 2),
  () => format(Decimal.pow(Decimal.mul(G.totalMultiplier, G.totalAccelerator).min(1e25).div(1000).add(1), 8)),
  () => format(Decimal.min(50, player.transcendPoints.add(1).log10().div(10).floor())),
  () => null,
  () => format(Decimal.pow(G.totalAcceleratorBoost, 2), 2),
  () => format(Decimal.pow(G.globalMythosMultiplier, 0.025), 2),
  () => format(Decimal.min('1e1250', Decimal.pow(G.acceleratorEffect, 1 / 125)), 2),
  () => format(Decimal.min('1e2000', Decimal.pow(G.multiplierEffect, 1 / 180)), 2),
  () => format(Decimal.pow('1e1000', G.buildingPower.sub(1).min(1000)), 2),
  () => null,
  () => null,
  () => null,
  () => null,
  () => null,
  () => null,
  () => format(sumContentsDecimal(player.challengecompletions).div(5).floor(), 1),
  () => format(Decimal.min('1e6000', Decimal.pow(player.reincarnationPoints.add(1), 6))),
  () => format(Decimal.pow(player.reincarnationPoints.add(1), 2)),
  () => null,
  () => null,
  () =>
    format(
      Decimal.pow(
        1.03,
        player.firstOwnedParticles.add(player.secondOwnedParticles).add(player.thirdOwnedParticles).add(player.fourthOwnedParticles).add(player.fifthOwnedParticles)
      ),
      2
    ),
  () => format(G.taxdivisor.log10().div(1000).floor().min(2500)),
  () => {
    let a = player.upgrades[69] > 0
              ? G.reincarnationPointGain.max(10).log10().sqrt().max(G.reincarnationPointGain.max(10).log10().pow(0.06).sub(1).pow10())
              : G.reincarnationPointGain.max(10).log10().log10().add(1)
    const b = G.reincarnationPointGain.add(10).log10().sqrt()
    return {
      x: format(a.min(10), 2),
      y: format(b.min(3), 2)
    }
  },
  () => format(Decimal.add(player.maxobtainium, 1).log10().div(3), 2, true),
  () => null,
  () =>
    format(Decimal.min(
      50,
      new Decimal(0.5).add(player.challengecompletions[6]).add(player.challengecompletions[7]).add(player.challengecompletions[8])
      .add(player.challengecompletions[9]).add(player.challengecompletions[10]).mul(2)
    )),
  () => null,
  () => format(player.maxofferings.div(1e5).sqrt().min(1).mul(4).add(1), 2),
  () => format(player.maxobtainium.div(3e7).sqrt().min(1).mul(2).add(1), 2),
  () => null,
  () =>
    format(
      Decimal.pow(
        1.004 + 4 / 100000 * player.researches[96],
        player.firstOwnedAnts + player.secondOwnedAnts + player.thirdOwnedAnts + player.fourthOwnedAnts
          + player.fifthOwnedAnts + player.sixthOwnedAnts + player.seventhOwnedAnts + player.eighthOwnedAnts
      ),
      3
    ),
  () => format(player.maxofferings.add(1).log10().pow(2).mul(0.005).add(1), 2, true),
  () => null,
  () => null,
  ...Array.from({ length: 39 }, () => () => null),
  () => null,
  () => null,
  () => null,
  () => null,
  () => format(Decimal.div(player.challengecompletions[10], 3), 0),
  () => format(Decimal.div(player.challengecompletions[10], 3), 0)
]

export const upgradeeffects = (i: number) => {
  const effect = upgradetexts[i - 1]?.()
  const type = typeof effect
  const element = DOMCacheGetOrSet('upgradeeffect')

  if (i >= 81 && i <= 119) {
    element.textContent = i18next.t('upgrades.effects.81')
  } else if (effect == null) {
    element.textContent = i18next.t(`upgrades.effects.${i}`)
  } else if (type === 'string' || type === 'number') {
    element.textContent = i18next.t(`upgrades.effects.${i}`, { x: effect })
  } else {
    element.textContent = i18next.t(`upgrades.effects.${i}`, effect as Exclude<typeof effect, string | number>)
  }
}

export const upgradedescriptions = (i: number) => {
  const y = i18next.t(`upgrades.descriptions.${i}`)
  const z = player.upgrades[i] > 0.5 ? ' BOUGHT!' : ''

  const el = DOMCacheGetOrSet('upgradedescription')
  el.textContent = y + z
  el.style.color = player.upgrades[i] > 0.5 ? 'gold' : 'white'

  if (player.toggles[9]) {
    clickUpgrades(i, false)
  }

  let currency = ''
  let color = ''
  if ((i <= 20 && i >= 1) || (i <= 110 && i >= 106) || (i <= 125 && i >= 121)) {
    currency = 'Coins'
    color = 'yellow'
  }
  if ((i <= 40 && i >= 21) || (i <= 105 && i >= 101) || (i <= 115 && i >= 111) || (i <= 87 && i >= 81)) {
    currency = 'Diamonds'
    color = 'cyan'
  }
  if ((i <= 60 && i >= 41) || (i <= 120 && i >= 116) || (i <= 93 && i >= 88)) {
    currency = 'Mythos'
    color = 'plum'
  }
  if ((i <= 80 && i >= 61) || (i <= 100 && i >= 94)) {
    currency = 'Particles'
    color = 'limegreen'
  }

  DOMCacheGetOrSet('upgradecost').textContent = `Cost: ${format(Decimal.pow(10, G.upgradeCosts[i]))} ${currency}`
  DOMCacheGetOrSet('upgradecost').style.color = color
  upgradeeffects(i)
}

export const clickUpgrades = (i: number, auto: boolean) => {
  // Make sure the upgrade is locked
  if (
    player.upgrades[i] !== 0
    || (i <= 40 && i >= 21 && !player.unlocks.prestige)
    || (i <= 60 && i >= 41 && !player.unlocks.transcend)
    || (i <= 80 && i >= 61 && !player.unlocks.reincarnate)
    || (i <= 120 && i >= 81 && !player.unlocks.prestige)
    || DOMCacheGetOrSet(`upg${i}`)!.style.display === 'none'
  ) {
    return
  }

  let type: Upgrade | undefined
  if (i <= 20 && i >= 1) {
    type = Upgrade.coin
  }
  if (i <= 40 && i >= 21) {
    type = Upgrade.prestige
  }
  if (i <= 60 && i >= 41) {
    type = Upgrade.transcend
  }
  if (i <= 80 && i >= 61) {
    type = Upgrade.reincarnation
  }
  if (i <= 87 && i >= 81) {
    type = Upgrade.prestige
  }
  if (i <= 93 && i >= 88) {
    type = Upgrade.transcend
  }
  if (i <= 100 && i >= 94) {
    type = Upgrade.reincarnation
  }
  if (type && i <= 80 && i >= 1) {
    buyUpgrades(type, i, auto)
  }
  if (type && i <= 100 && i >= 81) {
    buyAutobuyers(i - 80, auto)
  }
  if (i <= 120 && i >= 101) {
    buyGenerator(i - 100, auto)
  }
  if (i <= 125 && i >= 121) {
    buyUpgrades(Upgrade.coin, i, auto)
  }
}

export const categoryUpgrades = (i: number, auto: boolean) => {
  let min = 0
  let max = 0
  if (i === 1) {
    min = 121
    max = 125
    for (let i = 1; i <= 20; i++) {
      clickUpgrades(i, auto)
    }
  }
  if (i === 2) {
    min = 21
    max = 40
  }
  if (i === 3) {
    min = 41
    max = 60
  }
  if (i === 4) {
    min = 101
    max = 120
  }
  if (i === 5) {
    min = 81
    max = 100
  }
  if (i === 6) {
    min = 61
    max = 80
  }
  for (let i = min; i <= max; i++) {
    clickUpgrades(i, auto)
  }
}

const crystalupgeffect: Record<number, () => Record<string, string>> = {
  1: () => ({
    x: format(
      Decimal.min(
        Decimal.pow(10, Decimal.mul(player.crystalUpgrades[0], 2).add(50)),
        Decimal.pow(1.05, Decimal.mul(player.achievementPoints, player.crystalUpgrades[0]))
      ),
      2,
      true
    )
  }),
  2: () => ({
    x: format(
      Decimal.min(
        Decimal.pow(10, Decimal.mul(player.crystalUpgrades[1], 5).add(100)),
        Decimal.pow(player.coins.add(1).log10(), Decimal.div(player.crystalUpgrades[1], 3))
      ),
      2,
      true
    )
  }),
  3: () => ({
    x: format(
      Decimal.pow(
        Decimal.min(
Decimal.mul(0.88, player.upgrades[122]).add(Decimal.mul(player.researches[129], Decimal.add(player.commonFragments, 1).log(4)).mul(0.001)).add(0.12)
            , Decimal.mul(player.crystalUpgrades[2], 0.001)
          ).add(1),
        Decimal.add(player.firstOwnedDiamonds, player.secondOwnedDiamonds).add(player.thirdOwnedDiamonds).add(player.fourthOwnedDiamonds)
        .add(player.fifthOwnedDiamonds)
      ),
      2,
      true
    )
  }),
  4: () => ({
    x: format(
      Decimal.min(
        Decimal.add(player.commonFragments, 1).log(4).add(Decimal.mul(calculateCorruptionPoints(), G.effectiveRuneSpiritPower[3]).div(20)).mul(player.researches[129]).mul(0.05).add(10),
        Decimal.mul(player.crystalUpgrades[3], 0.05)
      ),
      2,
      true
    )
  }),
  5: () => ({
    x: format(
      Decimal.pow(
        1.01,
        (Decimal.add(player.challengecompletions[1], player.challengecompletions[2]).add(player.challengecompletions[3])
        .add(player.challengecompletions[4]).add(player.challengecompletions[5])).mul(player.crystalUpgrades[4])
      ),
      2,
      true
    )
  })
}

const returnCrystalUpgDesc = (i: number) => i18next.t(`upgrades.crystalUpgrades.${i}`, crystalupgdesc[i]?.())
const returnCrystalUpgEffect = (i: number) =>
  i18next.t('buildings.crystalUpgrades.currentEffect', {
    effect: i in crystalupgeffect ? i18next.t(`upgrades.crystalEffects.${i}`, crystalupgeffect[i]()) : ''
  })

export const crystalupgradedescriptions = (i: number) => {
  const p = player.crystalUpgrades[i - 1]
  const c = Decimal.mul(G.rune3level, G.effectiveLevelMult).div(16).floor().add(player.upgrades[73] > 0.5 && player.currentChallenge.reincarnation !== 0 ? 10 : 0)
  const q = Decimal.sub(player.crystalUpgrades[i - 1], c).add(0.5).pow(2).div(2).floor().mul(G.crystalUpgradeCostIncrement[i - 1]).add(G.crystalUpgradesCost[i - 1]).pow10()
  
  DOMCacheGetOrSet('crystalupgradedescription').textContent = returnCrystalUpgDesc(i)
  DOMCacheGetOrSet('crystalupgradeslevel1').innerHTML = i18next.t('buildings.crystalUpgrades.currentLevel', {
    amount: format(p, 0, true)
  })
  DOMCacheGetOrSet('crystalupgradescost1').innerHTML = i18next.t('buildings.crystalUpgrades.cost', {
    amount: format(q)
  })
  DOMCacheGetOrSet('crystalupgradeseffect1').innerHTML = returnCrystalUpgEffect(i)
}

export const upgradeupdate = (num: number, fast?: boolean) => {
  const el = DOMCacheGetOrSet(`upg${num}`)
  if (player.upgrades[num] > 0.5) {
    el.style.backgroundColor = 'green'
  } else {
    el.style.backgroundColor = ''
  }

  const b = i18next.t(`upgrades.descriptions.${num}`)
  const c = player.upgrades[num] > 0.5 ? ' BOUGHT!' : ''
  if (player.upgrades[num] > 0.5) {
    if (!fast) {
      DOMCacheGetOrSet('upgradedescription').textContent = b + c
      DOMCacheGetOrSet('upgradedescription').style.color = 'gold'
    }
  }

  if (!fast) {
    revealStuff()
  }
}

export const ascendBuildingDR = () => {
  const sum = player.ascendBuilding1.owned + player.ascendBuilding2.owned + player.ascendBuilding3.owned
    + player.ascendBuilding4.owned + player.ascendBuilding5.owned

  if (sum > 100000) {
    return Math.pow(100000, 0.5) * Math.pow(sum, 0.5)
  } else {
    return sum
  }
}

const constUpgEffect: Record<number, () => Record<string, string>> = {
  1: () => ({
    x: format(
      Decimal.pow(
        1.05 + 0.01 * player.achievements[270] + 0.001 * player.platonicUpgrades[18],
        player.constantUpgrades[1]
      ),
      2,
      true
    )
  }),
  2: () => ({
    x: format(
      Decimal.pow(
          Decimal.min(
            Decimal.mul(10, player.achievements[270])
          .add(Decimal.mul(player.shopUpgrades.constantEX, 10))
          .add(Decimal.mul(player.platonicUpgrades[18], 3))
          .add(G.challenge15Rewards.exponent.sub(1).mul(1000)).add(100)
          
          , player.constantUpgrades[2] ).mul(0.001).add(1),
        ascendBuildingDR()
      ),
      2,
      true
    )
  }),
  3: () => ({
    x: format(player.constantUpgrades[3].mul(0.02).add(1), 2, true)
  }),
  4: () => ({
    x: format(player.constantUpgrades[4].mul(0.04).add(1), 2, true)
  }),
  5: () => ({
    x: format(Decimal.pow(player.ascendShards.add(1).log10().mul(0.1).add(1), player.constantUpgrades[5]), 2, true)
  }),
  6: () => ({
    x: format(player.constantUpgrades[6].mul(2))
  }),
  7: () => ({
    x: format(player.constantUpgrades[7].mul(7)),
    y: format(player.constantUpgrades[7].mul(3))
  }),
  8: () => ({
    x: format(player.constantUpgrades[8].mul(0.1).add(1), 2, true)
  }),
  9: () => ({
    x: format(
      Decimal.mul(Decimal.add(player.talismanShards, 1).log(4), Decimal.min(1, player.constantUpgrades[9])).mul(0.01).add(1),
      4,
      true
    )
  }),
  10: () => ({
    x: format(player.ascendShards.add(1).log(4).mul(0.01).mul(Decimal.min(1, player.constantUpgrades[10])).add(1), 4, true)
  })
}

const returnConstUpgDesc = (i: number) => i18next.t(`upgrades.constantUpgrades.${i}`, constantUpgDesc[i]?.())
const returnConstUpgEffect = (i: number) => i18next.t(`upgrades.constantEffects.${i}`, constUpgEffect[i]?.())

export const getConstUpgradeMetadata = (i: number): Array<Decimal> => {
  let toBuy: Decimal
  let cost: Decimal

  if (i >= 9) {
    if (player.constantUpgrades[i]!.gte(1)) {
      toBuy = new Decimal(0)
    } else {
      toBuy = Decimal.min(
        1,
        Decimal.max(
          0,
          Decimal.floor(
            Decimal.max(0.01, player.ascendShards).log10().sub(Decimal.log10(G.constUpgradeCosts[i]!)).add(1)
          )
        )
      )
    }
  } else {
    toBuy = Decimal.max(
      0,
      Decimal.floor(
        Decimal.sub(Decimal.max(0.01, player.ascendShards).log10(), Decimal.log10(G.constUpgradeCosts[i]!)).add(1)
      )
    )
  }

  if (toBuy.gt(player.constantUpgrades[i]!)) {
    cost = Decimal.pow(10, toBuy.sub(1)).times(G.constUpgradeCosts[i]!)
  } else {
    cost = i >= 9 && player.constantUpgrades[i]!.gte(1)
      ? new Decimal(0)
      : Decimal.pow(10, player.constantUpgrades[i]!).times(G.constUpgradeCosts[i]!)
  }

  return [Decimal.max(1, Decimal.sub(toBuy, player.constantUpgrades[i]!)), cost]
}

export const constantUpgradeDescriptions = (i: number) => {
  const [level, cost] = getConstUpgradeMetadata(i)
  DOMCacheGetOrSet('constUpgradeDescription').textContent = returnConstUpgDesc(i)
  if (i >= 9) {
    DOMCacheGetOrSet('constUpgradeLevel2').textContent = `${format(Decimal.min(1, player.constantUpgrades[i]!))}/1`
  } else DOMCacheGetOrSet('constUpgradeLevel2').textContent = format(player.constantUpgrades[i])
  DOMCacheGetOrSet('constUpgradeCost2').textContent = `${format(cost)} [+${format(level)} LVL]`
  DOMCacheGetOrSet('constUpgradeEffect2').textContent = returnConstUpgEffect(i)
}

export const buyConstantUpgrades = (i: number, fast = false) => {
  const [level, cost] = getConstUpgradeMetadata(i)
  if (i <= 8 || (i >= 9 && player.constantUpgrades[i]!.lt(1))) {
    if (player.ascendShards.gte(cost)) {
      player.constantUpgrades[i]! = Decimal.add(player.constantUpgrades[i]!, level)
      if (player.researches[175] === 0) {
        player.ascendShards = player.ascendShards.sub(cost)
      }
      if (!fast) {
        constantUpgradeDescriptions(i)
      }
    }
  }
  calculateAnts()
  calculateRuneLevels()
}
