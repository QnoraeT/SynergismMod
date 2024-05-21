/* Note by Platonic, April 1 2021
This is an experimental file for making cubes their own class
and make them easily re-used for later purposes.
Please do not change the *file name* or use anything developed in this
file without asking me first. You may edit this file as much as you
want, though!
Thank you! */

import Decimal from "break_eternity.js";
import i18next from 'i18next'
import { achievementaward } from './Achievements'
import { calculateCubeBlessings } from './Calculate'
import { CalcECC } from './Challenges'
import { calculateHypercubeBlessings } from './Hypercubes'
import { calculatePlatonicBlessings } from './PlatonicCubes'
import { quarkHandler } from './Quark'
import { format, player } from './Synergism'
import { calculateTesseractBlessings } from './Tesseracts'
import type { Player } from './types/Synergism'
import { Alert, Prompt } from './UpdateHTML'

/* Constants */

const blessings: Record<
  keyof Player['cubeBlessings'],
  { weight: number; pdf: (x: number) => boolean }
> = {
  accelerator: { weight: 4, pdf: (x: number) => 0 <= x && x <= 20 },
  multiplier: { weight: 4, pdf: (x: number) => 20 < x && x <= 40 },
  offering: { weight: 2, pdf: (x: number) => 40 < x && x <= 50 },
  runeExp: { weight: 2, pdf: (x: number) => 50 < x && x <= 60 },
  obtainium: { weight: 2, pdf: (x: number) => 60 < x && x <= 70 },
  antSpeed: { weight: 2, pdf: (x: number) => 70 < x && x <= 80 },
  antSacrifice: { weight: 1, pdf: (x: number) => 80 < x && x <= 85 },
  antELO: { weight: 1, pdf: (x: number) => 85 < x && x <= 90 },
  talismanBonus: { weight: 1, pdf: (x: number) => 90 < x && x <= 95 },
  globalSpeed: { weight: 1, pdf: (x: number) => 95 < x && x <= 100 }
}

const platonicBlessings: Record<
  keyof Player['platonicBlessings'],
  { weight: number; pdf: (x: number) => boolean }
> = {
  cubes: { weight: 13200, pdf: (x: number) => 0 <= x && x <= 33.000 },
  tesseracts: { weight: 13200, pdf: (x: number) => 33.000 < x && x <= 66.000 },
  hypercubes: { weight: 13200, pdf: (x: number) => 66.000 < x && x <= 99.000 },
  platonics: { weight: 396, pdf: (x: number) => 99.000 < x && x <= 99.990 },
  hypercubeBonus: { weight: 1, pdf: (x: number) => 99.990 < x && x <= 99.9925 },
  taxes: { weight: 1, pdf: (x: number) => 99.9925 < x && x <= 99.995 },
  scoreBonus: { weight: 1, pdf: (x: number) => 99.995 < x && x <= 99.9975 },
  globalSpeed: { weight: 1, pdf: (x: number) => 99.9975 < x && x <= 100 }
}

/**
 * @description Generic class for handling cube subsets.
 * @example
 * class PlatCubes extends Currency {
 *   constructor() {
 *       super('wowPlatonicCubes', player.wowPlatonicCubes);
 *   }
 *
 *   async open(amount: number, value: boolean) {
 *       // implement open logic here
 *   }
 * }
 *
 * new PlatCubes().openCustom();
 */
export abstract class Cube {
  /** key on the player object */
  private key: keyof Player
  private value: number | Decimal

  constructor (
    type: keyof Player,
    v = new Decimal(0)
  ) {
    this.key = type
    this.value = new Decimal(v)
  }

  /**
   * @description Open a given amount of cubes
   * @param amount Number of cubes to open
   * @param max if true, overwrites amount and opens the max amount of cubes.
   * @param free if true, does not decrease the amount of cubes.
   */
  abstract open (amount: number | Decimal, max: boolean, free: boolean): Promise<void> | void

