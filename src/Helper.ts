import Decimal from 'break_eternity.js'
import { sacrificeAnts } from './Ants'
import { buyAllBlessings } from './Buy'
import {
  calculateAscensionAcceleration,
  calculateAutomaticObtainium,
  calculateGoldenQuarkGain,
  calculateMaxRunes,
  calculateObtainium,
  calculateRequiredBlueberryTime,
  calculateTimeAcceleration,
  octeractGainPerSecond
} from './Calculate'
import { quarkHandler } from './Quark'
import { checkMaxRunes, redeemShards, unlockedRune } from './Runes'
import { useConsumable } from './Shop'
import { player } from './Synergism'
import { Tabs } from './Tabs'
import { buyAllTalismanResources } from './Talismans'
import { visualUpdateAmbrosia, visualUpdateOcteracts, visualUpdateResearch } from './UpdateVisuals'
import { Globals as G } from './Variables'

type TimerInput =
  | 'prestige'
  | 'transcension'
  | 'reincarnation'
  | 'ascension'
  | 'quarks'
  | 'goldenQuarks'
  | 'singularity'
  | 'octeracts'
  | 'autoPotion'
  | 'ambrosia'

/**
 * addTimers will add (in milliseconds) time to the reset counters, and quark export timer
 * @param input
 * @param time
 */
