import Decimal from 'break_eternity.js'
import i18next from 'i18next'
import { showSacrifice } from './Ants'
import { DOMCacheGetOrSet } from './Cache/DOM'
import {
  calcAscensionCount,
  CalcCorruptionStuff,
  calculateAmbrosiaCubeMult,
  calculateAmbrosiaQuarkMult,
  calculateAutomaticObtainium,
  calculateCorruptionPoints,
  calculateCubeQuarkMultiplier,
  calculateMaxRunes,
  calculateRecycleMultiplier,
  calculateRequiredBlueberryTime,
  calculateRuneExpToLevel,
  calculateSigmoidExponential,
  calculateSummationLinearDecimal,
  calculateSummationNonLinearDecimal,
  calculateTimeAcceleration,
  calculateTotalOcteractCubeBonus,
  calculateTotalOcteractObtainiumBonus,
  calculateTotalOcteractOfferingBonus,
  calculateTotalOcteractQuarkBonus,
  constantEffects,
  getGoldenFragmentsEff,
  octeractGainPerSecond
} from './Calculate'
import { CalcECC } from './Challenges'
import { version } from './Config'
import type { IMultiBuy } from './Cubes'
import type { hepteractTypes } from './Hepteracts'
import { hepteractTypeList } from './Hepteracts'
import { getQuarkBonus, quarkHandler } from './Quark'
import { displayRuneInformation } from './Runes'
import { getShopCosts, isShopUpgradeUnlocked, shopData, shopUpgradeTypes } from './Shop'
import { getGoldenQuarkCost } from './singularity'
import { loadStatisticsUpdate } from './Statistics'
import { format, formatTimeShort, player } from './Synergism'
import { Tabs } from './Tabs'
import { calculateMaxTalismanLevel } from './Talismans'
import type { Player, ZeroToFour } from './types/Synergism'
import { sumContentsDecimal, sumContentsNumber } from './Utility'
import { Globals as G } from './Variables'

