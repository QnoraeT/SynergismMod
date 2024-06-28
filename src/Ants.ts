import {
  calculateAnts,
  calculateAntSacrificeELO,
  calculateAntSacrificeRewards,
  calculateRuneLevels,
  calculateSigmoid,
  calculateSigmoidExponential
} from './Calculate'
import { format, player } from './Synergism'
import { Globals as G } from './Variables'

import Decimal, { type DecimalSource } from 'break_eternity.js'
import i18next from 'i18next'
import { achievementaward } from './Achievements'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { Synergism } from './Events'
import type { ResetHistoryEntryAntSacrifice } from './History'
import { buyResearch } from './Research'
import { resetAnts } from './Reset'
import { Tabs } from './Tabs'
import { updateTalismanInventory } from './Talismans'
import { clearInterval, setInterval } from './Timers'
import type { FirstToEighth, ZeroToSeven } from './types/Synergism'
import { Confirm, revealStuff } from './UpdateHTML'

const antspecies: Record<`antspecies${number}`, string> = {
  antspecies1: 'Inceptus Formicidae',
  antspecies2: 'Fortunae Formicidae',
  antspecies3: 'Tributum Formicidae',
  antspecies4: 'Celeritas Formicidae',
  antspecies5: 'Multa Formicidae',
  antspecies6: 'Sacrificium Formicidae',
  antspecies7: 'Hic Formicidae',
  antspecies8: 'Experientia Formicidae',
  antspecies9: 'Praemoenio Formicidae',
  antspecies10: 'Scientia Formicidae',
  antspecies11: 'Phylacterium Formicidae',
  antspecies12: 'Mortuus Est Formicidae'
}

export const calculateCrumbToCoinExp = () => {
  const exponent = player.currentChallenge.ascension !== 15
    ? calculateSigmoidExponential(49900000, Decimal.add(player.antUpgrades[2 - 1]!, G.bonusant2).div(4990)).add(1e5)
    : calculateSigmoidExponential(49900000, Decimal.add(player.antUpgrades[2 - 1]!, G.bonusant2).div(4990)).add(1e5).div(1e4)

  return exponent
}

export const ant7Effect = () => {
  let i = Decimal.add(player.antUpgrades[7 - 1]!, G.bonusant7)
  i = i.mul(0.01).add(1).ln()
  return i
}

const antUpgradeTexts = [
  () => format(Decimal.pow(1.12 + 1 / 1000 * player.researches[101], Decimal.add(player.antUpgrades[1 - 1]!, G.bonusant1)), 2),
  () => format(calculateCrumbToCoinExp()),
  () => format(Decimal.add(player.antUpgrades[3 - 1]!, G.bonusant3).pow_base(0.99).mul(0.995).add(0.005), 4),
  () => format(calculateSigmoidExponential(20, Decimal.add(player.antUpgrades[4 - 1]!, G.bonusant4).div(1000).mul(20).div(19)).sub(1).mul(100), 3),
  () => format(calculateSigmoidExponential(40, Decimal.add(player.antUpgrades[5 - 1]!, G.bonusant5).div(1000).mul(40).div(39)).sub(1).mul(100), 3),
  () => format(Decimal.add(player.antUpgrades[6 - 1]!, G.bonusant6).pow(2/3).add(1), 4),
  () => format(ant7Effect().mul(100), 0, true),
  () => format(calculateSigmoidExponential(999, Decimal.add(player.antUpgrades[8 - 1]!, G.bonusant8).pow(1.1).div(10000)), 3),
  () => format(Decimal.min(1e7, Decimal.add(player.antUpgrades[9 - 1]!, G.bonusant9)), 0, true),
  () => format(Decimal.add(player.antUpgrades[10 - 1]!, G.bonusant10).div(50).pow(0.75).mul(2).add(1), 2),
  () => format(Decimal.sub(1, Decimal.add(player.antUpgrades[11 - 1]!, G.bonusant11).div(-125).pow_base(2)).mul(2).add(1), 4),
  () => format(calculateSigmoid(2, Decimal.add(player.antUpgrades[12 - 1]!, G.bonusant12), 69), 4)
]

