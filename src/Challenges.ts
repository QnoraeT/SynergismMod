import Decimal from 'break_eternity.js'
import i18next from 'i18next'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateRuneLevels } from './Calculate'
import { hepteractEffective } from './Hepteracts'
import { autoResearchEnabled } from './Research'
import { format, formatPerc, player, resetCheck } from './Synergism'
import { toggleAutoChallengeModeText, toggleChallenges } from './Toggles'
import { productContentsDecimal } from './Utility'
import { Globals as G } from './Variables'

export const getMaxChallenges = (i: number) => {
  let maxChallenge = new Decimal(0)
  // Transcension Challenges
  if (i <= 5) {
    if (player.singularityChallenges.oneChallengeCap.enabled) {
      return new Decimal(1)
    }
    // Start with base 25 max completions
    maxChallenge = new Decimal(25)
    // Check Research 5x5 ('Infinite' T. Challenges)
    if (player.researches[105] > 0) {
      return new Decimal(9001)
    }
    // Max T. Challenge depends on researches 3x16 to 3x20
    maxChallenge = maxChallenge.add(Decimal.mul(5, player.researches[65 + i]))
    return maxChallenge
  }
  // Reincarnation Challenges
  if (i <= 10 && i > 5) {
    if (player.singularityChallenges.oneChallengeCap.enabled) {
      return new Decimal(1)
    }
    // Start with base of 40 max completions
    maxChallenge = new Decimal(40)
    // Cube Upgrade 2x9: +4/level
    maxChallenge = maxChallenge.add(Decimal.mul(player.cubeUpgrades[29], 4))
    // Shop Upgrade "Challenge Extension": +2/level
    maxChallenge = maxChallenge.add(Decimal.mul(2, player.shopUpgrades.challengeExtension))
    // Platonic Upgrade 5 (ALPHA): +10
    if (player.platonicUpgrades[5] > 0) {
      maxChallenge = maxChallenge.add(10)
    }
    // Platonic Upgrade 10 (BETA): +10
    if (player.platonicUpgrades[10] > 0) {
      maxChallenge = maxChallenge.add(10)
    }
    // Platonic Upgrade 15 (OMEGA): +30
    if (player.platonicUpgrades[15] > 0) {
      maxChallenge = maxChallenge.add(30)
    }

    maxChallenge = maxChallenge.add(Decimal.mul(2, player.singularityUpgrades.singChallengeExtension.getEffect().bonus))
    maxChallenge = maxChallenge.add(
      Decimal.mul(2, player.singularityUpgrades.singChallengeExtension2.getEffect().bonus)
    )
    maxChallenge = maxChallenge.add(
      Decimal.mul(2, player.singularityUpgrades.singChallengeExtension3.getEffect().bonus)
    )

    maxChallenge = maxChallenge.add(player.singularityChallenges.oneChallengeCap.rewards.capIncrease)
    return maxChallenge
  }
  // Ascension Challenge
  if (i <= 15 && i > 10) {
    // Challenge 15 has no formal cap, so return 9001.
    if (i === 15) {
      return 0
    }
    if (player.singularityChallenges.oneChallengeCap.enabled) {
      return 1
    }
    // Start with base of 30 max completions
    maxChallenge = new Decimal(30)
    // Platonic Upgrade 5 (ALPHA): +5
    if (player.platonicUpgrades[5] > 0) {
      maxChallenge = maxChallenge.add(5)
    }
    // Platonic Upgrade 10 (BETA): +5
    if (player.platonicUpgrades[10] > 0) {
      maxChallenge = maxChallenge.add(5)
    }
    // Platonic Upgrade 15 (OMEGA): +20
    if (player.platonicUpgrades[15] > 0) {
      maxChallenge = maxChallenge.add(20)
    }

    maxChallenge = maxChallenge.add(player.singularityUpgrades.singChallengeExtension.getEffect().bonus)
    maxChallenge = maxChallenge.add(player.singularityUpgrades.singChallengeExtension2.getEffect().bonus)
    maxChallenge = maxChallenge.add(player.singularityUpgrades.singChallengeExtension3.getEffect().bonus)
    return maxChallenge
  }

  return maxChallenge
}