export const visualUpdateBuildings = () => {
  if (G.currentTab !== Tabs.Buildings) {
    return
  }

  // When you're in Building --> Coin, update these.
  if (G.buildingSubTab === 'coin') {
    // For the display of Coin Buildings
    const upper = [
      'produceFirst',
      'produceSecond',
      'produceThird',
      'produceFourth',
      'produceFifth'
    ] as const
    const names = [
      null,
      'workers',
      'investments',
      'printers',
      'coinMints',
      'alchemies'
    ]

    let totalProductionDivisor = new Decimal(G.produceTotal)
    if (totalProductionDivisor.equals(0)) {
      totalProductionDivisor = new Decimal(1)
    }

    for (let i = 1; i <= 5; i++) {
      const place = G[upper[i - 1]]
      const ith = G.ordinals[(i - 1) as ZeroToFour]

      DOMCacheGetOrSet(`buildtext${2 * i - 1}`).textContent = i18next.t(
        `buildings.names.${names[i]}`,
        {
          amount: format(player[`${ith}OwnedCoin` as const], 0, true),
          gain: format(player[`${ith}GeneratedCoin` as const])
        }
      )

      DOMCacheGetOrSet(`buycoin${i}`).textContent = i18next.t(
        'buildings.costCoins',
        {
          coins: format(player[`${ith}CostCoin` as const])
        }
      )

      const percentage = Decimal.fromMantissaExponent(
        place.mantissa / totalProductionDivisor.mantissa,
        place.exponent - totalProductionDivisor.exponent
      ).times(100)

      DOMCacheGetOrSet(`buildtext${2 * i}`).textContent = i18next.t(
        'buildings.coinsPerSecond',
        {
          coins: format(place.dividedBy(G.taxdivisor).times(40), 2),
          percent: format(percentage, 3)
        }
      )
    }

    DOMCacheGetOrSet('buildtext11').textContent = i18next.t(
      'buildings.names.accelerators',
      {
        amount: format(player.acceleratorBought, 0, true),
        gain: format(G.freeAccelerator, 0, true)
      }
    )

    DOMCacheGetOrSet('buildtext12').textContent = i18next.t(
      'buildings.acceleratorPower',
      {
        power: format(G.acceleratorPower.sub(1).mul(100), 2),
        mult: format(G.acceleratorEffect, 2)
      }
    )

    DOMCacheGetOrSet('buildtext13').textContent = i18next.t(
      'buildings.names.multipliers',
      {
        amount: format(player.multiplierBought, 0, true),
        gain: format(G.freeMultiplier, 0, true)
      }
    )

    DOMCacheGetOrSet('buildtext14').textContent = i18next.t(
      'buildings.multiplierPower',
      {
        power: format(G.multiplierPower, 2),
        mult: format(G.multiplierEffect, 2)
      }
    )

    DOMCacheGetOrSet('buildtext15').textContent = i18next.t(
      'buildings.names.acceleratorBoost',
      {
        amount: format(player.acceleratorBoostBought, 0, true),
        gain: format(G.freeAcceleratorBoost, 0, false)
      }
    )

    DOMCacheGetOrSet('buildtext16').textContent = i18next.t(
      'buildings.acceleratorBoost',
      {
        amount: format(
          Decimal.mul(G.tuSevenMulti, 1 + player.researches[16] / 50).mul(
            CalcECC('transcend', player.challengecompletions[2]).div(100).add(1)
          ),
          2
        )
      }
    )

    DOMCacheGetOrSet('buyaccelerator').textContent = i18next.t(
      'buildings.costCoins',
      {
        coins: format(player.acceleratorCost)
      }
    )
    DOMCacheGetOrSet('buymultiplier').textContent = i18next.t(
      'buildings.costCoins',
      {
        coins: format(player.multiplierCost)
      }
    )
    DOMCacheGetOrSet('buyacceleratorboost').textContent = i18next.t(
      'buildings.costDiamonds',
      {
        diamonds: format(player.acceleratorBoostCost)
      }
    )

    // update the tax text
    let warning = ''
    let rooted = ''
    if (player.reincarnationCount.gt(0.5)) {
      warning = i18next.t('buildings.taxWarning', {
        gain: format(
          Decimal.pow(10, Decimal.sub(G.maxexponent, G.taxdivisorcheck.log10()))
        )
      })
      rooted = i18next.t('buildings.taxCapped', {
        root: format(G.coinProduceTrue.max(1).log(G.produceTotal.max(10)), 4)
      })
    }

    DOMCacheGetOrSet('taxinfo').textContent = i18next.t(
      'buildings.excessiveWealth',
      {
        div: format(G.taxdivisor, 2),
        warning,
        rooted
      }
    )

    DOMCacheGetOrSet('sc1info').style.display = Decimal.gte(G.globalCoinMultiplier, 'ee20') ? 'block' : 'none'
    DOMCacheGetOrSet('sc1info').textContent = i18next.t(
      'buildings.softcappedWealth',
      {
        start: format(G.coinSC1Start),
        root: format(G.coinSC1Eff, 4),
        result: format(G.coinAfterSc1)
      }
    )
  } else if (G.buildingSubTab === 'diamond') {
    // For the display of Diamond Buildings
    const upper = [
      'produceFirstDiamonds',
      'produceSecondDiamonds',
      'produceThirdDiamonds',
      'produceFourthDiamonds',
      'produceFifthDiamonds'
    ] as const
    const names = [
      'refineries',
      'coalPlants',
      'coalRigs',
      'pickaxes',
      'pandorasBoxes'
    ]
    const perSecNames = ['crystal', 'ref', 'plants', 'rigs', 'pickaxes']

    DOMCacheGetOrSet('prestigeshardinfo').textContent = i18next.t(
      'buildings.crystalMult',
      {
        crystals: format(player.prestigeShards, 2),
        gain: format(G.prestigeMultiplier, 2)
      }
    )

    for (let i = 1; i <= 5; i++) {
      const place = G[upper[i - 1]]
      const ith = G.ordinals[(i - 1) as ZeroToFour]

      DOMCacheGetOrSet(`prestigetext${2 * i - 1}`).textContent = i18next.t(
        `buildings.names.${names[i - 1]}`,
        {
          amount: format(player[`${ith}OwnedDiamonds` as const], 0, true),
          gain: format(player[`${ith}GeneratedDiamonds` as const], 2)
        }
      )

      DOMCacheGetOrSet(`prestigetext${2 * i}`).textContent = i18next.t(
        `buildings.per.${perSecNames[i - 1]}`,
        {
          amount: format(place.times(40), 2)
        }
      )

      DOMCacheGetOrSet(`buydiamond${i}`).textContent = i18next.t(
        'buildings.costDiamonds',
        {
          diamonds: format(player[`${ith}CostDiamonds` as const], 2)
        }
      )
    }

    if (player.resettoggle1 === 1 || player.resettoggle1 === 0) {
      const p = Decimal.pow(
        10,
        Decimal.sub(G.prestigePointGain.add(1).log10(), player.prestigePoints.add(1).log10())
      )
      DOMCacheGetOrSet('autoprestige').textContent = i18next.t(
        'buildings.autoPrestige',
        {
          name: 'Diamonds',
          action: 'Prestige',
          factor: format(Decimal.pow(10, player.prestigeamount)),
          mult: format(p)
        }
      )
    } else if (player.resettoggle1 === 2) {
      DOMCacheGetOrSet('autoprestige').textContent = i18next.t(
        'buildings.autoReincarnate',
        {
          name: 'Prestige',
          amount: player.prestigeamount,
          timer: format(G.autoResetTimers.prestige, 1)
        }
      )
    }
  } else if (G.buildingSubTab === 'mythos') {
    // For the display of Mythos Buildings
    const upper = [
      'produceFirstMythos',
      'produceSecondMythos',
      'produceThirdMythos',
      'produceFourthMythos',
      'produceFifthMythos'
    ] as const
    const names = [
      'augments',
      'enchantments',
      'wizards',
      'oracles',
      'grandmasters'
    ]
    const perSecNames = [
      'shards',
      'augments',
      'enchantments',
      'wizards',
      'oracles'
    ]

    DOMCacheGetOrSet('transcendshardinfo').textContent = i18next.t(
      'buildings.mythosYouHave',
      {
        shards: format(player.transcendShards, 2),
        mult: format(G.totalMultiplierBoost, 0, true)
      }
    )

    for (let i = 1; i <= 5; i++) {
      const place = G[upper[i - 1]]
      const ith = G.ordinals[(i - 1) as ZeroToFour]

      DOMCacheGetOrSet(`transcendtext${2 * i - 1}`).textContent = i18next.t(
        `buildings.names.${names[i - 1]}`,
        {
          amount: format(player[`${ith}OwnedMythos` as const], 0, true),
          gain: format(player[`${ith}GeneratedMythos` as const], 2)
        }
      )

      DOMCacheGetOrSet(`transcendtext${2 * i}`).textContent = i18next.t(
        `buildings.per.${perSecNames[i - 1]}`,
        {
          amount: format(place.times(40), 2)
        }
      )

      DOMCacheGetOrSet(`buymythos${i}`).textContent = i18next.t(
        'buildings.costMythos',
        {
          mythos: format(player[`${ith}CostMythos` as const], 2)
        }
      )
    }

    if (player.resettoggle2 === 1 || player.resettoggle2 === 0) {
      DOMCacheGetOrSet('autotranscend').textContent = i18next.t(
        'buildings.autoPrestige',
        {
          name: 'Mythos',
          action: 'Prestige',
          factor: format(Decimal.pow(10, player.transcendamount)),
          mult: format(
            Decimal.pow(
              10,
              Decimal.sub(G.transcendPointGain.add(1).log10(), player.transcendPoints.add(1).log10())
            ),
            2
          )
        }
      )
    }
    if (player.resettoggle2 === 2) {
      // TODO(@KhafraDev): i18n this
      DOMCacheGetOrSet(
        'autotranscend'
      ).textContent =
        `Transcend when the autotimer is at least ${player.transcendamount} real-life seconds. [Toggle number above]. Current timer: ${
          format(
            G.autoResetTimers.transcension,
            1
          )
        }s.`
    }
  } else if (G.buildingSubTab === 'particle') {
    // For the display of Particle Buildings
    const upper = [
      'FirstParticles',
      'SecondParticles',
      'ThirdParticles',
      'FourthParticles',
      'FifthParticles'
    ] as const
    const names = [
      'protons',
      'elements',
      'pulsars',
      'quasars',
      'galacticNuclei'
    ]
    const perSecNames = ['atoms', 'protons', 'elements', 'pulsars', 'quasars']

    for (let i = 1; i <= 5; i++) {
      const ith = G.ordinals[(i - 1) as ZeroToFour]
      const place = G[`produce${upper[i - 1]}` as const]

      DOMCacheGetOrSet(`reincarnationtext${i}`).textContent = i18next.t(
        `buildings.names.${names[i - 1]}`,
        {
          amount: format(player[`${ith}OwnedParticles` as const], 0, true),
          gain: format(player[`${ith}GeneratedParticles` as const], 2)
        }
      )
      DOMCacheGetOrSet(`reincarnationtext${i + 5}`).textContent = i18next.t(
        `buildings.per.${perSecNames[i - 1]}`,
        {
          amount: format(place.times(40), 2)
        }
      )
      DOMCacheGetOrSet(`buyparticles${i}`).textContent = i18next.t(
        'buildings.costParticles',
        {
          particles: format(player[`${ith}CostParticles` as const], 2)
        }
      )
    }

    DOMCacheGetOrSet('reincarnationshardinfo').textContent = i18next.t(
      'buildings.atomsYouHave',
      {
        atoms: format(player.reincarnationShards, 2),
        power: format(G.buildingPower, 4),
        mult: format(G.reincarnationMultiplier)
      }
    )

    DOMCacheGetOrSet('reincarnationCrystalInfo').textContent = i18next.t(
      'buildings.thanksR2x14',
      {
        mult: format(G.reincarnationMultiplier.add(10).log10().pow(0.9).mul(0.2).pow10(), 3, false)
      }
    )

    DOMCacheGetOrSet('reincarnationMythosInfo').textContent = i18next.t(
      'buildings.thanksR2x15',
      {
        mult: format(G.reincarnationMultiplier.add(10).log10().pow(0.8).mul(0.15).pow10(), 3, false)
      }
    )

    if (player.resettoggle3 === 1 || player.resettoggle3 === 0) {
      DOMCacheGetOrSet('autoreincarnate').textContent = i18next.t(
        'buildings.autoPrestige',
        {
          name: 'Particles',
          action: 'Reincarnate',
          factor: format(Decimal.pow(10, player.reincarnationamount)),
          mult: format(
            Decimal.pow(
              10,
              Decimal.sub(G.reincarnationPointGain.add(1).log10(), player.reincarnationPoints.add(1).log10())
            ),
            2
          )
        }
      )
    } else if (player.resettoggle3 === 2) {
      DOMCacheGetOrSet('autoreincarnate').textContent = i18next.t(
        'buildings.autoReincarnate',
        {
          name: 'Reincarnate',
          amount: player.reincarnationamount,
          timer: format(G.autoResetTimers.reincarnation, 1)
        }
      )
    }
  } else if (G.buildingSubTab === 'tesseract') {
    const names = ['dot', 'vector', 'threeSpace', 'bentTime', 'hilbertSpace']
    const perSecNames = ['constant', 'dot', 'vector', 'threeSpace', 'bentTime']

    for (let i = 1; i <= 5; i++) {
      const ascendBuildingI = `ascendBuilding${i as 1 | 2 | 3 | 4 | 5}` as const

      DOMCacheGetOrSet(`ascendText${i}`).textContent = i18next.t(
        `buildings.names.${names[i - 1]}`,
        {
          amount: format(player[ascendBuildingI].owned, 0, true),
          gain: format(player[ascendBuildingI].generated, 2)
        }
      )

      DOMCacheGetOrSet(`ascendText${5 + i}`).textContent = i18next.t(
        `buildings.per.${perSecNames[i - 1]}`,
        {
          amount: format(
            (G.ascendBuildingProduction as Record<string, Decimal>)[
              G.ordinals[i - 1]
            ],
            2
          )
        }
      )

      DOMCacheGetOrSet(`buyTesseracts${i}`).textContent = i18next.t(
        'buildings.costTesseracts',
        {
          tesseracts: format(player[ascendBuildingI].cost)
        }
      )
    }

    DOMCacheGetOrSet('tesseractInfo').textContent = i18next.t(
      'buildings.tesseractsYouHave',
      {
        tesseracts: format(player.wowTesseracts.value)
      }
    )

    DOMCacheGetOrSet('ascendShardInfo').textContent = i18next.t(
      'buildings.constantYouHave',
      {
        const: format(player.ascendShards, 2)
      }
    )

    DOMCacheGetOrSet('ascendShardEff1').textContent = i18next.t(
      'buildings.constantEff1',
      {
        x: format(constantEffects().tax, 4, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff2').textContent = i18next.t(
      'buildings.constantEff2',
      {
        x: format(constantEffects().antSoftcap, 2, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff3').style.display = Decimal.gte(player.ascendShards, 1e3) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff3').textContent = i18next.t(
      'buildings.constantEff3',
      {
        x: format(constantEffects().particleBuildingScale, 0, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff4').style.display = Decimal.gte(player.ascendShards, 1e6) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff4').textContent = i18next.t(
      'buildings.constantEff4',
      {
        x: format(constantEffects().buildingSlowDown, 3, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff5').style.display = Decimal.gte(player.ascendShards, 1e10) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff5').textContent = i18next.t(
      'buildings.constantEff5',
      {
        x: format(constantEffects().c3Effect, 2, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff6').style.display = Decimal.gte(player.ascendShards, 1e30) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff6').textContent = i18next.t(
      'buildings.constantEff6',
      {
        x: format(constantEffects().cubeSoftcap, 4, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff7').style.display = Decimal.gte(player.ascendShards, 1e100) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff7').textContent = i18next.t(
      'buildings.constantEff7',
      {
        x: format(constantEffects().accelScale[0], 2, true),
        y: format(constantEffects().accelScale[1], 2, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff8').style.display = Decimal.gte(player.ascendShards, 1e308) ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff8').textContent = i18next.t(
      'buildings.constantEff8',
      {
        x: format(constantEffects().multScale[0], 2, true),
        y: format(constantEffects().multScale[1], 2, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff9').style.display = Decimal.gte(player.ascendShards, '1e616') ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff9').textContent = i18next.t(
      'buildings.constantEff9',
      {
        x: format(constantEffects().boostScale, 3, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff10').style.display = Decimal.gte(player.ascendShards, '1e1000') ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff10').textContent = i18next.t(
      'buildings.constantEff10',
      {
        x: format(constantEffects().siEffectPower, 4, true)
      }
    )

    DOMCacheGetOrSet('ascendShardEff11').style.display = Decimal.gte(player.ascendShards, 'e100000') ? 'block' : 'none'
    DOMCacheGetOrSet('ascendShardEff11').textContent = i18next.t(
      'buildings.constantEff11',
      {
        x: format(constantEffects().pBuildEff, 4, true)
      }
    )

    if (player.resettoggle4 === 1 || player.resettoggle4 === 0) {
      DOMCacheGetOrSet('autotessbuyeramount').textContent = i18next.t(
        'buildings.autoTesseract',
        {
          tesseracts: format(player.tesseractAutoBuyerAmount)
        }
      )
    } else if (player.resettoggle4 === 2) {
      DOMCacheGetOrSet('autotessbuyeramount').textContent = i18next.t(
        'buildings.autoAscensionTesseract',
        {
          percent: format(Math.min(100, player.tesseractAutoBuyerAmount))
        }
      )
    }
  } else if (G.buildingSubTab === 'golden') {
    const names = ['gq1', 'gq2', 'gq3', 'gq4', 'gq5']
    const perSecNames = ['fragments', 'gq1', 'gq2', 'gq3', 'gq4']

    for (let i = 1; i <= 5; i++) {
      const gqBuildingI = `gcBuilding${i as 1 | 2 | 3 | 4 | 5}` as const

      DOMCacheGetOrSet(`gqText${i}`).textContent = i18next.t(
        `buildings.names.${names[i - 1]}`,
        {
          amount: format(player[gqBuildingI].owned, 0, true),
          gain: format(player[gqBuildingI].generated, 2)
        }
      )

      DOMCacheGetOrSet(`gqText${5 + i}`).textContent = i18next.t(
        `buildings.per.${perSecNames[i - 1]}`,
        {
          amount: format(
            (G.goldenQuarkBuildingProduction as Record<string, Decimal>)[
              G.ordinals[i - 1]
            ],
            2
          )
        }
      )

      DOMCacheGetOrSet(`buyGoldenQuarks${i}`).textContent = i18next.t(
        'buildings.costGoldenQuarks',
        {
          goldenQuarks: format(player[gqBuildingI].cost)
        }
      )
    }

    DOMCacheGetOrSet('gqInfo').textContent = i18next.t(
      'buildings.gqsYouHave',
      {
        gqs: format(player.goldenQuarks)
      }
    )

    DOMCacheGetOrSet('gfInfo').textContent = i18next.t(
      'buildings.gfragYouHave',
      {
        frag: format(player.goldenFragments, 2)
      }
    )

    DOMCacheGetOrSet('gfEff1').textContent = i18next.t(
      'buildings.gqEff1',
      {
        x: format(getGoldenFragmentsEff().GQpersecond, 4, true)
      }
    )

    DOMCacheGetOrSet('gfEff2').textContent = i18next.t(
      'buildings.gqEff2',
      {
        x: format(getGoldenFragmentsEff().quarkBonus.sub(1).mul(100), 2, true)
      }
    )

    DOMCacheGetOrSet('gfEff3').style.display = Decimal.gte(player.goldenFragments, 1e3) ? 'block' : 'none'
    DOMCacheGetOrSet('gfEff3').textContent = i18next.t(
      'buildings.gqEff3',
      {
        x: format(getGoldenFragmentsEff().gameSpeed, 0, true)
      }
    )
  }
}

export const visualUpdateUpgrades = () => {}

export const visualUpdateAchievements = () => {}

export const visualUpdateRunes = () => {
  if (G.currentTab !== Tabs.Runes) {
    return
  }
  if (G.runescreen === 'runes') {
    // Placeholder and place work similarly to buildings, except for the specific Talismans.
    const talismans = [
      'rune1Talisman',
      'rune2Talisman',
      'rune3Talisman',
      'rune4Talisman',
      'rune5Talisman'
    ] as const

    DOMCacheGetOrSet('offeringCount').textContent = i18next.t(
      'runes.offeringsYouHave',
      {
        offerings: format(player.runeshards, 0, true)
      }
    )

    for (let i = 1; i <= 7; i++) {
      // First one updates level, second one updates TNL, third updates orange bonus levels
      let place = G[talismans[i - 1]]
      if (i > 5) {
        place = new Decimal(0)
      }
      const runeLevel = player.runelevels[i - 1]
      const maxLevel = calculateMaxRunes(i)
      DOMCacheGetOrSet(`rune${i}level`).childNodes[0].textContent = i18next.t(
        'cubes.cubeMetadata.level',
        {
          value1: format(runeLevel),
          value2: format(maxLevel)
        }
      )

      if (Decimal.lt(runeLevel, maxLevel)) {
        DOMCacheGetOrSet(`rune${i}exp`).textContent = i18next.t('runes.TNL', {
          EXP: format(
            Decimal.sub(calculateRuneExpToLevel(i - 1), player.runeexp[i - 1]),
            2
          )
        })
      } else {
        DOMCacheGetOrSet(`rune${i}exp`).textContent = i18next.t('runes.maxLevel')
      }
      if (i <= 5) {
        DOMCacheGetOrSet(`bonusrune${i}`).textContent = i18next.t(
          'runes.bonusAmount',
          {
            x: format(
              Decimal.mul(7, player.constantUpgrades[7])
                .add(Decimal.min(1e7, Decimal.add(player.antUpgrades[8]!, G.bonusant9)))
                .add(place)
            )
          }
        )
      } else {
        DOMCacheGetOrSet(`bonusrune${i}`).textContent = i18next.t('runes.bonusNope')
      }
      displayRuneInformation(i, false)
    }

    const calculateRecycle = calculateRecycleMultiplier()
    const allRuneExpAdditiveMultiplier = sumContentsDecimal([
      // Base amount multiplied per offering
      calculateRecycle,
      // +1 if C1 completion
      Decimal.min(1, player.highestchallengecompletions[1]),
      // +0.10 per C1 completion
      Decimal.mul(0.04, player.highestchallengecompletions[1]),
      // Research 5x2
      0.6 * player.researches[22],
      // Research 5x3
      0.3 * player.researches[23],
      // Particle Upgrade 1x1
      2 * player.upgrades[61]
    ])

    DOMCacheGetOrSet('offeringExperienceValue').textContent = i18next.t(
      'runes.gainExp',
      {
        amount: format(allRuneExpAdditiveMultiplier, 2, true)
      }
    )

    DOMCacheGetOrSet('offeringRecycleInfo').textContent = i18next.t(
      'runes.recycleChance',
      {
        percent: format(Decimal.sub(1, calculateRecycle.recip()).mul(100), 2, true),
        mult: format(calculateRecycle, 2, true)
      }
    )
  }

  if (G.runescreen === 'talismans') {
    for (let i = 0; i < 7; i++) {
      const maxTalismanLevel = calculateMaxTalismanLevel(i)
      // TODO(@KhafraDev): i18n
      DOMCacheGetOrSet(`talisman${i + 1}level`).textContent = `${player.ascensionCount.gt(0) ? '' : 'Level '} ${
        format(player.talismanLevels[i])
      }/${format(maxTalismanLevel)}`
    }
  }

  if (G.runescreen === 'blessings') {
    const blessingMultiplierArray = [0, 8, 10, 6.66, 2, 1]
    let t = 0
    for (let i = 1; i <= 5; i++) {
      DOMCacheGetOrSet(`runeBlessingLevel${i}Value`).innerHTML = i18next.t(
        'runes.blessings.blessingLevel',
        {
          amount: format(player.runeBlessingLevels[i])
        }
      )

      DOMCacheGetOrSet(`runeBlessingPower${i}Value1`).innerHTML = i18next.t(
        'runes.blessings.blessingPower',
        {
          reward: i18next.t(`runes.blessings.rewards.${i - 1}`),
          value: format(G.runeBlessings[i]),
          speed: format(
            Decimal.sub(1, t).add(Decimal.mul(blessingMultiplierArray[i], G.effectiveRuneBlessingPower[i])),
            4,
            true
          )
        }
      )

      const levelsPurchasable = calculateSummationLinearDecimal(
        player.runeBlessingLevels[i],
        G.blessingBaseCost,
        player.runeshards,
        player.runeBlessingBuyAmount
      )[0].sub(player.runeBlessingLevels[i])
      levelsPurchasable.gt(0)
        ? DOMCacheGetOrSet(`runeBlessingPurchase${i}`).classList.add(
          'runeButtonsAvailable'
        )
        : DOMCacheGetOrSet(`runeBlessingPurchase${i}`).classList.remove(
          'runeButtonsAvailable'
        )

      DOMCacheGetOrSet(`runeBlessingPurchase${i}`).innerHTML = i18next.t(
        'runes.blessings.increaseLevel',
        {
          amount: format(Decimal.max(1, levelsPurchasable)),
          offerings: format(
            Decimal.max(
              Decimal.mul(G.blessingBaseCost, Decimal.add(1, player.runeBlessingLevels[i])),
              calculateSummationLinearDecimal(
                player.runeBlessingLevels[i],
                G.blessingBaseCost,
                player.runeshards,
                player.runeBlessingBuyAmount
              )[1]
            )
          )
        }
      )

      if (i === 5) {
        t = 1
      }
    }
  }

  if (G.runescreen === 'spirits') {
    const spiritMultiplierArray = [
      new Decimal(0),
      new Decimal(1),
      new Decimal(1),
      new Decimal(20),
      new Decimal(1),
      new Decimal(100)
    ]
    const subtract = [0, 0, 0, 1, 0, 0]
    for (let i = 1; i <= 5; i++) {
      spiritMultiplierArray[i] = spiritMultiplierArray[i].mul(calculateCorruptionPoints().div(400))

      DOMCacheGetOrSet(`runeSpiritLevel${i}Value`).innerHTML = i18next.t(
        'runes.spirits.spiritLevel',
        {
          amount: format(player.runeSpiritLevels[i])
        }
      )

      DOMCacheGetOrSet(`runeSpiritPower${i}Value1`).innerHTML = i18next.t(
        'runes.spirits.spiritPower',
        {
          reward: i18next.t(`runes.spirits.rewards.${i - 1}`),
          value: format(G.runeSpirits[i]),
          speed: format(
            Decimal.sub(1, subtract[i]).add(Decimal.mul(spiritMultiplierArray[i], G.effectiveRuneSpiritPower[i])),
            4,
            true
          )
        }
      )

      const levelsPurchasable = calculateSummationLinearDecimal(
        player.runeSpiritLevels[i],
        G.spiritBaseCost,
        player.runeshards,
        player.runeSpiritBuyAmount
      )[0].sub(player.runeSpiritLevels[i])
      levelsPurchasable.gt(0)
        ? DOMCacheGetOrSet(`runeSpiritPurchase${i}`).classList.add(
          'runeButtonsAvailable'
        )
        : DOMCacheGetOrSet(`runeSpiritPurchase${i}`).classList.remove(
          'runeButtonsAvailable'
        )

      DOMCacheGetOrSet(`runeSpiritPurchase${i}`).innerHTML = i18next.t(
        'runes.blessings.increaseLevel',
        {
          amount: format(Decimal.max(1, levelsPurchasable)),
          offerings: format(
            Decimal.max(
              Decimal.mul(G.spiritBaseCost, Decimal.add(1, player.runeSpiritLevels[i])),
              calculateSummationLinearDecimal(
                player.runeSpiritLevels[i],
                G.spiritBaseCost,
                player.runeshards,
                player.runeSpiritBuyAmount
              )[1]
            )
          )
        }
      )
    }
  }
}

export const visualUpdateChallenges = () => {
  if (G.currentTab !== Tabs.Challenges) {
    return
  }
  if (player.researches[150] > 0) {
    DOMCacheGetOrSet('autoIncrementerAmount').innerHTML = i18next.t(
      'challenges.autoTimer',
      {
        time: format(G.autoChallengeTimerIncrement, 2)
      }
    )
  }
}

export const visualUpdateResearch = () => {
  if (G.currentTab !== Tabs.Research) {
    return
  }

  if (player.researches[61] > 0) {
    DOMCacheGetOrSet('automaticobtainium').textContent = i18next.t(
      'researches.thanksToResearches',
      {
        x: format(
          Decimal.mul(calculateAutomaticObtainium(), calculateTimeAcceleration().mult),
          3,
          true
        )
      }
    )
  }
}

export const visualUpdateAnts = () => {
  if (G.currentTab !== Tabs.AntHill) {
    return
  }
  DOMCacheGetOrSet('crumbcount').textContent = i18next.t(
    'ants.youHaveGalacticCrumbs',
    {
      x: format(player.antPoints, 2),
      y: format(G.antOneProduce, 2),
      z: format(
        Decimal.pow(
          Decimal.max(1, player.antPoints),
          new Decimal(100000)
            .add(
              calculateSigmoidExponential(
                49900000,
                ((Decimal.add(player.antUpgrades[1]!, G.bonusant2).div(5000)).mul(500)).div(499)
              )
            )
        )
      )
    }
  )

  const mode = player.autoAntSacrificeMode === 2
    ? i18next.t('ants.modeRealTime')
    : i18next.t('ants.modeInGameTime')
  const timer = player.autoAntSacrificeMode === 2
    ? player.antSacrificeTimerReal
    : player.antSacrificeTimer

  DOMCacheGetOrSet('autoAntSacrifice').textContent = i18next.t(
    'ants.sacrificeWhenTimer',
    {
      x: player.autoAntSacTimer,
      y: mode,
      z: format(timer, 2)
    }
  )

  if (player.achievements[173] === 1) {
    DOMCacheGetOrSet('antSacrificeTimer').textContent = formatTimeShort(
      player.antSacrificeTimer
    )
    showSacrifice()
  }
}

interface cubeNames {
  cube: number
  tesseract: number
  hypercube: number
  platonicCube: number
}

export const visualUpdateCubes = () => {
  if (G.currentTab !== Tabs.WowCubes) {
    return
  }

  const cubeMult = player.shopUpgrades.cubeToQuark ? 1.5 : 1
  const tesseractMult = player.shopUpgrades.tesseractToQuark ? 1.5 : 1
  const hypercubeMult = player.shopUpgrades.hypercubeToQuark ? 1.5 : 1
  const platonicMult = 1.5

  const toNextQuark: cubeNames = {
    cube: Number(
      player.wowCubes.checkCubesToNextQuark(
        5,
        cubeMult,
        player.cubeQuarkDaily,
        player.cubeOpenedDaily
      )
    ),
    tesseract: Number(
      player.wowTesseracts.checkCubesToNextQuark(
        7,
        tesseractMult,
        player.tesseractQuarkDaily,
        player.tesseractOpenedDaily
      )
    ),
    hypercube: Number(
      player.wowHypercubes.checkCubesToNextQuark(
        10,
        hypercubeMult,
        player.hypercubeQuarkDaily,
        player.hypercubeOpenedDaily
      )
    ),
    platonicCube: Number(
      player.wowPlatonicCubes.checkCubesToNextQuark(
        15,
        platonicMult,
        player.platonicCubeQuarkDaily,
        player.platonicCubeOpenedDaily
      )
    )
  }

  const names = Object.keys(toNextQuark) as (keyof cubeNames)[]
  for (const name of names) {
    DOMCacheGetOrSet(`${name}QuarksToday`).innerHTML = i18next.t(
      `wowCubes.quarks.${name}QuarksToday`,
      {
        amount: format(player[`${name}QuarkDaily` as const])
      }
    )
    DOMCacheGetOrSet(`${name}QuarksOpenToday`).innerHTML = i18next.t(
      `wowCubes.quarks.${name}QuarksOpenToday`,
      {
        amount: format(player[`${name}OpenedDaily` as const])
      }
    )
    DOMCacheGetOrSet(`${name}QuarksOpenRequirement`).innerHTML = i18next.t(
      `wowCubes.quarks.${name}QuarksOpenRequirement`,
      { amount: format(Math.max(1, toNextQuark[name])) }
    )

    // Change color of requirement text if 1 or less required :D
    DOMCacheGetOrSet(`${name}QuarksOpenRequirement`).style.color = Math.max(1, toNextQuark[name]) === 1
      ? 'gold'
      : 'white'
  }

  // TODO: this code is fucking terrible holy shit. Also pretty sure there's a bug.
  let accuracy: [null | number, ...number[]]
  switch (player.subtabNumber) {
    case 0: {
      if (player.autoOpenCubes) {
        DOMCacheGetOrSet('openCubes').textContent = i18next.t(
          'wowCubes.autoOn',
          {
            percent: format(player.openCubes, 0)
          }
        )
      }
      DOMCacheGetOrSet('cubeQuantity').innerHTML = i18next.t(
        'wowCubes.cubes.inventory',
        {
          amount: format(player.wowCubes.value, 0, true)
        }
      )
      const cubeArray = [
        null,
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

      accuracy = [null, 2, 2, 2, 2, 2, 2, 2, 1, 4, 3]
      for (let i = 1; i <= 10; i++) {
        let augmentAccuracy = 0

        let start = new Decimal(1000)
        start = start.mul(constantEffects().cubeSoftcap)
        if (Decimal.gte(cubeArray[i]!, start) && i !== 6) {
          augmentAccuracy += 2
        }
        const aestheticMultiplier = i === 1 || i === 8 || i === 9 ? 1 : 100
        DOMCacheGetOrSet(`cube${i}Bonus`).innerHTML = i18next.t(
          `wowCubes.cubes.items.${i}`,
          {
            amount: format(cubeArray[i], 0, true),
            bonus: format(
              Decimal.mul(aestheticMultiplier, G.cubeBonusMultiplier[i]!.sub(1)),
              accuracy[i]! + augmentAccuracy,
              true
            )
          }
        )
      }
      DOMCacheGetOrSet('cubeBlessingsTotal').innerHTML = i18next.t(
        'wowCubes.cubes.total',
        {
          amount: format(sumContentsDecimal(cubeArray.slice(1) as Decimal[]), 0, true)
        }
      )
      break
    }
    case 1: {
      if (player.autoOpenTesseracts) {
        DOMCacheGetOrSet('openTesseracts').textContent = i18next.t(
          'wowCubes.autoOn',
          {
            percent: format(player.openTesseracts, 0)
          }
        )
      }
      DOMCacheGetOrSet('tesseractQuantity').innerHTML = i18next.t(
        'wowCubes.tesseracts.inventory',
        {
          amount: format(player.wowTesseracts.value, 0, true)
        }
      )
      const tesseractArray = [
        null,
        player.tesseractBlessings.accelerator,
        player.tesseractBlessings.multiplier,
        player.tesseractBlessings.offering,
        player.tesseractBlessings.runeExp,
        player.tesseractBlessings.obtainium,
        player.tesseractBlessings.antSpeed,
        player.tesseractBlessings.antSacrifice,
        player.tesseractBlessings.antELO,
        player.tesseractBlessings.talismanBonus,
        player.tesseractBlessings.globalSpeed
      ]
      accuracy = [null, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      for (let i = 1; i <= 10; i++) {
        let augmentAccuracy = 0
        if (Decimal.gte(tesseractArray[i]!, 1000) && i !== 6) {
          augmentAccuracy += 2
        }
        DOMCacheGetOrSet(`tesseract${i}Bonus`).innerHTML = i18next.t(
          `wowCubes.tesseracts.items.${i}`,
          {
            amount: format(tesseractArray[i], 0, true),
            bonus: format(
              G.tesseractBonusMultiplier[i]!.sub(1).mul(100),
              accuracy[i]! + augmentAccuracy,
              true
            )
          }
        )
      }
      DOMCacheGetOrSet('tesseractBlessingsTotal').innerHTML = i18next.t(
        'wowCubes.tesseracts.total',
        {
          amount: format(
            sumContentsDecimal(tesseractArray.slice(1) as Decimal[]),
            0,
            true
          )
        }
      )
      break
    }
    case 2: {
      if (player.autoOpenHypercubes) {
        DOMCacheGetOrSet('openHypercubes').textContent = i18next.t(
          'wowCubes.autoOn',
          {
            percent: format(player.openHypercubes, 0)
          }
        )
      }
      DOMCacheGetOrSet('hypercubeQuantity').innerHTML = i18next.t(
        'wowCubes.hypercubes.inventory',
        {
          amount: format(player.wowHypercubes.value, 0, true)
        }
      )
      const hypercubeArray = [
        null,
        player.hypercubeBlessings.accelerator,
        player.hypercubeBlessings.multiplier,
        player.hypercubeBlessings.offering,
        player.hypercubeBlessings.runeExp,
        player.hypercubeBlessings.obtainium,
        player.hypercubeBlessings.antSpeed,
        player.hypercubeBlessings.antSacrifice,
        player.hypercubeBlessings.antELO,
        player.hypercubeBlessings.talismanBonus,
        player.hypercubeBlessings.globalSpeed
      ]
      accuracy = [null, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      for (let i = 1; i <= 10; i++) {
        let augmentAccuracy = 0
        if (Decimal.gte(hypercubeArray[i]!, 1000)) {
          augmentAccuracy += 2
        }
        DOMCacheGetOrSet(`hypercube${i}Bonus`).innerHTML = i18next.t(
          `wowCubes.hypercubes.items.${i}`,
          {
            amount: format(hypercubeArray[i], 0, true),
            bonus: format(
              G.hypercubeBonusMultiplier[i]!.sub(1).mul(100),
              accuracy[i]! + augmentAccuracy,
              true
            )
          }
        )
      }
      DOMCacheGetOrSet('hypercubeBlessingsTotal').innerHTML = i18next.t(
        'wowCubes.hypercubes.total',
        {
          amount: format(
            sumContentsDecimal(hypercubeArray.slice(1) as Decimal[]),
            0,
            true
          )
        }
      )
      break
    }
    case 3: {
      if (player.autoOpenPlatonicsCubes) {
        DOMCacheGetOrSet('openPlatonicCube').textContent = i18next.t(
          'wowCubes.autoOn',
          {
            percent: format(player.openPlatonicsCubes, 0)
          }
        )
      }
      DOMCacheGetOrSet('platonicQuantity').innerHTML = i18next.t(
        'wowCubes.platonics.inventory',
        {
          amount: format(player.wowPlatonicCubes.value, 0, true)
        }
      )
      const platonicArray = [
        player.platonicBlessings.cubes,
        player.platonicBlessings.tesseracts,
        player.platonicBlessings.hypercubes,
        player.platonicBlessings.platonics,
        player.platonicBlessings.hypercubeBonus,
        player.platonicBlessings.taxes,
        player.platonicBlessings.scoreBonus,
        player.platonicBlessings.globalSpeed
      ]
      const DRThreshold = [4e6, 4e6, 4e6, 8e4, 1e4, 1e4, 1e4, 1e4]
      accuracy = [5, 5, 5, 5, 2, 3, 3, 2]
      for (let i = 0; i < platonicArray.length; i++) {
        let augmentAccuracy = 0
        if (Decimal.gte(platonicArray[i], DRThreshold[i])) {
          augmentAccuracy += 1
        }
        DOMCacheGetOrSet(`platonicCube${i + 1}Bonus`).innerHTML = i18next.t(
          `wowCubes.platonics.items.${i + 1}`,
          {
            amount: format(platonicArray[i], 0, true),
            bonus: format(
              G.platonicBonusMultiplier[i].sub(1).mul(100),
              accuracy[i]! + augmentAccuracy,
              true
            )
          }
        )
      }
      DOMCacheGetOrSet('platonicBlessingsTotal').innerHTML = i18next.t(
        'wowCubes.platonics.total',
        {
          amount: format(sumContentsDecimal(platonicArray), 0, true)
        }
      )
      break
    }
    case 4:
      DOMCacheGetOrSet('cubeAmount2').textContent = `You have ${
        format(
          player.wowCubes.value,
          0,
          true
        )
      } Wow! Cubes =)`
      break
    case 5:
      break
    case 6:
      DOMCacheGetOrSet('hepteractQuantity').innerHTML = i18next.t(
        'wowCubes.hepteractForge.youPossessHepteracts',
        {
          x: format(player.wowAbyssals, 0, true)
        }
      )

      // Update the grid
      hepteractTypeList.forEach((type) => {
        UpdateHeptGridValues(type)
      })

      // orbs
      DOMCacheGetOrSet('heptGridOrbBalance').textContent = format(
        player.overfluxOrbs
      )
      DOMCacheGetOrSet('heptGridOrbEffect').textContent = `${
        format(
          calculateCubeQuarkMultiplier().sub(1).mul(100),
          2,
          true
        )
      }%`

      // powder
      DOMCacheGetOrSet('heptGridPowderBalance').textContent = format(
        player.overfluxPowder
      )
      DOMCacheGetOrSet('heptGridPowderWarps').textContent = format(
        player.dailyPowderResetUses
      )
      break
    default:
      break
  }
}

const UpdateHeptGridValues = (type: hepteractTypes) => {
  const text = `${type}ProgressBarText`
  const bar = `${type}ProgressBar`
  const textEl = DOMCacheGetOrSet(text)
  const barEl = DOMCacheGetOrSet(bar)
  const unlocked = player.hepteractCrafts[type].UNLOCKED

  if (!unlocked) {
    textEl.textContent = 'LOCKED'
    barEl.style.width = '100%'
    barEl.style.backgroundColor = 'var(--hepteract-bar-red)'
  } else {
    const balance = player.hepteractCrafts[type].BAL
    const cap = player.hepteractCrafts[type].computeActualCap()
    const barWidth = Decimal.div(balance, cap).mul(100).round().toNumber()

    let barColor = ''
    if (barWidth < 34) {
      barColor = 'var(--hepteract-bar-red)'
    } else if (barWidth >= 34 && barWidth < 68) {
      barColor = 'var(--hepteract-bar-yellow)'
    } else {
      barColor = 'var(--hepteract-bar-green)'
    }

    textEl.textContent = `${format(balance)} / ${format(cap)}`
    barEl.style.width = `${barWidth}%`
    barEl.style.backgroundColor = barColor
  }
}

export const visualUpdateCorruptions = () => {
  if (G.currentTab !== Tabs.Corruption) {
    return
  }

  const metaData = CalcCorruptionStuff()
  const ascCount = calcAscensionCount()
  DOMCacheGetOrSet('autoAscend').innerHTML = player.autoAscendMode === 'c10Completions'
    ? i18next.t('corruptions.autoAscend.c10Completions', {
      input: format(player.autoAscendThreshold),
      completions: format(player.challengecompletions[10])
    })
    : i18next.t('corruptions.autoAscend.realTime', {
      input: format(player.autoAscendThreshold),
      time: format(player.ascensionCounterRealReal)
    })
  /*DOMCacheGetOrSet('autoAscendText').textContent = player.autoAscendMode === 'c10Completions' ? ' you\'ve completed Sadistic Challenge I a total of ' : ' the timer is at least ';
    DOMCacheGetOrSet('autoAscendMetric').textContent = format(player.autoAscendThreshold);
    DOMCacheGetOrSet('autoAscendText2').textContent = player.autoAscendMode === 'c10Completions' ? ' times, Currently ' : ' seconds (Real-time), Currently ';
    DOMCacheGetOrSet('autoAscendMetric2').textContent = player.autoAscendMode === 'c10Completions' ? String(player.challengecompletions[10]) : format(player.ascensionCounterRealReal);*/
  DOMCacheGetOrSet('corruptionBank').innerHTML = i18next.t(
    'corruptions.corruptionBank',
    {
      number: format(metaData[0], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionScore').innerHTML = i18next.t(
    'corruptions.corruptionScore',
    {
      ascScore: format(metaData[1], 1, true),
      corrMult: format(metaData[2], 1, true),
      bonusMult: format(metaData[9], 2, true),
      totalScore: format(metaData[3], 1, true)
    }
  )
  DOMCacheGetOrSet('corruptionCubes').innerHTML = i18next.t(
    'corruptions.corruptionCubes',
    {
      cubeAmount: format(metaData[4], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionTesseracts').innerHTML = i18next.t(
    'corruptions.corruptionTesseracts',
    {
      tesseractAmount: format(metaData[5], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionHypercubes').innerHTML = i18next.t(
    'corruptions.corruptionHypercubes',
    {
      hypercubeAmount: format(metaData[6], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionPlatonicCubes').innerHTML = i18next.t(
    'corruptions.corruptionPlatonics',
    {
      platonicAmount: format(metaData[7], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionHepteracts').innerHTML = i18next.t(
    'corruptions.corruptionHepteracts',
    {
      hepteractAmount: format(metaData[8], 0, true)
    }
  )
  DOMCacheGetOrSet('corruptionAntExponent').innerHTML = i18next.t(
    'corruptions.antExponent',
    {
      exponent: format(
        (1 - (0.9 / 90) * sumContentsNumber(player.usedCorruptions))
          * G.extinctionMultiplier[player.usedCorruptions[7]],
        3
      )
    }
  )
  DOMCacheGetOrSet('corruptionSpiritBonus').innerHTML = i18next.t(
    'corruptions.spiritBonus',
    {
      multiplier: format(calculateCorruptionPoints().div(400), 2, true)
    }
  )
  DOMCacheGetOrSet('corruptionAscensionCount').style.display = ascCount.gt(1) ? 'block' : 'none'

  if (ascCount.gt(1)) {
    DOMCacheGetOrSet('corruptionAscensionCount').innerHTML = i18next.t(
      'corruptions.ascensionCount',
      {
        ascCount: format(calcAscensionCount())
      }
    )
  }
}

export const visualUpdateSettings = () => {
  if (G.currentTab !== Tabs.Settings) {
    return
  }

  if (player.subtabNumber === 0) {
    DOMCacheGetOrSet('saveString').textContent = i18next.t(
      'settings.currently',
      {
        x: player.saveString.replace('$VERSION$', `v${version}`)
      }
    )

    const quarkData = quarkHandler()
    const onExportQuarks = quarkData.gain
    const maxExportQuarks = quarkData.capacity

    let goldenQuarkMultiplier = new Decimal(1)
    goldenQuarkMultiplier = Decimal.mul(goldenQuarkMultiplier, getQuarkBonus().div(100).add(1))
    goldenQuarkMultiplier = Decimal.mul(
      goldenQuarkMultiplier,
      player.highestSingularityCount >= 100
        ? 1 + player.highestSingularityCount / 50
        : 1
    )

    DOMCacheGetOrSet('quarktimerdisplay').textContent = i18next.t(
      'settings.exportQuark',
      {
        x: format(
          Decimal.div(3600, quarkData.perHour).sub(player.quarkstimer.mod(3600.00001 / quarkData.perHour)),
          2
        ),
        y: player.worlds.toString(1)
      }
    )
    DOMCacheGetOrSet('quarktimeramount').textContent = i18next.t(
      'settings.quarksOnExport',
      {
        x: player.worlds.toString(onExportQuarks),
        y: player.worlds.toString(maxExportQuarks)
      }
    )

    DOMCacheGetOrSet('goldenQuarkTimerDisplay').textContent = i18next.t(
      'settings.exportGoldenQuark',
      {
        x: format(
          Decimal.div(
            3600,
            Decimal.max(
              1,
              player.singularityUpgrades.goldenQuarks3.getEffect().bonus
            )
          ).sub(
            Decimal.mod(
              player.goldenQuarksTimer,
              3600.00001 / Math.max(1, player.singularityUpgrades.goldenQuarks3.getEffect().bonus)
            )
          )
        ),
        y: format(goldenQuarkMultiplier, 2, true)
      }
    )
    DOMCacheGetOrSet('goldenQuarkTimerAmount').textContent = i18next.t(
      'settings.goldenQuarksOnExport',
      {
        x: format(
          Decimal.mul(player.goldenQuarksTimer, player.singularityUpgrades.goldenQuarks3.getEffect().bonus).div(3600)
            .floor().mul(goldenQuarkMultiplier),
          2
        ),
        y: format(
          Decimal.mul(goldenQuarkMultiplier, player.singularityUpgrades.goldenQuarks3.getEffect().bonus).mul(168)
            .floor()
        )
      }
    )
  }
  if (player.subtabNumber === 3) {
    loadStatisticsUpdate()
  }
}

export const visualUpdateSingularity = () => {
  if (G.currentTab !== Tabs.Singularity) {
    return
  }
  if (player.subtabNumber === 0) {
    DOMCacheGetOrSet('goldenQuarkamount').textContent = i18next.t(
      'singularity.goldenQuarkAmount',
      {
        goldenQuarks: format(player.goldenQuarks, 0, true)
      }
    )

    const keys = Object.keys(
      player.singularityUpgrades
    ) as (keyof Player['singularityUpgrades'])[]
    const val = G.shopEnhanceVision

    for (const key of keys) {
      if (key === 'offeringAutomatic' || key === 'WIP') {
        continue
      }
      const singItem = player.singularityUpgrades[key]
      const el = DOMCacheGetOrSet(`${String(key)}`)
      if (
        singItem.maxLevel !== -1
        && singItem.level >= singItem.computeMaxLevel()
      ) {
        el.style.filter = val ? 'brightness(.9)' : 'none'
      } else if (
        Decimal.gt(singItem.getCostTNL(), player.goldenQuarks)
        || player.singularityCount < singItem.minimumSingularity
      ) {
        el.style.filter = val ? 'grayscale(.9) brightness(.8)' : 'none'
      } else if (
        singItem.maxLevel === -1
        || singItem.level < singItem.computeMaxLevel()
      ) {
        if (singItem.freeLevels > singItem.level) {
          el.style.filter = val ? 'blur(1px) invert(.9) saturate(200)' : 'none'
        } else {
          el.style.filter = val ? 'invert(.9) brightness(1.1)' : 'none'
        }
      }
    }
  }
  if (player.subtabNumber === 2) {
    const keys = Object.keys(
      player.octeractUpgrades
    ) as (keyof Player['octeractUpgrades'])[]
    const val = G.shopEnhanceVision

    for (const key of keys) {
      const octItem = player.octeractUpgrades[key]
      const el = DOMCacheGetOrSet(`${String(key)}`)
      if (octItem.maxLevel !== -1 && octItem.level >= octItem.maxLevel) {
        el.style.filter = val ? 'brightness(.9)' : 'none'
      } else if (Decimal.gt(octItem.getCostTNL(), player.wowOcteracts)) {
        el.style.filter = val ? 'grayscale(.9) brightness(.8)' : 'none'
      } else if (octItem.maxLevel === -1 || octItem.level < octItem.maxLevel) {
        if (octItem.freeLevels > octItem.level) {
          el.style.filter = val ? 'blur(2px) invert(.9) saturate(200)' : 'none'
        } else {
          el.style.filter = val ? 'invert(.9) brightness(1.1)' : 'none'
        }
      }
    }
  }
}

export const shopMouseover = (value: boolean) => {
  G.shopEnhanceVision = value
}

export const visualUpdateOcteracts = () => {
  if (G.currentTab !== Tabs.Singularity) {
    return
  }
  DOMCacheGetOrSet('octeractAmount').innerHTML = i18next.t('octeract.amount', {
    octeracts: format(player.wowOcteracts, 2, true)
  })

  const perSecond = octeractGainPerSecond()

  DOMCacheGetOrSet('secondsPerOcteract').style.display = perSecond.lt(1) ? 'block' : 'none'
  DOMCacheGetOrSet('secondsPerOcteract').innerHTML = i18next.t(
    'octeract.secondsPerOcteract',
    {
      seconds: format(perSecond.recip(), 2, true)
    }
  )
  DOMCacheGetOrSet('octeractPerSeconds').style.display = perSecond.gte(1) ? 'block' : 'none'
  DOMCacheGetOrSet('octeractPerSeconds').innerHTML = i18next.t(
    'octeract.octeractsPerSecond',
    {
      octeracts: format(perSecond, 2, true)
    }
  )

  const cTOCB = Decimal.sub(calculateTotalOcteractCubeBonus(), 1).mul(100)
  const cTOQB = Decimal.sub(calculateTotalOcteractQuarkBonus(), 1).mul(100)
  const cTOOB = Decimal.sub(calculateTotalOcteractOfferingBonus(), 1).mul(100)
  const cTOOOB = Decimal.sub(calculateTotalOcteractObtainiumBonus(), 1).mul(100)
  DOMCacheGetOrSet('totalOcteractAmount').innerHTML = i18next.t(
    'octeract.totalGenerated',
    {
      octeracts: format(player.totalWowOcteracts, 2, true)
    }
  )
  DOMCacheGetOrSet('totalOcteractCubeBonus').style.display = cTOCB.gte(0.001) ? 'block' : 'none'
  DOMCacheGetOrSet('totalOcteractQuarkBonus').style.display = cTOQB.gte(0.001) ? 'block' : 'none'
  DOMCacheGetOrSet('totalOcteractOfferingBonus').style.display = cTOOB.gte(0.001) ? 'block' : 'none'
  DOMCacheGetOrSet('totalOcteractObtainiumBonus').style.display = cTOOOB.gte(0.001) ? 'block' : 'none'
  DOMCacheGetOrSet('totalOcteractCubeBonus').innerHTML = i18next.t(
    'octeract.generatedCubeBonus',
    {
      cubeBonus: format(cTOCB, 3, true)
    }
  )
  DOMCacheGetOrSet('totalOcteractQuarkBonus').innerHTML = i18next.t(
    'octeract.generatedQuarkBonus',
    {
      quarkBonus: format(cTOQB, 3, true)
    }
  )
  DOMCacheGetOrSet('totalOcteractOfferingBonus').innerHTML = i18next.t(
    'octeract.generatedOfferingBonus',
    {
      offeringBonus: format(cTOOB, 3, true)
    }
  )
  DOMCacheGetOrSet('totalOcteractObtainiumBonus').innerHTML = i18next.t(
    'octeract.generatedObtainiumBonus',
    {
      obtainiumBonus: format(cTOOOB, 3, true)
    }
  )
}

export const visualUpdateAmbrosia = () => {
  if (G.currentTab !== Tabs.Singularity) {
    return
  }

  const luck = G.ambrosiaCurrStats.ambrosiaLuck
  const baseLuck = Decimal.div(G.ambrosiaCurrStats.ambrosiaLuck, G.ambrosiaCurrStats.ambrosiaAdditiveLuckMult)
  const luckBonusPercent = Decimal.sub(G.ambrosiaCurrStats.ambrosiaAdditiveLuckMult, 1).mul(100)
  const guaranteed = Decimal.floor(Decimal.div(luck, 100))
  const chance = Decimal.sub(luck, Decimal.div(luck, 100).floor().mul(100))
  const requiredTime = calculateRequiredBlueberryTime()
  const cubePercent = calculateAmbrosiaCubeMult().sub(1).mul(100)
  const quarkPercent = calculateAmbrosiaQuarkMult().sub(1).mul(100)
  const availableBlueberries = Decimal.sub(G.ambrosiaCurrStats.ambrosiaBlueberries, player.spentBlueberries)
  const totalTimePerSecond = G.ambrosiaCurrStats.ambrosiaGenerationSpeed
  let progressTimePerSecond = totalTimePerSecond
  if (Decimal.gte(progressTimePerSecond, 1000)) {
    progressTimePerSecond = Decimal.div(progressTimePerSecond, 1000).pow(0.5).mul(1000)
  }
  const barWidth = Decimal.div(player.blueberryTime, requiredTime).min(1).mul(100).toNumber()
  const pixelBarWidth = Decimal.div(player.ultimateProgress, 1e6).min(1).mul(100).toNumber()

  DOMCacheGetOrSet('ambrosiaProgress').style.width = `${barWidth}%`
  DOMCacheGetOrSet('ambrosiaProgressText').textContent = `${format(player.blueberryTime, 0, true)} / ${
    format(requiredTime, 0, true)
  } [+${format(totalTimePerSecond, 0, true)}/s]`

  DOMCacheGetOrSet('pixelProgress').style.width = `${pixelBarWidth}%`
  DOMCacheGetOrSet('pixelProgressText').textContent = `${format(player.ultimateProgress, 0, true)} / ${
    format(1000000, 0, true)
  } [+${format(Decimal.mul(progressTimePerSecond, 0.02), 2, true)}/s]`
  const extraLuckHTML = Decimal.gt(luckBonusPercent, 0.01)
    ? `[<span style='color: var(--amber-text-color)'>☘${
      format(
        baseLuck,
        0,
        true
      )
    } +${format(luckBonusPercent, 2, true)}%</span>]`
    : ''

  DOMCacheGetOrSet('ambrosiaAmount').innerHTML = i18next.t('ambrosia.amount', {
    ambrosia: format(player.ambrosia, 0, true),
    lifetimeAmbrosia: format(player.lifetimeAmbrosia, 0, true)
  })
  /*DOMCacheGetOrSet('ambrosiaChance').innerHTML = i18next.t(
    'ambrosia.blueberryGeneration',
    {
      chance: format(totalTimePerSecond, 2, true)
    }
  )*/
  DOMCacheGetOrSet('ambrosiaAmountPerGeneration').innerHTML = i18next.t(
    'ambrosia.perGen',
    {
      guaranteed: format(guaranteed, 0, true),
      extraChance: format(chance, 0, true),
      ambrosiaLuck: format(luck, 0, true),
      extra: extraLuckHTML
    }
  )
  /* DOMCacheGetOrSet('ambrosiaRNG').innerHTML = i18next.t(
    'ambrosia.blueberrySecond',
    {
      blueberrySecond: format(player.blueberryTime, 0, true),
      thresholdTimer: format(requiredTime, 0, true)
    }
  )*/
  DOMCacheGetOrSet('ambrosiaRewards').innerHTML = i18next.t(
    'ambrosia.bonuses',
    {
      cube: format(cubePercent, 0, true),
      quark: format(quarkPercent, 0, true)
    }
  )
  DOMCacheGetOrSet('ambrosiaBlueberries').innerHTML = i18next.t(
    'ambrosia.availableBlueberries',
    {
      availableBlueberries
    }
  )
}

export const visualUpdateShop = () => {
  if (G.currentTab !== Tabs.Shop) {
    return
  }
  DOMCacheGetOrSet('quarkamount').textContent = i18next.t(
    'shop.youHaveQuarks',
    { x: format(player.worlds.QUARKS, 0, true) }
  )
  DOMCacheGetOrSet('offeringpotionowned').textContent = format(
    player.shopUpgrades.offeringPotion,
    0,
    true
  )
  DOMCacheGetOrSet('obtainiumpotionowned').textContent = format(
    player.shopUpgrades.obtainiumPotion,
    0,
    true
  )

  // Create Keys with the correct type
  const keys = Object.keys(
    player.shopUpgrades
  ) as (keyof Player['shopUpgrades'])[]
  for (const key of keys) {
    // Create a copy of shopItem instead of accessing many times
    const shopItem = shopData[key]

    if (shopItem.type === shopUpgradeTypes.CONSUMABLE) {
      const maxBuyablePotions = Decimal.min(
        Decimal.floor(player.worlds.QUARKS.div(getShopCosts(key))),
        shopItem.maxLevel - player.shopUpgrades[key]
      )
      const el = DOMCacheGetOrSet(`buy${key.toLowerCase()}`)
      switch (player.shopBuyMaxToggle) {
        case false:
          el.textContent = 'BUY: 100 Quarks Each'
          break
        case 'TEN':
          el.textContent = `+${Decimal.min(10, maxBuyablePotions)} for ${
            format(
              Decimal.min(10, maxBuyablePotions).mul(getShopCosts(key)),
              0,
              true
            )
          } Quarks`
          break
        default:
          el.textContent = `+${maxBuyablePotions} for ${
            format(
              Decimal.mul(getShopCosts(key), maxBuyablePotions)
            )
          } Quarks`
      }
    }

    if (shopItem.type === shopUpgradeTypes.UPGRADE) {
      if (
        player.shopHideToggle
        && player.shopUpgrades[key] >= shopItem.maxLevel
        && !shopItem.refundable
      ) {
        DOMCacheGetOrSet(`${key}Hide`).style.display = 'none'
        continue
      } else {
        DOMCacheGetOrSet(`${key}Hide`).style.display = isShopUpgradeUnlocked(
            key
          )
          ? 'block'
          : 'none'
      }
      // Case: If max level is 1, then it can be considered a boolean "bought" or "not bought" item
      if (shopItem.maxLevel === 1) {
        // TODO(@KhafraDev): i18n
        DOMCacheGetOrSet(`${key}Level`).textContent = player.shopUpgrades[key] >= shopItem.maxLevel
          ? 'Bought!'
          : 'Not Bought!'
      } else {
        // Case: max level greater than 1, treat it as a fraction out of max level
        // TODO(@KhafraDev): i18n
        DOMCacheGetOrSet(`${key}Level`).textContent = `${
          player.highestSingularityCount > 0 || player.ascensionCount.gt(0)
            ? ''
            : 'Level '
        }${format(player.shopUpgrades[key])}/${format(shopItem.maxLevel)}`
      }
      // Handles Button - max level needs no price indicator, otherwise it's necessary

      const buyMaxAmount = shopItem.maxLevel - player.shopUpgrades[key]
      let buyData: IMultiBuy

      switch (player.shopBuyMaxToggle) {
        case false:
          DOMCacheGetOrSet(`${key}Button`).textContent = player.shopUpgrades[key] >= shopItem.maxLevel
            ? i18next.t('shop.maxed')
            : i18next.t('shop.upgradeFor', { x: format(getShopCosts(key)) })
          break
        case 'TEN':
          buyData = calculateSummationNonLinearDecimal(
            player.shopUpgrades[key],
            shopItem.price,
            player.worlds.QUARKS,
            shopItem.priceIncrease / shopItem.price,
            Math.min(10, buyMaxAmount)
          )
          DOMCacheGetOrSet(`${key}Button`).textContent = player.shopUpgrades[key] >= shopItem.maxLevel
            ? i18next.t('shop.maxed')
            : i18next.t('shop.plusForQuarks', {
              x: format(
                Decimal.sub(buyData.levelCanBuy, player.shopUpgrades[key]),
                0,
                true
              ),
              y: format(buyData.cost)
            })
          break
        default:
          buyData = calculateSummationNonLinearDecimal(
            player.shopUpgrades[key],
            shopItem.price,
            player.worlds.QUARKS,
            shopItem.priceIncrease / shopItem.price,
            buyMaxAmount
          )
          DOMCacheGetOrSet(`${key}Button`).textContent = player.shopUpgrades[key] >= shopItem.maxLevel
            ? i18next.t('shop.maxed')
            : i18next.t('shop.plusForQuarks', {
              x: format(
                Decimal.sub(buyData.levelCanBuy, player.shopUpgrades[key]),
                0,
                true
              ),
              y: format(buyData.cost)
            })
      }
    }
  }

  DOMCacheGetOrSet('buySingularityQuarksAmount').textContent = `${player.goldenQuarks.lt(1000) ? 'Owned: ' : ''}${
    format(player.goldenQuarks)
  }`
  DOMCacheGetOrSet('buySingularityQuarksButton').textContent = `Buy! ${
    format(
      getGoldenQuarkCost().cost
    )
  } Quarks Each`
}

export const visualUpdateEvent = () => {}