export const addTimers = (input: TimerInput, time: Decimal | number) => {
  const timeMultiplier = input === 'ascension'
      || input === 'quarks'
      || input === 'goldenQuarks'
      || input === 'singularity'
      || input === 'octeracts'
      || input === 'autoPotion'
      || input === 'ambrosia'
    ? 1
    : calculateTimeAcceleration().mult

  switch (input) {
    case 'prestige': {
      player.prestigecounter = player.prestigecounter.add(Decimal.mul(time, timeMultiplier))
      break
    }
    case 'transcension': {
      player.transcendcounter = player.transcendcounter.add(Decimal.mul(time, timeMultiplier))
      break
    }
    case 'reincarnation': {
      player.reincarnationcounter = player.reincarnationcounter.add(Decimal.mul(time, timeMultiplier))
      break
    }
    case 'ascension': {
      // Anything in here is affected by add code
      const ascensionSpeedMulti = player.singularityUpgrades.oneMind.getEffect()
          .bonus
        ? 10
        : calculateAscensionAcceleration()
      player.ascensionCounter = player.ascensionCounter.add(Decimal.mul(time, timeMultiplier).mul(ascensionSpeedMulti))
      player.ascensionCounterReal = player.ascensionCounterReal.add(Decimal.mul(time, timeMultiplier))
      break
    }
    case 'singularity': {
      player.ascensionCounterRealReal = player.ascensionCounterRealReal.add(time)
      player.singularityCounter = player.singularityCounter.add(Decimal.mul(time, timeMultiplier))
      break
    }
    case 'quarks': {
      // First get maximum Quark Clock (25h, up to +25 from Research 8x20)
      const maxQuarkTimer = quarkHandler().maxTime
      player.quarkstimer = player.quarkstimer.add(Decimal.mul(time, timeMultiplier))
      // Checks if this new time is greater than maximum, in which it will default to that time.
      // Otherwise returns itself.
      player.quarkstimer = Decimal.gt(player.quarkstimer, maxQuarkTimer)
        ? new Decimal(maxQuarkTimer)
        : player.quarkstimer
      break
    }
    case 'goldenQuarks': {
      if (+player.singularityUpgrades.goldenQuarks3.getEffect().bonus === 0) {
        return
      } else {
        player.goldenQuarksTimer = player.goldenQuarksTimer.add(Decimal.mul(time, timeMultiplier))
        player.goldenQuarksTimer = player.goldenQuarksTimer.gt(3600 * 168)
          ? new Decimal(3600 * 168)
          : player.goldenQuarksTimer
      }
      break
    }
    case 'octeracts': {
      if (!player.singularityUpgrades.octeractUnlock.getEffect().bonus) {
        return
      } else {
        player.octeractTimer = player.octeractTimer.add(Decimal.mul(time, timeMultiplier))
      }
      if (player.octeractTimer.gte(1)) {
        const amountOfGiveaways = Decimal.sub(player.octeractTimer, player.octeractTimer.mod(1))
        player.octeractTimer = player.octeractTimer.mod(1)

        const perSecond = octeractGainPerSecond()
        player.wowOcteracts = player.wowOcteracts.add(Decimal.mul(amountOfGiveaways, perSecond))
        player.totalWowOcteracts = player.totalWowOcteracts.add(Decimal.mul(amountOfGiveaways, perSecond))

        if (player.highestSingularityCount >= 160) {
          const levels = [160, 173, 185, 194, 204, 210, 219, 229, 240, 249]
          const frac = 1e-6
          let actualLevel = 0
          for (const sing of levels) {
            if (player.highestSingularityCount >= sing) {
              actualLevel += 1
            }
          }

          for (let i = 0; i < amountOfGiveaways.toNumber(); i++) {
            const quarkFraction = Decimal.mul(player.quarksThisSingularity, frac).mul(actualLevel)
            player.goldenQuarks = player.goldenQuarks.add(Decimal.mul(quarkFraction, calculateGoldenQuarkGain(true)))
            player.quarksThisSingularity = Decimal.sub(player.quarksThisSingularity, quarkFraction)
          }
        }
        visualUpdateOcteracts()
      }
      break
    }
    case 'autoPotion': {
      if (player.highestSingularityCount < 6) {
        return
      } else {
        // player.toggles[42] enables FAST Offering Potion Expenditure, but actually spends the potion.
        // Hence, you need at least one potion to be able to use fast spend.
        const toggleOfferingOn = player.toggles[42] && player.shopUpgrades.offeringPotion > 0
        // player.toggles[43] enables FAST Obtainium Potion Expenditure, but actually spends the potion.
        const toggleObtainiumOn = player.toggles[43] && player.shopUpgrades.obtainiumPotion > 0

        player.autoPotionTimer = player.autoPotionTimer.add(Decimal.mul(time, timeMultiplier))
        player.autoPotionTimerObtainium = player.autoPotionTimerObtainium.add(Decimal.mul(time, timeMultiplier))

        const timerThreshold = (180 * Math.pow(1.03, -player.highestSingularityCount))
          / +player.octeractUpgrades.octeractAutoPotionSpeed.getEffect().bonus

        const effectiveOfferingThreshold = toggleOfferingOn
          ? Math.min(1, timerThreshold) / 20
          : timerThreshold
        const effectiveObtainiumThreshold = toggleObtainiumOn
          ? Math.min(1, timerThreshold) / 20
          : timerThreshold

        if (Decimal.gte(player.autoPotionTimer, effectiveOfferingThreshold)) {
          const amountOfPotions = (player.autoPotionTimer
            .sub(Decimal.mod(player.autoPotionTimer, effectiveOfferingThreshold)))
            .div(effectiveOfferingThreshold)
          player.autoPotionTimer = player.autoPotionTimer.mod(effectiveOfferingThreshold)
          void useConsumable(
            'offeringPotion',
            true,
            amountOfPotions.toNumber(),
            toggleOfferingOn
          )
        }

        if (Decimal.gte(player.autoPotionTimerObtainium, effectiveObtainiumThreshold)) {
          const amountOfPotions = (player.autoPotionTimerObtainium
            .sub(Decimal.mod(player.autoPotionTimerObtainium, effectiveObtainiumThreshold)))
            .div(effectiveObtainiumThreshold)
          player.autoPotionTimerObtainium = player.autoPotionTimerObtainium.mod(effectiveObtainiumThreshold)
          void useConsumable(
            'obtainiumPotion',
            true,
            amountOfPotions.toNumber(),
            toggleObtainiumOn
          )
        }
      }
      break
    }
    case 'ambrosia': {
      const compute = G.ambrosiaCurrStats.ambrosiaGenerationSpeed
      if (compute === 0) {
        break
      }

      G.ambrosiaTimer = G.ambrosiaTimer.add(Decimal.mul(time, timeMultiplier))

      if (G.ambrosiaTimer.lt(0.125)) {
        break
      }

      const ambrosiaLuck = G.ambrosiaCurrStats.ambrosiaLuck
      const baseBlueberryTime = G.ambrosiaCurrStats.ambrosiaGenerationSpeed
      player.blueberryTime = player.blueberryTime.add(G.ambrosiaTimer.mul(8).floor().div(8).mul(baseBlueberryTime))
      let stupidShit = baseBlueberryTime
      if (Decimal.gte(stupidShit, 1000)) {
        stupidShit = Decimal.div(stupidShit, 1000).pow(0.5).mul(1000)
      }
      player.ultimateProgress = player.ultimateProgress.add(
        G.ambrosiaTimer.mul(8).floor().div(8).mul(Decimal.mul(stupidShit, 0.02))
      )
      G.ambrosiaTimer = G.ambrosiaTimer.mod(0.125)

      let timeToAmbrosia = calculateRequiredBlueberryTime()

      const maxAccelMultiplier = (1 / 2)
        + (3 / 5 - 1 / 2) * +(player.singularityChallenges.noAmbrosiaUpgrades.completions >= 15)
        + (2 / 3 - 3 / 5) * +(player.singularityChallenges.noAmbrosiaUpgrades.completions >= 19)
        + (3 / 4 - 2 / 3) * +(player.singularityChallenges.noAmbrosiaUpgrades.completions >= 20)

      while (Decimal.gte(player.blueberryTime, timeToAmbrosia)) {
        const RNG = Math.random()
        const ambrosiaMult = Decimal.floor(Decimal.div(ambrosiaLuck, 100))
        const luckMult =
          Decimal.lt(RNG, Decimal.div(ambrosiaLuck, 100).sub(Decimal.floor(Decimal.div(ambrosiaLuck, 100)))) ? 1 : 0
        const bonusAmbrosia = (player.singularityChallenges.noAmbrosiaUpgrades.rewards.bonusAmbrosia) ? 1 : 0
        const ambrosiaToGain = Decimal.add(ambrosiaMult, luckMult).add(bonusAmbrosia)

        player.ambrosia = Decimal.add(player.ambrosia, ambrosiaToGain)
        player.lifetimeAmbrosia = Decimal.add(player.lifetimeAmbrosia, ambrosiaToGain)
        player.blueberryTime = player.blueberryTime.sub(timeToAmbrosia)

        timeToAmbrosia = calculateRequiredBlueberryTime()
        const secondsToNextAmbrosia = Decimal.div(timeToAmbrosia, G.ambrosiaCurrStats.ambrosiaGenerationSpeed)

        G.ambrosiaTimer = G.ambrosiaTimer.add(
          Decimal.mul(ambrosiaToGain, player.shopUpgrades.shopAmbrosiaAccelerator).mul(0.2)
            .min(Decimal.mul(secondsToNextAmbrosia, maxAccelMultiplier))
        )
        timeToAmbrosia = calculateRequiredBlueberryTime()
      }

      if (player.ultimateProgress.gt(1e6)) {
        player.ultimatePixels = player.ultimatePixels.add(Decimal.floor(player.ultimateProgress.div(1e6)))
        player.ultimateProgress = player.ultimateProgress.mod(1e6)
      }

      visualUpdateAmbrosia()
    }
  }
}