export const challengeDisplay = (i: number, changefocus = true) => {
  let quarksMultiplier = 1

  if (changefocus) {
    G.challengefocus = i
    DOMCacheGetOrSet('oneChallengeDetails').style.display = 'flex'
    DOMCacheGetOrSet('startChallenge').style.display = 'block'
    DOMCacheGetOrSet('retryChallenge').style.display = 'block'
    G.triggerChallenge = i
  }

  const maxChallenges = getMaxChallenges(i)
  if (i <= 5 && changefocus) {
    if (Decimal.gte(player.challengecompletions[i], 100)) {
      DOMCacheGetOrSet('completionSoftcap').innerHTML = i18next.t('challenges.perCompletionBonus', {
        x: 100,
        y: format(CalcECC('transcend', player.challengecompletions[i]), 2, true)
      })
    } else {
      DOMCacheGetOrSet('completionSoftcap').textContent = i18next.t('challenges.perCompletionBonusEmpty')
    }
  }

  if (i > 5 && i <= 10) {
    quarksMultiplier = 10
    if (Decimal.gte(player.challengecompletions[i], 25) && changefocus) {
      DOMCacheGetOrSet('completionSoftcap').innerHTML = i18next.t('challenges.perCompletionBonus', {
        x: 25,
        y: format(CalcECC('reincarnation', player.challengecompletions[i]), 2, true)
      })
    } else {
      DOMCacheGetOrSet('completionSoftcap').textContent = i18next.t('challenges.perCompletionBonusEmpty')
    }
  }
  if (i > 10) {
    if (Decimal.gte(player.challengecompletions[i], 10)) {
      DOMCacheGetOrSet('completionSoftcap').innerHTML = i18next.t('challenges.perCompletionBonus', {
        x: 10,
        y: format(CalcECC('ascension', player.challengecompletions[i]), 2, true)
      })
    } else {
      DOMCacheGetOrSet('completionSoftcap').textContent = i18next.t('challenges.perCompletionBonusEmpty')
    }
  }
  let descriptor = ''
  const a = DOMCacheGetOrSet('challengeName')
  const b = DOMCacheGetOrSet('challengeFlavor')
  const c = DOMCacheGetOrSet('challengeRestrictions')
  const d = DOMCacheGetOrSet('challengeGoal')
  const e = DOMCacheGetOrSet('challengePer1').childNodes[0]
  const f = DOMCacheGetOrSet('challengePer2').childNodes[0]
  const g = DOMCacheGetOrSet('challengePer3').childNodes[0]
  const h = DOMCacheGetOrSet('challengeFirst1')
  const j = DOMCacheGetOrSet('challengeQuarkBonus')
  const k = DOMCacheGetOrSet('startChallenge')
  const l = DOMCacheGetOrSet('challengeCurrent1')
  const m = DOMCacheGetOrSet('challengeCurrent2')
  const n = DOMCacheGetOrSet('challengeCurrent3')

  if (i === G.challengefocus) {
    const completions = `${player.challengecompletions[i]}/${format(maxChallenges)}`
    const special = (i >= 6 && i <= 10) || i === 15
    const goal = format(challengeRequirement(i, player.challengecompletions[i], special ? i : 0))

    let current1 = ''
    let current2 = ''
    let current3 = ''

    switch (i) {
      case 1: {
        current1 = current2 = format(CalcECC('transcend', player.challengecompletions[1]).mul(10))
        current3 = format(CalcECC('transcend', player.challengecompletions[1]).mul(0.04), 2, true)
        break
      }
      case 2: {
        current1 = current2 = format(CalcECC('transcend', player.challengecompletions[2]).mul(5))
        current3 = format(CalcECC('transcend', player.challengecompletions[2]).mul(0.25), 2)
        break
      }
      case 3: {
        current1 = format(CalcECC('transcend', player.challengecompletions[3]).mul(0.04), 2, true)
        current2 = `${format(CalcECC('transcend', player.challengecompletions[3]).mul(0.5), 2, true)}%, (${
          format(G.challengeThreeMultiplier, 2, true)
        }x Grandmaster production total)`
        if (G.challengeThreeSoftcap.neq(1)) {
          current2 += ` Softcap hit! This reduces it's effect by ^${format(G.challengeThreeSoftcap, 4)}! `
        }
        current3 = format(CalcECC('transcend', player.challengecompletions[3]).mul(0.01), 2, true)
        break
      }
      case 4: {
        current1 = format(CalcECC('transcend', player.challengecompletions[4]).mul(5))
        current2 = format(CalcECC('transcend', player.challengecompletions[4]).mul(2))
        current3 = format(CalcECC('transcend', player.challengecompletions[4]).mul(0.5), 2, true)
        break
      }
      case 5: {
        current1 = format(CalcECC('transcend', player.challengecompletions[5]).div(100).add(0.5), 2, true)
        current2 = format(Decimal.pow(10, CalcECC('transcend', player.challengecompletions[5])))
        break
      }
      case 6: {
        current1 = format(Decimal.pow(0.965, CalcECC('reincarnation', player.challengecompletions[6])), 3, true)
        current2 = format(CalcECC('reincarnation', player.challengecompletions[6]).mul(10))
        current3 = format(CalcECC('reincarnation', player.challengecompletions[6]).mul(2))
        break
      }
      case 7: {
        current1 = format(CalcECC('reincarnation', player.challengecompletions[7]).mul(0.04).add(1), 2, true)
        current2 = current3 = format(CalcECC('reincarnation', player.challengecompletions[7]).mul(10))
        break
      }
      case 8: {
        current1 = format(CalcECC('reincarnation', player.challengecompletions[8]).mul(0.25), 2, true)
        current2 = format(CalcECC('reincarnation', player.challengecompletions[8]).mul(20), 2, true)
        current3 = format(CalcECC('reincarnation', player.challengecompletions[8]).mul(4), 2, true)
        break
      }
      case 9: {
        current1 = format(CalcECC('reincarnation', player.challengecompletions[9]))
        current2 = format(Decimal.pow(1.1, CalcECC('reincarnation', player.challengecompletions[9])), 2, true)
        current3 = format(CalcECC('reincarnation', player.challengecompletions[9]).mul(20), 2, true)
        break
      }
      case 10: {
        current1 = format(CalcECC('reincarnation', player.challengecompletions[10]).mul(100))
        current2 = format(CalcECC('reincarnation', player.challengecompletions[10]).mul(2))
        current3 = format(CalcECC('reincarnation', player.challengecompletions[10]).mul(10), 2, true)
        break
      }
      case 11: {
        current1 = format(CalcECC('ascension', player.challengecompletions[11]).mul(12))
        current2 = format(Decimal.pow(1e5, CalcECC('ascension', player.challengecompletions[11])))
        current3 = format(CalcECC('ascension', player.challengecompletions[11]).mul(80))
        break
      }
      case 12: {
        current1 = format(CalcECC('ascension', player.challengecompletions[12]).mul(50))
        current2 = format(CalcECC('ascension', player.challengecompletions[12]).mul(12))
        current3 = format(CalcECC('ascension', player.challengecompletions[12]))
        break
      }
      case 13: {
        current1 = formatPerc(Decimal.pow(0.966, CalcECC('ascension', player.challengecompletions[13])), 3, true)
        current2 = format(CalcECC('ascension', player.challengecompletions[13]).mul(6))
        current3 = format(CalcECC('ascension', player.challengecompletions[13]).mul(3))
        break
      }
      case 14: {
        current1 = format(CalcECC('ascension', player.challengecompletions[14]).mul(50))
        current2 = format(CalcECC('ascension', player.challengecompletions[14]))
        current3 = format(CalcECC('ascension', player.challengecompletions[14]).mul(200))
        break
      }
    }

    a.textContent = i18next.t(`challenges.${i}.name`, {
      value: completions,
      completions: player.challengecompletions[i],
      max: maxChallenges
    })
    b.textContent = i18next.t(`challenges.${i}.flavor`)
    c.textContent = i18next.t(`challenges.${i}.restrictions`)
    d.textContent = i18next.t(`challenges.${i}.goal`, { value: goal })
    e.textContent = i18next.t(`challenges.${i}.per.1`)
    f.textContent = i18next.t(`challenges.${i}.per.2`)
    g.textContent = i18next.t(`challenges.${i}.per.3`)
    h.textContent = i18next.t(`challenges.${i}.first`)
    k.textContent = i18next.t(`challenges.${i}.start`)
    l.textContent = i18next.t(`challenges.${i}.current.1`, { value: current1 })
    m.textContent = i18next.t(`challenges.${i}.current.2`, { value: current2 })
    n.textContent = i18next.t(`challenges.${i}.current.3`, { value: current3 })
  }

  if (i === 15 && G.challengefocus === 15 && maxChallenges === 0) {
    d.textContent = i18next.t('challenges.15.noGoal')
  }

  const scoreArray1 = [0, 8, 10, 12, 15, 20, 60, 80, 120, 180, 300]
  const scoreArray2 = [0, 10, 12, 15, 20, 30, 80, 120, 180, 300, 450]
  const scoreArray3 = [0, 20, 30, 50, 100, 200, 250, 300, 400, 500, 750]
  const scoreArray4 = [0, 10000, 10000, 10000, 10000, 10000, 2000, 3000, 4000, 5000, 7500]
  let scoreDisplay = 0
  if (i <= 5) {
    if (Decimal.gte(player.highestchallengecompletions[i], 9000)) {
      scoreDisplay = scoreArray4[i]
    } else if (Decimal.gte(player.highestchallengecompletions[i], 750)) {
      scoreDisplay = scoreArray3[i]
    } else if (Decimal.gte(player.highestchallengecompletions[i], 75)) {
      scoreDisplay = scoreArray2[i]
    } else {
      scoreDisplay = scoreArray1[i]
    }
  }
  if (i > 5 && i <= 10) {
    if (Decimal.gte(player.highestchallengecompletions[i], 60)) {
      scoreDisplay = scoreArray3[i]
    } else if (Decimal.gte(player.highestchallengecompletions[i], 25)) {
      scoreDisplay = scoreArray2[i]
    } else {
      scoreDisplay = scoreArray1[i]
    }
  }
  if (changefocus) {
    j.textContent = ''
  }
  if (player.ascensionCount.eq(0)) {
    descriptor = 'Quarks'
    j.style.color = 'cyan'
  }
  if (
    player.challengecompletions[i] >= player.highestchallengecompletions[i]
    && Decimal.lt(player.highestchallengecompletions[i], maxChallenges) && changefocus && player.ascensionCount.lt(1)
  ) {
    j.textContent = i18next.t(descriptor ? 'challenges.firstTimeBonusQuarks' : 'challenges.firstTimeBonus', {
      x: Decimal.floor(
        Decimal.mul(quarksMultiplier, player.highestchallengecompletions[i]).div(10)
          .add(1)
          .add(player.cubeUpgrades[1])
          .add(player.cubeUpgrades[11])
          .add(player.cubeUpgrades[21])
          .add(player.cubeUpgrades[31])
          .add(player.cubeUpgrades[41])
      )
    })
  }
  if (
    player.challengecompletions[i] >= player.highestchallengecompletions[i]
    && Decimal.lt(player.highestchallengecompletions[i], maxChallenges) && changefocus && player.ascensionCount.gte(1)
  ) {
    j.textContent = i18next.t('challenges.ascensionBankAdd', {
      x: i > 5 ? 2 : 1,
      y: scoreDisplay
    })
  }
  if (
    Decimal.gte(player.challengecompletions[i], player.highestchallengecompletions[i])
    && Decimal.lt(player.highestchallengecompletions[i], 10) && i > 10
  ) {
    j.textContent = i18next.t('challenges.hypercubeOneTimeBonus')
  }

  if (changefocus) {
    const el = DOMCacheGetOrSet('toggleAutoChallengeIgnore')
    el.style.display = i <= (autoAscensionChallengeSweepUnlock() ? 15 : 10) && player.researches[150] > 0
      ? 'block'
      : 'none'
    el.style.border = player.autoChallengeToggles[i] ? '2px solid green' : '2px solid red'

    if (i >= 11 && i <= 15) {
      if (player.autoChallengeToggles[i]) {
        el.textContent = i18next.t('challenges.autoAscRunChalOn', { x: i })
      } else {
        el.textContent = i18next.t('challenges.autoAscRunChalOff', { x: i })
      }
    } else {
      if (player.autoChallengeToggles[i]) {
        el.textContent = i18next.t('challenges.autoRunChalOn', { x: i })
      } else {
        el.textContent = i18next.t('challenges.autoRunChalOff', { x: i })
      }
    }
  }

  const ella = DOMCacheGetOrSet('toggleAutoChallengeStart')
  if (player.autoChallengeRunning) {
    ella.textContent = i18next.t('challenges.autoChallengeSweepOn')
    ella.style.border = '2px solid gold'
  } else {
    ella.textContent = i18next.t('challenges.autoChallengeSweepOff')
    ella.style.border = '2px solid red'
  }
}