  /** Open a custom amount of cubes */
  async openCustom () {
    // TODO: Replace this with `this`?
    const thisInPlayer = player[this.key] as Cube
    const amount = await Prompt(i18next.t('cubes.howManyCubesOpen', { x: format(thisInPlayer, 0, true) }))

    if (amount === null) {
      return Alert(i18next.t('cubes.noCubesOpened'))
    }

    const isPercentage = amount.endsWith('%')
    const cubesToOpen = amount.startsWith('-')
      ? (isPercentage ? 100 + Number(amount.slice(0, -1)) : Decimal.add(thisInPlayer.value, amount))
      : (isPercentage ? Number(amount.slice(0, -1)) : Number(amount))

    if (Number.isNaN(cubesToOpen) || !Number.isFinite(cubesToOpen) || !Number.isInteger(cubesToOpen)) {
      return Alert(i18next.t('general.validation.finiteInt'))
    } else if (thisInPlayer.value < cubesToOpen) {
      return Alert(i18next.t('cubes.validation.notEnough'))
    } else if (Decimal.lte(cubesToOpen, 0)) {
      return Alert(i18next.t('cubes.validation.negative'))
    } else if (isPercentage && Decimal.gt(cubesToOpen, 100)) {
      return Alert(i18next.t('cubes.validation.invalidPercent', { x: cubesToOpen }))
    }

    if (isPercentage) {
      return this.open(
        Decimal.floor(Decimal.mul(thisInPlayer.value, Decimal.div(cubesToOpen, 100))),
        cubesToOpen === 100,
        false
      )
    }

    return this.open(cubesToOpen, cubesToOpen === thisInPlayer.value, false)
  }

  /** @description Check how many quarks you should have gained through opening cubes today */
  checkQuarkGain (base: number | Decimal, mult: number | Decimal, cubes: number | Decimal): Decimal {
    if (Decimal.lt(cubes, 1)) {
      return new Decimal(0)
    }
    // General quark multiplier from other in-game features
    // Multiplier from passed parameter
    const multiplier = quarkHandler().cubeMult.mul(mult)

    return Decimal.floor(player.worlds.applyBonus(Decimal.log10(cubes).mul(base).mul(multiplier)))
  }

  /** @description Check how many cubes you need to gain an additional quark from opening */
  checkCubesToNextQuark (base: number | Decimal, mult: number | Decimal, quarks: Decimal, cubes: Decimal): Decimal {
    // General quark multiplier from other in-game features
    // Multiplier from passed parameter
    const multiplier = quarkHandler().cubeMult.mul(mult)

    return Decimal.ceil(Decimal.pow(10, (quarks.add(1)).div(player.worlds.applyBonus(Decimal.mul(base, multiplier)))).sub(cubes))
  }

  add (amount: number | Decimal): this {
    this.value = Decimal.min(1e300, this.value.add(amount)) // cap lol
    return this
  }

  sub (amount: number | Decimal): this {
    this.value = Decimal.max(0, this.value.sub(amount))
    return this
  }

  [Symbol.toPrimitive] (h: string) {
    switch (h) {
      case 'string':
        return this.value.toString()
      case 'number':
        return this.value
      default:
        return null
    }
  }
}

export class WowCubes extends Cube {
  constructor (amount = new Decimal(player.wowCubes)) {
    super('wowCubes', amount)
  }

  open (value: Decimal, max = false, free = false) {
    let toSpend = max ? new Decimal(this) : (free ? value : Decimal.min(this, value))

    if (value.eq(1) && player.cubeBlessings.accelerator.gte(2e11) && player.achievements[246] < 1) {
      achievementaward(246)
    }

    if (!free) {
      this.sub(toSpend)
    }
    player.cubeOpenedDaily = player.cubeOpenedDaily.add(toSpend)

    const quarkMult = (player.shopUpgrades.cubeToQuark) ? 1.5 : 1
    const gainQuarks = Number(this.checkQuarkGain(5, quarkMult, player.cubeOpenedDaily))
    const actualQuarksGain = Math.max(0, gainQuarks - player.cubeQuarkDaily)
    player.cubeQuarkDaily += actualQuarksGain
    player.worlds.add(actualQuarksGain, false)

    toSpend = toSpend.mul(1 + player.researches[138] / 1000)
    toSpend = toSpend.mul(1 + 0.8 * player.researches[168] / 1000)
    toSpend = toSpend.mul(1 + 0.6 * player.researches[198] / 1000)

    toSpend = Decimal.floor(toSpend)
    let toSpendModulo = Decimal.mod(toSpend, 20)
    let toSpendDiv20 = Decimal.floor(toSpend.div(20))

    if (toSpendDiv20.gt(0) && player.cubeUpgrades[13] === 1) {
      toSpendModulo = toSpendModulo.add(toSpendDiv20)
    }
    if (toSpendDiv20.gt(0) && player.cubeUpgrades[23] === 1) {
      toSpendModulo = toSpendModulo.add(toSpendDiv20)
    }
    if (toSpendDiv20.gt(0) && player.cubeUpgrades[33] === 1) {
      toSpendModulo = toSpendModulo.add(toSpendDiv20)
    }

    toSpendDiv20 = toSpendDiv20.add(Decimal.floor(toSpendModulo.div(20)))
    toSpendModulo = Decimal.mod(toSpendModulo, 20)

    const keys = Object.keys(player.cubeBlessings) as (keyof Player['cubeBlessings'])[]

    // If you're opening more than 20 cubes, it will consume all cubes until remainder mod 20, giving expected values.
    for (const key of keys) {
      player.cubeBlessings[key] += Decimal.mul(blessings[key].weight, toSpendDiv20)
        .mul(1 + Math.floor(CalcECC('ascension', player.challengecompletions[12])))
    }

    // Then, the remaining cubes will be opened, simulating the probability [RNG Element]
    for (let i = 0; i < toSpendModulo.toNumber(); i++) {
      const num = 100 * Math.random()
      for (const key of keys) {
        if (blessings[key].pdf(num)) {
          player.cubeBlessings[key] += 1 + Math.floor(CalcECC('ascension', player.challengecompletions[12]))
        }
      }
    }

    calculateCubeBlessings()
  }
}