let repeatAnt: ReturnType<typeof setTimeout>

export const antRepeat = (i: number) => {
  clearInterval(repeatAnt)
  repeatAnt = setInterval(() => updateAntDescription(i), 50)
}

export const updateAntDescription = (i: number) => {
  if (G.currentTab !== Tabs.AntHill) {
    return
  }
  const el = DOMCacheGetOrSet('anttierdescription')
  const la = DOMCacheGetOrSet('antprice')
  const ti = DOMCacheGetOrSet('antquantity')
  const me = DOMCacheGetOrSet('generateant')

  let priceType = 'ants.costGalacticCrumbs'
  let tier: FirstToEighth = 'first'
  let x!: string
  el.textContent = i18next.t(`ants.descriptions.${i}`)

  switch (i) {
    case 1:
      priceType = 'ants.costParticles'
      tier = 'first'
      x = format(G.antOneProduce, 5)
      break
    case 2:
      tier = 'second'
      x = format(G.antTwoProduce, 5)
      break
    case 3:
      tier = 'third'
      x = format(G.antThreeProduce, 5)
      break
    case 4:
      tier = 'fourth'
      x = format(G.antFourProduce, 5)
      break
    case 5:
      tier = 'fifth'
      x = format(G.antFiveProduce, 5)
      break
    case 6:
      tier = 'sixth'
      x = format(G.antSixProduce, 5)
      break
    case 7:
      tier = 'seventh'
      x = format(G.antSevenProduce, 5)
      break
    case 8:
      tier = 'eighth'
      x = format(G.antEightProduce, 5)
      break
  }

  me.textContent = i18next.t(`ants.generates.${i}`, { x })
  la.textContent = i18next.t(priceType, { x: format(player[`${tier}CostAnts` as const]) })
  ti.textContent = i18next.t('ants.owned', {
    x: format(player[`${tier}OwnedAnts` as const]),
    y: format(player[`${tier}GeneratedAnts` as const], 2)
  })

  DOMCacheGetOrSet('antsoftcap').style.display = G.globalAntMult.gte(1e33) ? '' : 'none'
  DOMCacheGetOrSet('antsoftcap').textContent = i18next.t('ants.softcap', {
    pow: format(G.antSoftcapPow, 4),
  })
}

const getAntScaling = () => {
  let start = new Decimal(6.9e7)
  let pow = new Decimal(2)
  return {start: start, pow: pow}
}

const getAntProdCost = (bought: DecimalSource, baseCost: DecimalSource, index: number) => {
  const scaling = getAntScaling()
  let i = new Decimal(bought)
  if (i.gte(scaling.start)) {
    i = i.div(scaling.start).root(scaling.pow).pow_base(scaling.start).sub(scaling.start).div(scaling.start.ln()).mul(scaling.pow).add(scaling.start)
  }
  i = Decimal.pow(G.antCostGrowth[index - 1], bought).mul(baseCost).add(bought)
  return i
}

const getAntProdTarget = (amt: Decimal, baseCost: DecimalSource, index: number) => {
  if (amt.lt(baseCost)) { return new Decimal(0) }
  const scaling = getAntScaling()
  let i = amt
  i = amt.div(baseCost).log(G.antCostGrowth[index - 1])
  if (i.gte(scaling.start)) {
    i.sub(scaling.start).div(scaling.pow).mul(scaling.start.ln()).add(scaling.start).log(scaling.start).pow(scaling.pow).mul(scaling.start)
  }
  return i
}

const getAntUpgCost = (bought: DecimalSource, baseCost: DecimalSource, index: number) => {
  let i = new Decimal(bought)
  i = Decimal.pow(G.antUpgradeCostIncreases[index - 1], bought).mul(baseCost)
  return i
}

const getAntUpgTarget = (amt: Decimal, baseCost: DecimalSource, index: number) => {
  if (amt.lt(baseCost)) { return new Decimal(0) }
  let i = amt
  i = amt.div(baseCost).log(G.antUpgradeCostIncreases[index - 1])
  return i
}