export const getChallengeConditions = (i?: number) => {
  if (player.currentChallenge.reincarnation === 9) {
    G.rune1level = new Decimal(1)
    G.rune2level = new Decimal(1)
    G.rune3level = new Decimal(1)
    G.rune4level = new Decimal(1)
    G.rune5level = new Decimal(1)
    player.crystalUpgrades = [
      new Decimal(0),
      new Decimal(0),
      new Decimal(0),
      new Decimal(0),
      new Decimal(0),
      new Decimal(0),
      new Decimal(0),
      new Decimal(0)
    ]
  }
  G.prestigePointGain = new Decimal(0)
  if (typeof i === 'number') {
    if (i >= 6) {
      G.transcendPointGain = new Decimal(0)
    }
    if (i >= 11) {
      G.reincarnationPointGain = new Decimal(0)
    }
  }
  calculateRuneLevels()
}

export const toggleRetryChallenges = () => {
  DOMCacheGetOrSet('retryChallenge').textContent = player.retrychallenges
    ? i18next.t('challenges.retryChallengesOff')
    : i18next.t('challenges.retryChallengesOn')

  player.retrychallenges = !player.retrychallenges
}

export const highestChallengeRewards = (chalNum: number, highestValue: Decimal) => {
  let multiplier = 1 / 10
  if (chalNum >= 6) {
    multiplier = 1
  }
  if (player.ascensionCount.eq(0)) {
    player.worlds.add(Decimal.floor(Decimal.mul(highestValue, multiplier)).add(1).toNumber()) // not yet
  }
  // Addresses a bug where auto research does not work even if you unlock research
  if (autoResearchEnabled() && player.ascensionCount.eq(0) && chalNum >= 6 && chalNum <= 10) {
    player.roombaResearchIndex = 0
    player.autoResearch = G.researchOrderByCost[player.roombaResearchIndex]
  }
}