export class WowTesseracts extends Cube {
  constructor (amount = player.wowTesseracts) {
    super('wowTesseracts', amount)
  }

  open (value: Decimal, max = false, free = false) {
    let toSpend = max ? new Decimal(this) : (free ? value : Decimal.min(this, value))

    if (!free) {
      player.wowTesseracts.sub(toSpend)
    }
    player.tesseractOpenedDaily += toSpend

    const quarkMult = (player.shopUpgrades.tesseractToQuark) ? 1.5 : 1
    const gainQuarks = Number(this.checkQuarkGain(7, quarkMult, player.tesseractOpenedDaily))
    const actualQuarksGain = Math.max(0, gainQuarks - player.tesseractQuarkDaily)
    player.tesseractQuarkDaily += actualQuarksGain
    player.worlds.add(actualQuarksGain, false)

    let toSpendModulo = Decimal.mod(toSpend, 20)
    let toSpendDiv20 = Decimal.floor(toSpend.div(20))

    // If you're opening more than 20 Tesseracts, it will consume all Tesseracts until remainder mod 20, giving expected values.
    for (const key in player.tesseractBlessings) {
      player.tesseractBlessings[key as keyof Player['tesseractBlessings']] =player.tesseractBlessings[key as keyof Player['tesseractBlessings']].add(Decimal.mul(blessings[key as keyof typeof blessings].weight, toSpendDiv20))
    }
    // Then, the remaining tesseract will be opened, simulating the probability [RNG Element]
    for (let i = 0; i < toSpendModulo.toNumber(); i++) {
      const num = 100 * Math.random()
      for (const key in player.tesseractBlessings) {
        if (blessings[key as keyof typeof blessings].pdf(num)) {
          player.tesseractBlessings[key as keyof Player['tesseractBlessings']] = player.tesseractBlessings[key as keyof Player['tesseractBlessings']].add(1)
        }
      }
    }

    calculateTesseractBlessings()
    const extraCubeBlessings = Decimal.floor(Decimal.mul(12, toSpend).mul(player.researches[153]))
    player.wowCubes.open(extraCubeBlessings, false, true)
  }
}

export class WowHypercubes extends Cube {
  constructor (amount = new Decimal(player.wowHypercubes)) {
    super('wowHypercubes', amount)
  }

  open (value: Decimal, max = false, free = false) {
    let toSpend = max ? new Decimal(this) : (free ? value : Decimal.min(this, value))

    if (!free) {
      player.wowHypercubes.sub(toSpend)
    }
    player.hypercubeOpenedDaily += toSpend

    const quarkMult = (player.shopUpgrades.hypercubeToQuark) ? 1.5 : 1
    const gainQuarks = this.checkQuarkGain(10, quarkMult, player.hypercubeOpenedDaily)
    const actualQuarksGain = Decimal.max(0, gainQuarks.sub(player.hypercubeQuarkDaily))
    player.hypercubeQuarkDaily.add(actualQuarksGain)
    player.worlds.add(actualQuarksGain, false)

    let toSpendModulo = Decimal.mod(toSpend, 20)
    let toSpendDiv20 = Decimal.floor(toSpend.div(20))

    // If you're opening more than 20 Hypercubes, it will consume all Hypercubes until remainder mod 20, giving expected values.
    for (const key in player.hypercubeBlessings) {
      player.hypercubeBlessings[key as keyof Player['hypercubeBlessings']] = player.hypercubeBlessings[key as keyof Player['hypercubeBlessings']].add(Decimal.mul(blessings[key as keyof typeof blessings].weight, toSpendDiv20))
    }
    // Then, the remaining hypercubes will be opened, simulating the probability [RNG Element]
    for (let i = 0; i < toSpendModulo.toNumber(); i++) {
      const num = 100 * Math.random()
      for (const key in player.hypercubeBlessings) {
        if (blessings[key as keyof typeof blessings].pdf(num)) {
          player.hypercubeBlessings[key as keyof Player['hypercubeBlessings']] += 1
        }
      }
    }

    calculateHypercubeBlessings()
    const extraTesseractBlessings = Decimal.floor(Decimal.mul(toSpend, player.researches[183]).mul(100))
    player.wowTesseracts.open(extraTesseractBlessings, false, true)
  }
}