export const buyMaxProdAnts = (pos: FirstToEighth, baseCost: DecimalSource, index: number) => {
  const sacrificeMult = antSacrificePointsToMultiplier(player.antSacrificePoints)

  const tag = index === 1 ? 'reincarnationPoints' : 'antPoints'
  const key = `${pos}OwnedAnts` as const

  if (getAntProdTarget(player[tag], baseCost, index).lt(Number.MAX_SAFE_INTEGER)) {
    let boughtAnt = getAntProdTarget(player[tag], baseCost, index).sub(9).floor().max(player[key])
    let cost = getAntProdCost(boughtAnt, baseCost, index)

    for (let i = 0; i < 10; i++) {
      if (player[tag].lt(cost)) {
        break;
      }
      player[tag] = player[tag].sub(getAntProdCost(boughtAnt, baseCost, index))
      boughtAnt = boughtAnt.add(1)
      player[key] = boughtAnt
      cost = getAntProdCost(boughtAnt, baseCost, index)
      player[`${pos}CostAnts` as const] = cost
    }
  } else {
    const boughtAnt = getAntProdTarget(player[tag], baseCost, index).floor().add(1).max(player[key])
    player[key] = boughtAnt
    const cost = getAntProdCost(boughtAnt, baseCost, index)
    player[`${pos}CostAnts` as const] = cost
  }
  calculateAntSacrificeELO()

  // Check if we award Achievement 176-182: Ant autobuy
  const achRequirements = [2, 6, 20, 100, 500, 6666, 77777]
  for (let j = 0; j < achRequirements.length; j++) {
    if (
      player.achievements[176 + j] === 0 && Decimal.gt(sacrificeMult, achRequirements[j])
      && Decimal.gt(player[`${G.ordinals[j + 1 as ZeroToSeven]}OwnedAnts` as const], 0)
    ) {
      achievementaward(176 + j)
    }
  }

  // why is this cap here
  // if (Decimal.gt(player.firstOwnedAnts, 6.9e7)) {
  //   player.firstOwnedAnts = new Decimal(6.9e7)
  // }
}

export const buyAntProducers = (pos: FirstToEighth, originalCost: DecimalSource, index: number) => {
  buyMaxProdAnts(pos, originalCost, index)
}

export const buyMaxUpgAnts = (baseCost: DecimalSource, index: number, auto: boolean) => {
  if (player.currentChallenge.ascension !== 11) {
    if (getAntUpgTarget(player.antPoints, baseCost, index).lt(Number.MAX_SAFE_INTEGER)) {
      let boughtAnt = getAntUpgTarget(player.antPoints, baseCost, index).sub(9).floor().max(player.antUpgrades[index - 1]!)
      let cost = getAntUpgCost(boughtAnt, baseCost, index)
      for (let i = 0; i < 10; i++) {
        if (player.antPoints.lt(cost)) {
          break;
        }
        player.antPoints = player.antPoints.sub(getAntUpgCost(boughtAnt, baseCost, index))
        boughtAnt = boughtAnt.add(1)
        player.antUpgrades[index - 1] = boughtAnt
        cost = getAntUpgCost(boughtAnt, baseCost, index)
      }
    } else {
      const boughtAnt = getAntUpgTarget(player.antPoints, baseCost, index).floor().add(1).max(player.antUpgrades[index - 1]!)
      player.antUpgrades[index - 1] = boughtAnt
    }

    calculateAnts()
    calculateRuneLevels()
    calculateAntSacrificeELO()
    if (!auto) {
      antUpgradeDescription(index)
    }
    if (Decimal.eq(player.antUpgrades[12 - 1]!, 1) && index === 12) {
      revealStuff()
    }
  }
}

export const buyAntUpgrade = (originalCost: DecimalSource, auto: boolean, index: number) => {
  buyMaxUpgAnts(originalCost, index, auto)
}