// Works to mitigate the difficulty of calculating challenge multipliers when considering softcapping
export const calculateChallengeRequirementMultiplier = (
  type: 'transcend' | 'reincarnation' | 'ascension',
  completions: number | Decimal,
  special = 0
) => {
  completions = new Decimal(completions)
  let requirementMultiplier = new Decimal(1)
  if (type !== 'ascension') {
    requirementMultiplier = Decimal.max(
      1,
      G.hyperchallengedMultiplier[player.usedCorruptions[4]] / (1 + player.platonicUpgrades[8] / 2.5)
    )
  }
  let i = completions
  switch (type) {
    case 'transcend':
      if (Decimal.gte(i, 9000)) {
        i = Decimal.div(i, 9000).pow_base(9000)
      }

      if (Decimal.gte(i, 1000)) {
        i = Decimal.div(i, 1000).pow(1.25).mul(1000)
      }

      if (Decimal.gte(i, 75)) {
        i = Decimal.div(i, 75).pow(12).mul(75)
      }

      requirementMultiplier = requirementMultiplier.mul(i.add(1).pow(2))
      requirementMultiplier = requirementMultiplier.mul(G.challenge15Rewards.transcendChallengeReduction)
      return requirementMultiplier
    case 'reincarnation':
      if (Decimal.gte(i, 100) && (special === 9 || special === 10)) {
        i = i.div(100).pow(2).mul(100)
      }

      if (Decimal.gte(i, 60) && (special === 9 || special === 10)) {
        i = Decimal.pow(
          60,
          i.div(60).mul(1 - 0.01 * player.shopUpgrades.challengeTome - 0.01 * player.shopUpgrades.challengeTome2).pow(
            0.25 + 0.025 * (special - 6)
          )
        ).min(i)
      }

      if (Decimal.gte(i, 25)) {
        i = Decimal.div(i, 25).pow(2).mul(25)
      }

      requirementMultiplier = requirementMultiplier.mul(Decimal.pow(2, i.pow(0.75)))
      requirementMultiplier = requirementMultiplier.mul(G.challenge15Rewards.reincarnationChallengeReduction)
      return requirementMultiplier
    case 'ascension':
      if (special !== 15) {
        if (Decimal.gte(i, 10)) {
          i = Decimal.sub(i, 10).mul(2).add(10)
        }

        requirementMultiplier = requirementMultiplier.mul(i.add(1))
      } else {
        requirementMultiplier = requirementMultiplier.mul(Decimal.pow(1000, i))
      }
      return requirementMultiplier
  }
}