type AutoToolInput =
  | 'addObtainium'
  | 'addOfferings'
  | 'runeSacrifice'
  | 'antSacrifice'

/**
 * Assortment of tools which are used when actions are automated.
 * @param input
 * @param time
 */
export const automaticTools = (input: AutoToolInput, time: Decimal) => {
  const timeMultiplier = input === 'runeSacrifice' || input === 'addOfferings'
    ? 1
    : calculateTimeAcceleration().mult

  switch (input) {
    case 'addObtainium': {
      // If in challenge 14, abort and do not award obtainium
      if (player.currentChallenge.ascension === 14) {
        break
      }
      // Update Obtainium Multipliers + Amount to gain
      calculateObtainium()
      const obtainiumGain = calculateAutomaticObtainium()
      // Add Obtainium
      player.researchPoints = player.researchPoints.add(Decimal.mul(obtainiumGain, timeMultiplier).mul(time))
      // Update visual displays if appropriate
      if (G.currentTab === Tabs.Research) {
        visualUpdateResearch()
      }
      break
    }
    case 'addOfferings':
      // This counter can be increased through challenge 3 reward
      // As well as cube upgrade 1x2 (2).
      G.autoOfferingCounter = G.autoOfferingCounter.add(time)
      // Any time this exceeds 1 it adds an offering
      player.runeshards = Decimal.add(player.runeshards, Decimal.floor(G.autoOfferingCounter))
      G.autoOfferingCounter = G.autoOfferingCounter.mod(1)
      break
    case 'runeSacrifice':
      // Every real life second this will trigger
      player.sacrificeTimer = player.sacrificeTimer.add(time)
      if (
        player.sacrificeTimer.gte(1)
        && Decimal.isFinite(player.runeshards)
        && player.runeshards.gt(0)
      ) {
        // Automatic purchase of Blessings
        if (player.highestSingularityCount >= 15) {
          let ratio = 4
          if (player.toggles[36]) {
            buyAllBlessings('Blessings', 100 / ratio, true)
            ratio--
          }
          if (player.toggles[37]) {
            buyAllBlessings('Spirits', 100 / ratio, true)
            ratio--
          }
        }
        if (
          player.autoBuyFragment
          && player.highestSingularityCount >= 40
          && player.cubeUpgrades[51].gt(0)
        ) {
          buyAllTalismanResources()
        }

        // If you bought cube upgrade 2x10 then it sacrifices to all runes equally
        if (Decimal.eq(player.cubeUpgrades[20], 1)) {
          const maxi = player.highestSingularityCount >= 50
            ? 7
            : player.highestSingularityCount >= 30
            ? 6
            : 5
          const notMaxed = maxi - checkMaxRunes(maxi)
          if (notMaxed > 0) {
            const baseAmount = Decimal.floor(player.runeshards.div(notMaxed).div(2))
            for (let i = 0; i < maxi; i++) {
              if (
                !(
                  !unlockedRune(i + 1)
                  || Decimal.gte(player.runelevels[i], calculateMaxRunes(i + 1))
                )
              ) {
                redeemShards(i + 1, true, baseAmount)
              }
            }
          }
        } else {
          // If you did not buy cube upgrade 2x10 it sacrifices to selected rune.
          const rune = player.autoSacrifice
          redeemShards(rune, true, new Decimal(0))
        }
        // Modulo used in event of a large delta time (this could happen for a number of reasons)
        player.sacrificeTimer = player.sacrificeTimer.mod(1)
      }
      break
    case 'antSacrifice': {
      // Increments real and 'fake' timers. the Real timer is on real life seconds.
      player.antSacrificeTimer = player.antSacrificeTimer.add(Decimal.mul(time, timeMultiplier))
      player.antSacrificeTimerReal = player.antSacrificeTimerReal.add(time)

      // Equal to real time iff "Real Time" option selected in ants tab.
      const antSacrificeTimer = player.autoAntSacrificeMode === 2
        ? player.antSacrificeTimerReal
        : player.antSacrificeTimer

      if (
        Decimal.gte(antSacrificeTimer, player.autoAntSacTimer)
        && player.antSacrificeTimerReal.gt(0.1)
        && player.researches[124] === 1
        && player.autoAntSacrifice
        && player.antPoints.gte(1e40)
      ) {
        void sacrificeAnts(true)
      }
      break
    }
  }
}