export const antUpgradeDescription = (i: number) => {
  const el = DOMCacheGetOrSet('antspecies')
  const al = DOMCacheGetOrSet('antlevelbonus')
  const la = DOMCacheGetOrSet('antupgradedescription')
  const ti = DOMCacheGetOrSet('antupgradecost')
  const me = DOMCacheGetOrSet('antupgradeeffect')

  const content1 = antspecies[`antspecies${i}`]
  const content2 = i18next.t(`ants.upgrades.${i}`)
  const bonuslevel = G[`bonusant${i}` as keyof typeof G] as typeof G['bonusant1']

  const c11 = player.currentChallenge.ascension === 11 ? 999 : 0

  el.childNodes[0].textContent = `${content1} Level ${format(player.antUpgrades[i - 1])}`
  al.textContent = ` [+${format(Decimal.min(Decimal.add(player.antUpgrades[i - 1]!, c11), bonuslevel))}]`
  la.textContent = content2
  ti.textContent = i18next.t('ants.costGalacticCrumbs', {
    x: format(
      Decimal.pow(
        G.antUpgradeCostIncreases[i - 1],
        Decimal.mul(player.antUpgrades[i - 1]!, G.extinctionMultiplier[player.usedCorruptions[10]])
      ).times(G.antUpgradeBaseCost[i - 1])
    )
  })
  me.textContent = i18next.t(`ants.rewards.${i}`, {
    x: antUpgradeTexts[i - 1]()
  })
}

export const antSacrificePointsToMultiplier = (points: Decimal) => {
  let multiplier = Decimal.div(points, 5000).add(1).pow(2)
  multiplier = multiplier.mul(Decimal.add(points, 1).log10().mul(0.2).add(1))
  if (player.achievements[174] > 0) {
    multiplier = multiplier.mul(Decimal.add(points, 1).log10().mul(0.4).add(1))
  }
  return multiplier
}

export const showSacrifice = () => {
  const sacRewards = calculateAntSacrificeRewards()
  DOMCacheGetOrSet('antSacrificeSummary').style.display = 'block'

  DOMCacheGetOrSet('ELO').innerHTML = i18next.t('ants.yourAntELO', {
    x: format(G.antELO, 2),
    y: format(G.effectiveELO, 2, false)
  })

  DOMCacheGetOrSet('SacrificeMultiplier').innerHTML = i18next.t('ants.antSacMultiplier', {
    y: format(antSacrificePointsToMultiplier(player.antSacrificePoints), 3, false),
    x: format(antSacrificePointsToMultiplier(Decimal.add(player.antSacrificePoints, sacRewards.antSacrificePoints)), 3, false)
  })

  DOMCacheGetOrSet('SacrificeUpgradeMultiplier').innerHTML = i18next.t('ants.upgradeMultiplier', {
    x: format(G.upgradeMultiplier, 3, true)
  })

  DOMCacheGetOrSet('SacrificeTimeMultiplier').innerHTML = i18next.t('ants.timeMultiplier', {
    x: format(G.timeMultiplier, 3, true)
  })

  DOMCacheGetOrSet('antSacrificeOffering').textContent = `+${format(sacRewards.offerings)}`
  DOMCacheGetOrSet('antSacrificeObtainium').textContent = `+${format(sacRewards.obtainium)}`
  if (Decimal.gt(player.challengecompletions[9], 0)) {
    DOMCacheGetOrSet('antSacrificeTalismanShard').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.talismanShards),
      y: 500
    })
    DOMCacheGetOrSet('antSacrificeCommonFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.commonFragments),
      y: 750
    })
    DOMCacheGetOrSet('antSacrificeUncommonFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.uncommonFragments),
      y: 1000
    })
    DOMCacheGetOrSet('antSacrificeRareFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.rareFragments),
      y: 1500
    })
    DOMCacheGetOrSet('antSacrificeEpicFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.epicFragments),
      y: 2000
    })
    DOMCacheGetOrSet('antSacrificeLegendaryFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.legendaryFragments),
      y: 3000
    })
    DOMCacheGetOrSet('antSacrificeMythicalFragment').textContent = i18next.t('ants.elo', {
      x: format(sacRewards.mythicalFragments),
      y: 5000
    })
  }
}