/**
 * Works to mitigate the difficulty of calculating challenge reward multipliers when considering softcapping
 */
export const CalcECC = (type: 'transcend' | 'reincarnation' | 'ascension', completions: Decimal) => { // ECC stands for "Effective Challenge Completions"
  // * tearonq modifications:
  let effective = new Decimal(completions)
  if (type === 'transcend') {
    effective = effective.sub(0)
    // idk what i'll use this for but i don't want it to keep giving out warnings
  }
  return effective
}

export const challengeRequirement = (challenge: number, completion: number | Decimal, special = 0) => {
  const base = G.challengeBaseRequirements[challenge - 1]
  if (challenge <= 5) {
    return Decimal.pow(10, calculateChallengeRequirementMultiplier('transcend', completion, special).mul(base))
  } else if (challenge <= 10) {
    let c10Reduction = 0
    if (challenge === 10) {
      c10Reduction =
        1e8 * (player.researches[140] + player.researches[155] + player.researches[170] + player.researches[185])
        + 2e7 * (player.shopUpgrades.challengeTome + player.shopUpgrades.challengeTome2)
    }
    return Decimal.pow(
      10,
      calculateChallengeRequirementMultiplier('reincarnation', completion, special).mul(Decimal.sub(base, c10Reduction))
    )
  } else if (challenge <= 14) {
    return calculateChallengeRequirementMultiplier('ascension', completion, special)
  } else if (challenge === 15) {
    return Decimal.pow(
      10,
      calculateChallengeRequirementMultiplier('ascension', completion, special).mul(1e30)
    )
  } else {
    throw new Error(`fuck invis challenge ${challenge}`)
  }
}