export class WowPlatonicCubes extends Cube {
  constructor (amount = new Decimal(player.wowPlatonicCubes)) {
    super('wowPlatonicCubes', amount)
  }

  open (value: Decimal, max = false, free = false) {
    let toSpend = max ? new Decimal(this) : (free ? value : Decimal.min(this, value))

    if (!free) {
      player.wowPlatonicCubes.sub(toSpend)
    }
    player.platonicCubeOpenedDaily += toSpend

    const quarkMult = 1.5 // There's no platonic to quark upgrade, default as 1.5
    const gainQuarks = this.checkQuarkGain(15, quarkMult, player.platonicCubeOpenedDaily)
    const actualQuarksGain = Decimal.max(0, gainQuarks.sub(player.platonicCubeQuarkDaily))
    player.platonicCubeQuarkDaily += actualQuarksGain
    player.worlds.add(actualQuarksGain, false)

    let toSpendModulo = Decimal.mod(toSpend, 40000)
    let toSpendDiv40000 = Decimal.floor(toSpend.div(40000))

    // If you're opening more than 40,000 Platonics, it will consume all Platonics until remainder mod 40,000, giving expected values.
    for (const key in player.platonicBlessings) {
      player.platonicBlessings[key as keyof Player['platonicBlessings']] = player.platonicBlessings[key as keyof Player['platonicBlessings']].add(Decimal.mul(platonicBlessings[key as keyof typeof platonicBlessings].weight, toSpendDiv40000))
      if (platonicBlessings[key as keyof typeof platonicBlessings].weight === 1 && player.cubeUpgrades[64] > 0) {
        player.platonicBlessings[key as keyof Player['platonicBlessings']] = player.platonicBlessings[key as keyof Player['platonicBlessings']].add(toSpendDiv40000) // Doubled!
      }
    }
    // Then, the remaining hypercube will be opened, simulating the probability [RNG Element]
    let tSMNum = toSpendModulo.toNumber()
    const RNGesus = ['hypercubeBonus', 'taxes', 'scoreBonus', 'globalSpeed']
    for (let i = 0; i < RNGesus.length; i++) {
      const num = Math.random()
      if (tSMNum / 40000 >= num && tSMNum !== 0) {
        player.platonicBlessings[RNGesus[i] as keyof Player['platonicBlessings']] = player.platonicBlessings[RNGesus[i] as keyof Player['platonicBlessings']].add(1)
        tSMNum -= 1
      }
    }
    const gainValues = [
      Decimal.floor(toSpendModulo.mul(0.33)),
      Decimal.floor(toSpendModulo.mul(0.33)),
      Decimal.floor(toSpendModulo.mul(0.33)),
      Decimal.floor(toSpendModulo.mul(0.0099))
    ]
    const commonDrops = ['cubes', 'tesseracts', 'hypercubes', 'platonics'] as const
    for (let i = 0; i < commonDrops.length; i++) {
      player.platonicBlessings[commonDrops[i]] = player.platonicBlessings[commonDrops[i]].add(gainValues[i])
      toSpendModulo = toSpendModulo.sub(gainValues[i])
    }

    for (let i = 0; i < toSpendModulo.toNumber(); i++) {
      const num = 100 * Math.random()
      for (const key in player.platonicBlessings) {
        if (platonicBlessings[key as keyof typeof platonicBlessings].pdf(num)) {
          player.platonicBlessings[key as keyof Player['platonicBlessings']] = player.platonicBlessings[key as keyof Player['platonicBlessings']].add(1)
        }
      }
    }
    calculatePlatonicBlessings()
    if (player.achievements[271] > 0) {
      const extraHypercubes = Decimal.floor(
        toSpend.mul(Decimal.max(0, Decimal.min(1, Decimal.log10(player.ascendShards.add(1)).sub(1e5).div(9e5))))
      )
      player.wowHypercubes.open(extraHypercubes, false, true)
    }
  }
}