export const sacrificeAnts = async (auto = false) => {
  let p = true

  if (player.antPoints.gte(1e40)) {
    if (!auto && player.toggles[32]) {
      p = await Confirm(i18next.t('ants.autoReset'))
    }
    if (p) {
      const antSacrificePointsBefore = player.antSacrificePoints

      const sacRewards = calculateAntSacrificeRewards()
      player.antSacrificePoints = player.antSacrificePoints.add(sacRewards.antSacrificePoints)
      player.runeshards = player.runeshards.add(sacRewards.offerings)

      if (player.currentChallenge.ascension !== 14) {
        player.researchPoints = player.researchPoints.add(sacRewards.obtainium)
      }

      const historyEntry: ResetHistoryEntryAntSacrifice = {
        date: Date.now(),
        seconds: player.antSacrificeTimer,
        kind: 'antsacrifice',
        offerings: sacRewards.offerings,
        obtainium: sacRewards.obtainium,
        antSacrificePointsBefore,
        antSacrificePointsAfter: player.antSacrificePoints,
        baseELO: G.antELO,
        effectiveELO: G.effectiveELO,
        crumbs: format(player.antPoints),
        crumbsPerSecond: format(G.antOneProduce)
      }

      if (Decimal.gt(player.challengecompletions[9], 0)) {
        player.talismanShards = Decimal.add(player.talismanShards, sacRewards.talismanShards)
        player.commonFragments = Decimal.add(player.commonFragments, sacRewards.commonFragments)
        player.uncommonFragments = Decimal.add(player.uncommonFragments, sacRewards.uncommonFragments)
        player.rareFragments = Decimal.add(player.rareFragments, sacRewards.rareFragments)
        player.epicFragments = Decimal.add(player.epicFragments, sacRewards.epicFragments)
        player.legendaryFragments = Decimal.add(player.legendaryFragments, sacRewards.legendaryFragments)
        player.mythicalFragments = Decimal.add(player.mythicalFragments, sacRewards.mythicalFragments)
      }

      // Now we're safe to reset the ants.
      resetAnts()
      player.antSacrificeTimer = new Decimal(0)
      player.antSacrificeTimerReal = new Decimal(0)
      updateTalismanInventory()
      if (player.autoResearch > 0 && player.autoResearchToggle) {
        const linGrowth = (player.autoResearch === 200) ? 0.01 : 0
        buyResearch(player.autoResearch, true, linGrowth)
      }
      calculateAntSacrificeELO()

      Synergism.emit('historyAdd', 'ants', historyEntry)
    }
  }

  if (player.mythicalFragments.gte(1e11) && player.currentChallenge.ascension === 14 && player.achievements[248] < 1) {
    achievementaward(248)
  }
}

export const autoBuyAnts = () => {
  const canAffordUpgrade = (x: number, m: DecimalSource) =>
    player.antPoints.gte(
      getAntUpgCost(Decimal.add(player.antUpgrades[x - 1]!, 1), G.antUpgradeBaseCost[x - 1], x).mul(m)
    )
  const ach = [176, 176, 177, 178, 178, 179, 180, 180, 181, 182, 182, 145]
  const cost = [100, 100, 1000, 1000, 1e5, 1e6, 1e8, 1e11, 1e15, 1e20, 1e40, 1e100]
  if (player.currentChallenge.ascension !== 11) {
    for (let i = 1; i <= ach.length; i++) {
      const check = i === 12 ? player.researches[ach[i - 1]] : player.achievements[ach[i - 1]]
      if (check && canAffordUpgrade(i, 2)) {
        buyAntUpgrade(cost[i - 1], true, i)
      }
    }
  }

  const _ach = [173, 176, 177, 178, 179, 180, 181, 182]
  const _cost = ['1e700', 3, 100, 10000, 1e12, 1e36, 1e100, 1e300]
  for (let i = 1; i <= _ach.length; i++) {
    const res = i === 1 ? player.reincarnationPoints : player.antPoints
    const m = i === 1 ? 1 : 2 // no multiplier on the first ant cost because it costs particles
    if (
      player.achievements[_ach[i - 1]]
      && res.gte(player[`${G.ordinals[i - 1 as ZeroToSeven]}CostAnts` as const].times(m))
    ) {
      buyAntProducers(
        G.ordinals[i - 1] as Parameters<typeof buyAntProducers>[0],
        _cost[i - 1],
        i
      )
    }
  }
}