/**
 * Function that handles the autochallenge feature.
 * Currently includes ability to enter a challenge, leave a challenge
 * and start a challenge loop with specified challenges from index 1 to 10.
 * @param dt
 * @returns none
 */
export const runChallengeSweep = (dt: Decimal) => {
  // Do not run if any of these conditions hold
  if (
    player.researches[150] === 0 // Research 6x25 is 0
    || !player.autoChallengeRunning // Auto challenge is toggled off
  ) {
    return
  }

  // Increment auto challenge timer
  G.autoChallengeTimerIncrement = Decimal.add(G.autoChallengeTimerIncrement, dt)

  // Determine what Action you can take with the current state of the savefile
  let action = 'none'
  if (
    player.currentChallenge.reincarnation !== 0
    || player.currentChallenge.transcension !== 0
  ) {
    // If you are in a challenge, you'd only want the automation to exit the challenge
    action = 'exit'
  } else if (player.autoChallengeIndex === 1) {
    // If the index is set to 1, then you are at the start of a loop
    action = 'start'
  } else {
    // If neither of the above are true, automation will want to enter a challenge
    action = 'enter'
  }

  // In order to earn C15 Exponent, stop runChallengeSweep() 5 seconds before the auto ascension
  // runs during the C15, Auto Challenge Sweep, Autcension and Mode: Real Time.
  if (
    autoAscensionChallengeSweepUnlock() && player.currentChallenge.ascension === 15
    && player.shopUpgrades.challenge15Auto === 0
    && (action === 'start' || action === 'enter') && player.autoAscend && player.challengecompletions[11].gt(0)
    && player.cubeUpgrades[10].gt(0)
    && player.autoAscendMode === 'realAscensionTime'
    && player.ascensionCounterRealReal.gte(Math.max(0.1, player.autoAscendThreshold - 5))
  ) {
    action = 'wait'
    toggleAutoChallengeModeText('WAIT')
    return
  }

  // Action: Exit challenge
  if (Decimal.gte(G.autoChallengeTimerIncrement, player.autoChallengeTimer.exit) && action === 'exit') {
    // Determine if you're in a reincarnation or transcension challenge
    const challengeType = player.currentChallenge.reincarnation !== 0 ? 'reincarnation' : 'transcension'

    // Reset our autochallenge timer
    G.autoChallengeTimerIncrement = new Decimal(0)

    // Increment our challenge index for when we enter (or start) next challenge
    const nowChallenge = player.autoChallengeIndex
    const nextChallenge = getNextChallenge(nowChallenge + 1)

    // Reset based on challenge type
    if (challengeType === 'transcension') {
      void resetCheck('transcensionChallenge', undefined, true)
    }
    if (challengeType === 'reincarnation') {
      void resetCheck('reincarnationChallenge', undefined, true)
    }

    // If you don't need to start all the challenges, the challenges will end.
    if (nextChallenge <= 10) {
      /* If the next challenge is before the current challenge,
               it will be in 'START' mode, otherwise it will be in 'ENTER' mode. */
      if (nextChallenge < nowChallenge) {
        player.autoChallengeIndex = 1
        toggleAutoChallengeModeText('START')
      } else {
        player.autoChallengeIndex = nextChallenge
        toggleAutoChallengeModeText('ENTER')
      }
    }
    return
  }

  // Action: Enter a challenge (not inside one)
  if (
    (Decimal.gte(G.autoChallengeTimerIncrement, player.autoChallengeTimer.start) && action === 'start')
    || (Decimal.gte(G.autoChallengeTimerIncrement, player.autoChallengeTimer.enter) && action === 'enter')
  ) {
    // Reset our autochallenge timer
    G.autoChallengeTimerIncrement = new Decimal(0)

    // This calculates which challenge this algorithm will run first, based on
    // the first challenge which has automation toggled ON
    const nowChallenge = player.autoChallengeIndex
    const nextChallenge = getNextChallenge(nowChallenge)

    // Do not start the challenge if all the challenges have been completed.
    if (nextChallenge === 11) {
      return
    }

    // Set our index to calculated starting challenge and run the challenge
    player.autoChallengeIndex = nextChallenge
    toggleChallenges(player.autoChallengeIndex, true)

    // Sets Mode to "EXIT" as displayed in the challenge tab
    toggleAutoChallengeModeText('EXIT')
    return
  }
}

// Look for the next uncompleted challenge.
export const getNextChallenge = (startChallenge: number, maxSkip = false, min = 1, max = 10) => {
  let nextChallenge = startChallenge
  /* Calculate the smallest challenge index we want to enter.
       Our minimum is the current index, but if that challenge is fully completed
       or toggled off we shouldn't run it, so we increment upwards in these cases. */
  for (let index = nextChallenge; index <= max; index++) {
    if (
      !player.autoChallengeToggles[index]
      || (!maxSkip && index !== 15 && Decimal.gte(player.highestchallengecompletions[index], getMaxChallenges(index)))
    ) {
      nextChallenge += 1
    } else {
      break
    }
  }

  /* If the above algorithm sets the index above 10, the loop is complete
       and thus do not need to enter more challenges. This sets our index to 1
       so in the next iteration it knows we want to start a loop. */
  if (nextChallenge > max) {
    // If the challenge reaches 11 or higher, return it to 1 and check again.
    nextChallenge = min
    for (let index = nextChallenge; index <= max; index++) {
      if (
        !player.autoChallengeToggles[index]
        || (!maxSkip && index !== 15 && Decimal.gte(player.highestchallengecompletions[index], getMaxChallenges(index)))
      ) {
        nextChallenge += 1
      } else {
        break
      }
    }
  }
  return nextChallenge
}

export const autoAscensionChallengeSweepUnlock = () => {
  return player.highestSingularityCount >= 101 && player.shopUpgrades.instantChallenge2 > 0
}

export const challenge15ScoreMultiplier = () => {
  const arr = [
    Decimal.mul(hepteractEffective('challenge'), 0.0005).add(1), // Challenge Hepteract
    1 + 0.25 * player.platonicUpgrades[15] // Omega Upgrade
  ]
  return productContentsDecimal(arr)
}
