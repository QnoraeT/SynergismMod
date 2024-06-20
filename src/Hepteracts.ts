import Decimal, { type DecimalSource } from 'break_eternity.js'
import type { StringMap } from 'i18next'
import i18next from 'i18next'
import { DOMCacheGetOrSet } from './Cache/DOM'
import {
  calculateCubeMultFromPowder,
  calculateCubeQuarkMultiplier,
  calculatePowderConversion,
  calculateQuarkMultFromPowder,
  forcedDailyReset
} from './Calculate'
import { Cube } from './CubeExperimental'
import { calculateSingularityDebuff } from './singularity'
import { format, player } from './Synergism'
import type { Player } from './types/Synergism'
import { Alert, Confirm, Prompt } from './UpdateHTML'

export interface IHepteractCraft {
  BASE_CAP: DecimalSource
  HEPTERACT_CONVERSION: DecimalSource
  OTHER_CONVERSIONS: Record<string, DecimalSource>
  HTML_STRING: string
  AUTO?: boolean
  UNLOCKED?: boolean
  BAL?: DecimalSource
  CAP?: DecimalSource
  DISCOUNT?: DecimalSource
}

export const hepteractTypeList = [
  'chronos',
  'hyperrealism',
  'quark',
  'challenge',
  'abyss',
  'accelerator',
  'acceleratorBoost',
  'multiplier'
] as const

export type hepteractTypes = typeof hepteractTypeList[number]

export class HepteractCraft {
  /**
   * Craft is unlocked or not (Default is locked)
   */
  UNLOCKED = false

  /**
   * Current Inventory (amount) of craft you possess
   */
  BAL: DecimalSource = new Decimal(0)

  /**
   * Maximum Inventory (amount) of craft you can hold
   * base_cap is the smallest capacity for such item.
   */
  CAP: DecimalSource = new Decimal(0)
  BASE_CAP: DecimalSource = new Decimal(0)

  /**
   * Conversion rate of hepteract to synthesized items
   */
  HEPTERACT_CONVERSION: DecimalSource = new Decimal(0)

  /**
   * Automatic crafting toggle. If on, allows crafting to be done automatically upon ascension.
   */
  AUTO = false

  /**
   * Conversion rate of additional items
   * This is in the form of keys being player variables,
   * values being the amount player has.
   */
  OTHER_CONVERSIONS: {
    [key in keyof Player]?: Decimal
  }

  /**
   * Discount Factor (number from [0, 1))
   * revamp: Discount from 1 to Infinity
   */
  DISCOUNT: DecimalSource = new Decimal(1)

  /**
   * String Prefix used for HTML DOM manipulation
   */
  HTML_STRING: string

  constructor (data: IHepteractCraft) {
    this.BASE_CAP = data.BASE_CAP
    this.HEPTERACT_CONVERSION = data.HEPTERACT_CONVERSION
    this.OTHER_CONVERSIONS = data.OTHER_CONVERSIONS
    this.HTML_STRING = data.HTML_STRING
    this.UNLOCKED = data.UNLOCKED ?? false // This would basically always be true if this parameter is provided
    this.BAL = data.BAL ?? new Decimal(0)
    this.CAP = data.CAP ?? this.BASE_CAP // This sets cap either as previous value or keeps it to default.
    this.DISCOUNT = data.DISCOUNT ?? new Decimal(0)
    this.AUTO = data.AUTO ?? false

    void this.toggleAutomatic(this.AUTO)
  }

  // Unlock a synthesizer craft
  unlock = (hepteractName: string): this | Promise<void> => {
    if (this.UNLOCKED) {
      return this
    }
    this.UNLOCKED = true
    if (player.highestSingularityCount < 5) {
      return Alert(i18next.t('hepteracts.unlockedCraft', { x: hepteractName }))
    } else {
      return this
    }
  }

  computeActualCap = (): Decimal => {
    let multiplier = new Decimal(1)
    multiplier = Decimal.mul(multiplier, (player.singularityChallenges.limitedAscensions.rewards.hepteractCap) ? 2 : 1)

    return Decimal.mul(this.CAP, multiplier)
  }

  // Add to balance through crafting.
  craft = async (max = false): Promise<HepteractCraft | void> => {
    let craftAmount = null
    const heptCap = this.computeActualCap()
    const craftCostMulti = calculateSingularityDebuff('Hepteract Costs')
    // If craft is unlocked, we return object
    if (!this.UNLOCKED) {
      return Alert(i18next.t('hepteracts.notUnlocked'))
    }

    if (Decimal.sub(heptCap, this.BAL).lte(0)) {
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.reachedCapacity', { x: format(heptCap, 0, true) }))
      }
    }

    if (Decimal.isNaN(player.wowAbyssals) || !Decimal.isFinite(player.wowAbyssals) || player.wowAbyssals.lt(0)) {
      player.wowAbyssals = new Decimal(0)
    }

    // Calculate the largest craft amount possible, with an upper limit being craftAmount
    const hepteractLimit = Decimal.floor(
      Decimal.div(player.wowAbyssals, Decimal.mul(this.HEPTERACT_CONVERSION, craftCostMulti)).mul(this.DISCOUNT)
    )

    // Create an array of how many we can craft using our conversion limits for additional items
    const itemLimits: Decimal[] = []
    for (const item in this.OTHER_CONVERSIONS) {
      // The type of player[item] is number | Decimal | Cube.
      if (item === 'worlds') {
        itemLimits.push(
          Decimal.floor(Decimal.div(player[item as keyof Player] as Decimal, this.OTHER_CONVERSIONS[item as keyof Player] ?? 1)).mul(this.DISCOUNT)
        )
      } else {
        itemLimits.push(
          Decimal.floor(Decimal.div(player[item as keyof Player] as Decimal, Decimal.mul(craftCostMulti, this.OTHER_CONVERSIONS[item as keyof Player]!)) ).mul(this.DISCOUNT)
        )
      }
    }

    // Get the smallest of the array we created
    let smallestItemLimit = new Decimal(Number.POSITIVE_INFINITY)
    for (const i in itemLimits) {
      if (Decimal.lt(smallestItemLimit, itemLimits[i])) {
        smallestItemLimit = itemLimits[i]
      }
    }

    let amountToCraft = Decimal.min(smallestItemLimit, hepteractLimit).min(heptCap).min(Decimal.sub(heptCap, this.BAL))

    // Return if the material is not a calculable number
    if (Decimal.isNaN(amountToCraft) || !Decimal.isFinite(amountToCraft)) {
      return Alert(i18next.t('hepteracts.executionFailed'))
    }

    // Prompt used here. Thank you Khafra for the already made code! -Platonic
    if (!max) {
      const craftingPrompt = await Prompt(i18next.t('hepteracts.craft', {
        x: format(amountToCraft, 0, true),
        y: Decimal.floor(Decimal.div(amountToCraft, heptCap).mul(10000)).div(100)
      }))

      if (craftingPrompt === null) { // Number(null) is 0. Yeah..
        if (player.toggles[35]) {
          return Alert(i18next.t('hepteracts.cancelled'))
        } else {
          return // If no return, then it will just give another message
        }
      }
      craftAmount = Number(craftingPrompt)
    } else {
      craftAmount = heptCap
    }

    // Check these lol
    if (Decimal.isNaN(craftAmount) || !Decimal.isFinite(craftAmount) || Decimal.floor(craftAmount).eq(craftAmount)) { // nan + Infinity checks
      return Alert(i18next.t('general.validation.finite'))
    } else if (Decimal.lte(craftAmount, 0)) { // 0 or less selected
      return Alert(i18next.t('general.validation.zeroOrLess'))
    }

    // Get the smallest of hepteract limit, limit found above and specified input
    amountToCraft = Decimal.min(smallestItemLimit, hepteractLimit).min(heptCap).min(Decimal.sub(heptCap, this.BAL))

    if (max && player.toggles[35]) {
      const craftYesPlz = await Confirm(i18next.t('hepteracts.craftMax', {
        x: format(amountToCraft, 0, true),
        y: Decimal.floor(Decimal.div(amountToCraft, heptCap).mul(10000)).div(100)
      }))

      if (!craftYesPlz) {
        return Alert(i18next.t('hepteracts.cancelled'))
      }
    }

    this.BAL = Decimal.min(heptCap, Decimal.add(this.BAL, amountToCraft)).toNumber()

    // Subtract spent items from player
    player.wowAbyssals = player.wowAbyssals.sub(Decimal.mul(amountToCraft, this.HEPTERACT_CONVERSION).mul(craftCostMulti))

    if (player.wowAbyssals.lt(0)) {
      player.wowAbyssals = new Decimal(0)
    }

    for (const item of (Object.keys(this.OTHER_CONVERSIONS) as (keyof Player)[])) {
      if (typeof player[item] === 'number') {
        (player[item] as number) -= Decimal.mul(amountToCraft, craftCostMulti).mul(this.OTHER_CONVERSIONS[item]!).toNumber()
      }

      if ((player[item] as number) < 0) {
        (player[item] as number) = 0
      } else if (player[item] instanceof Cube) {
        (player[item] as Cube).sub(
          Decimal.mul(amountToCraft, craftCostMulti).mul(this.OTHER_CONVERSIONS[item]!)
        )
      } else if (item === 'worlds') {
        player.worlds.sub(Decimal.mul(amountToCraft, this.OTHER_CONVERSIONS[item]!))
      }
    }

    if (player.toggles[35]) {
      if (!max) {
        return Alert(i18next.t('hepteracts.craftedHepteracts', { x: format(amountToCraft, 0, true) }))
      }

      return Alert(i18next.t('hepteracts.craftedHepteractsMax', { x: format(amountToCraft, 0, true) }))
    }
  }

  // Reduce balance through spending
  spend (amount: DecimalSource): this {
    if (!this.UNLOCKED) {
      return this
    }

    this.BAL = Decimal.sub(this.BAL, amount)
    return this
  }

  // Expand your capacity
  /**
   * Expansion can only happen if your current balance is full.
   */
  expand = async (): Promise<HepteractCraft | void> => {
    const expandMultiplier = 2
    const currentBalance = this.BAL
    const heptCap = this.computeActualCap()
    const currHeptCapNoMulti = this.CAP

    if (!this.UNLOCKED) {
      return Alert(i18next.t('hepteracts.notUnlocked'))
    }

    // Below capacity
    if (this.BAL < this.CAP) {
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.notEnough'))
      } else {
        return
      }
    }

    const expandPrompt = await Confirm(i18next.t('hepteracts.expandPrompt', {
      x: format(this.CAP),
      y: format(heptCap),
      z: format(Decimal.mul(heptCap, expandMultiplier)),
      a: format(expandMultiplier, 2, true)
    }))

    if (!expandPrompt) {
      return this
    }

    // Avoid a double-expand exploit due to player waiting to confirm until after autocraft fires and expands
    if (this.BAL !== currentBalance || this.CAP !== currHeptCapNoMulti) {
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.doubleSpent'))
      } else {
        return
      }
    }

    // Empties inventory in exchange for doubling maximum capacity.
    this.BAL = Decimal.sub(this.BAL, this.CAP).max(0)

    this.CAP = Decimal.mul(this.CAP, expandMultiplier)

    if (player.toggles[35]) {
      return Alert(i18next.t('hepteracts.expandedInventory', {
        x: format(Decimal.mul(heptCap, expandMultiplier), 0, true)
      }))
    }
  }

  // Add some percentage points to your discount
  /**
   * Discount has boundaries [0, 1), and upper limit
   *  is defined by (1 - EPSILON). Craft amount is multiplied by 1 / (1 - Discount)
   * 
   * ! no, do not do this
   */
  addDiscount (amount: DecimalSource): this {
    this.DISCOUNT = Decimal.mul(this.DISCOUNT, Decimal.div(1, Decimal.sub(1, amount)))

    // If amount would put Discount to 1 or higher set to upper limit
    // if (this.DISCOUNT + amount > (1 - Number.EPSILON)) {
    //   this.DISCOUNT = 1 - Number.EPSILON
    //   return this
    // }

    // this.DISCOUNT += amount
    return this
  }

  toggleAutomatic (newValue?: boolean): Promise<void> | this {
    const HTML = DOMCacheGetOrSet(`${this.HTML_STRING}HepteractAuto`)

    // When newValue is empty, current value is toggled
    this.AUTO = newValue ?? !this.AUTO

    HTML.textContent = this.AUTO ? i18next.t('general.autoOnColon') : i18next.t('general.autoOffColon')
    HTML.style.border = `2px solid ${this.AUTO ? 'green' : 'red'}`

    return this
  }

  autoCraft (heptAmount: Decimal): this {
    const expandMultiplier = 2
    const craftCostMulti = calculateSingularityDebuff('Hepteract Costs')
    let heptCap = this.computeActualCap()

    // Calculate the largest craft amount possible, with an upper limit being craftAmount
    const hepteractLimitCraft = Decimal.floor(
      (Decimal.div(heptAmount, Decimal.mul(craftCostMulti, this.HEPTERACT_CONVERSION))).mul(this.DISCOUNT)
    )

    // Create an array of how many we can craft using our conversion limits for additional items
    const itemLimits: Decimal[] = []
    for (const item in this.OTHER_CONVERSIONS) {
      // When Auto is turned on, only Quarks and hepteracts are consumed.
      if (item === 'worlds') {
        itemLimits.push(
          Decimal.floor(Decimal.div(player[item as keyof Player] as Decimal, this.OTHER_CONVERSIONS[item as keyof Player]!)).mul(this.DISCOUNT)
        )
      }
    }

    // Get the smallest of the array we created [If Empty, this will be infinite]
    let smallestItemLimit = new Decimal(Number.POSITIVE_INFINITY)
    for (const i in itemLimits) {
      if (Decimal.lt(smallestItemLimit, itemLimits[i])) {
        smallestItemLimit = itemLimits[i]
      }
    }

    let amountToCraft = Decimal.min(smallestItemLimit, hepteractLimitCraft)
    let amountCrafted = new Decimal(0)

    let craft = Decimal.min(Decimal.sub(heptCap, this.BAL), amountToCraft) // Always nonzero
    this.BAL = Decimal.add(this.BAL, craft)
    amountCrafted = amountCrafted.add(craft)
    amountToCraft = amountToCraft.sub(craft)

    while (Decimal.gte(this.BAL, heptCap) && Decimal.gte(amountToCraft, this.CAP)) {
      this.BAL = Decimal.sub(this.BAL, this.CAP)
      this.CAP = Decimal.mul(this.CAP, expandMultiplier)
      heptCap = Decimal.mul(heptCap, expandMultiplier)
      craft = Decimal.min(Decimal.sub(heptCap, this.BAL), amountToCraft)

      this.BAL = Decimal.add(this.BAL, craft)
      amountCrafted = amountCrafted.add(craft)
      amountToCraft = amountToCraft.sub(craft)
    }

    for (const item in this.OTHER_CONVERSIONS) {
      if (item === 'worlds') {
        player.worlds.sub(Decimal.mul(amountCrafted, this.OTHER_CONVERSIONS[item]!).toNumber())
      }
    }

    player.wowAbyssals = player.wowAbyssals.sub(Decimal.mul(amountCrafted, craftCostMulti).mul(this.HEPTERACT_CONVERSION))
    if (player.wowAbyssals.lt(0)) {
      player.wowAbyssals = new Decimal(0)
    }

    return this
  }

  // Get balance of item
  get amount () {
    return this.BAL
  }
  get capacity () {
    return this.CAP
  }
  get discount () {
    return this.DISCOUNT
  }
}

const hepteractEffectiveValues = {
  chronos: {
    LIMIT: 1000,
    DR: 1 / 6
  },
  hyperrealism: {
    LIMIT: 1000,
    DR: 0.33
  },
  quark: {
    LIMIT: 1000,
    DR: 0.5
  },
  challenge: {
    LIMIT: 1000,
    DR: 1 / 6
  },
  abyss: {
    LIMIT: 1,
    DR: 0
  },
  accelerator: {
    LIMIT: 1000,
    DR: 0.2
  },
  acceleratorBoost: {
    LIMIT: 1000,
    DR: 0.2
  },
  multiplier: {
    LIMIT: 1000,
    DR: 0.2
  }
}

export const createHepteract = (data: IHepteractCraft) => {
  return new HepteractCraft(data)
}

export const hepteractEffective = (data: hepteractTypes) => {
  // let effectiveValue = Decimal.min(player.hepteractCrafts[data].BAL, hepteractEffectiveValues[data].LIMIT)
  let amt = player.hepteractCrafts[data].BAL
  let exponentBoost = new Decimal(0)
  if (data === 'chronos') {
    exponentBoost = Decimal.add(exponentBoost, 1 / 750 * player.platonicUpgrades[19])
  }
  if (data === 'quark') {
    exponentBoost = Decimal.add(exponentBoost, player.singularityUpgrades.singQuarkHepteract.getEffect().bonus)
    exponentBoost = Decimal.add(exponentBoost, player.singularityUpgrades.singQuarkHepteract2.getEffect().bonus)
    exponentBoost = Decimal.add(exponentBoost, player.singularityUpgrades.singQuarkHepteract3.getEffect().bonus)
    exponentBoost = Decimal.add(exponentBoost, player.octeractUpgrades.octeractImprovedQuarkHept.getEffect().bonus)
    exponentBoost = Decimal.add(exponentBoost, player.shopUpgrades.improveQuarkHept / 100)
    exponentBoost = Decimal.add(exponentBoost, player.shopUpgrades.improveQuarkHept2 / 100)
    exponentBoost = Decimal.add(exponentBoost, player.shopUpgrades.improveQuarkHept3 / 100)
    exponentBoost = Decimal.add(exponentBoost, player.shopUpgrades.improveQuarkHept4 / 100)
    exponentBoost = Decimal.add(exponentBoost, player.shopUpgrades.improveQuarkHept5 / 5000)

    // * what the hell is this
    // const amount = player.hepteractCrafts[data].BAL
    // if (1000 < amount && amount <= 1000 * Math.pow(2, 10)) {
    //   return effectiveValue * Math.pow(amount / 1000, 1 / 2 + exponentBoost)
    // } else if (1000 * Math.pow(2, 10) < amount && amount <= 1000 * Math.pow(2, 18)) {
    //   return effectiveValue * Math.pow(Math.pow(2, 10), 1 / 2 + exponentBoost)
    //     * Math.pow(amount / (1000 * Math.pow(2, 10)), 1 / 4 + exponentBoost / 2)
    // } else if (1000 * Math.pow(2, 18) < amount && amount <= 1000 * Math.pow(2, 44)) {
    //   return effectiveValue * Math.pow(Math.pow(2, 10), 1 / 2 + exponentBoost)
    //     * Math.pow(Math.pow(2, 8), 1 / 4 + exponentBoost / 2)
    //     * Math.pow(amount / (1000 * Math.pow(2, 18)), 1 / 6 + exponentBoost / 3)
    // } else if (1000 * Math.pow(2, 44) < amount) {
    //   return effectiveValue * Math.pow(Math.pow(2, 10), 1 / 2 + exponentBoost)
    //     * Math.pow(Math.pow(2, 8), 1 / 4 + exponentBoost / 2)
    //     * Math.pow(Math.pow(2, 26), 1 / 6 + exponentBoost / 3)
    //     * Math.pow(amount / (1000 * Math.pow(2, 44)), 1 / 12 + exponentBoost / 6)
    // }
    const pow = Decimal.div(3, Decimal.sub(1, exponentBoost).pow(3))
    amt = Decimal.div(amt, 1000).add(1).ln().div(pow).add(1).pow(pow).sub(1).mul(1000)
  }

  // if (player.hepteractCrafts[data].BAL > hepteractEffectiveValues[data].LIMIT) {
  //   effectiveValue *= Math.pow(
  //     player.hepteractCrafts[data].BAL / hepteractEffectiveValues[data].LIMIT,
  //     hepteractEffectiveValues[data].DR + exponentBoost
  //   )
  // }
  if (Decimal.gte(amt, hepteractEffectiveValues[data].LIMIT)) {
    amt = Decimal.div(amt, hepteractEffectiveValues[data].LIMIT).pow(Decimal.add(hepteractEffectiveValues[data].DR, exponentBoost)).mul(hepteractEffectiveValues[data].LIMIT)
  }

  return amt
}

export const hepteractDescriptions = (type: hepteractTypes) => {
  DOMCacheGetOrSet('hepteractUnlockedText').style.display = 'block'
  DOMCacheGetOrSet('hepteractCurrentEffectText').style.display = 'block'
  DOMCacheGetOrSet('hepteractBalanceText').style.display = 'block'
  DOMCacheGetOrSet('powderDayWarpText').style.display = 'none'
  DOMCacheGetOrSet('hepteractCostText').style.display = 'block'

  const unlockedText = DOMCacheGetOrSet('hepteractUnlockedText')
  const effectText = DOMCacheGetOrSet('hepteractEffectText')
  const currentEffectText = DOMCacheGetOrSet('hepteractCurrentEffectText')
  const balanceText = DOMCacheGetOrSet('hepteractBalanceText')
  const costText = DOMCacheGetOrSet('hepteractCostText')
  const bonusCapacityText = DOMCacheGetOrSet('hepteractBonusCapacity')
  const craftCostMulti = calculateSingularityDebuff('Hepteract Costs')

  const multiplier = Decimal.div(player.hepteractCrafts[type].computeActualCap(), player.hepteractCrafts[type].CAP)
  bonusCapacityText.textContent =
    Decimal.div(player.hepteractCrafts[type].computeActualCap(), player.hepteractCrafts[type].CAP).gt(1)
      ? `Hepteract capacities are currently multiplied by ${multiplier}. Expansions cost what they would if this multiplier were 1.`
      : ''
  let currentEffectRecord!: StringMap
  let oneCost!: string | Record<string, string>

  switch (type) {
    case 'chronos':
      currentEffectRecord = { x: format(Decimal.mul(hepteractEffective('chronos'), 0.06), 2, true) }
      oneCost = format(Decimal.mul(1e115, craftCostMulti), 0, false)

      break
    case 'hyperrealism':
      currentEffectRecord = { x: format(Decimal.mul(hepteractEffective('hyperrealism'), 0.06), 2, true) }
      oneCost = format(Decimal.mul(1e80, craftCostMulti), 0, true)
      break
    case 'quark':
      currentEffectRecord = { x: format(Decimal.mul(hepteractEffective('quark'), 0.05), 2, true) }
      oneCost = '100'
      break
    case 'challenge':
      currentEffectRecord = { x: format(Decimal.mul(hepteractEffective('challenge'), 0.05), 2, true) }
      oneCost = {
        y: format(Decimal.mul(1e11, craftCostMulti)),
        z: format(Decimal.mul(1e22, craftCostMulti))
      }
      break
    case 'abyss':
      oneCost = format(Decimal.mul(69, craftCostMulti))
      break
    case 'accelerator':
      currentEffectRecord = {
        x: format(Decimal.mul(hepteractEffective('accelerator'), 2000), 2, true),
        y: format(Decimal.mul(hepteractEffective('accelerator'), 0.03), 2, true)
      }
      oneCost = format(Decimal.mul(1e14, craftCostMulti))
      break
    case 'acceleratorBoost':
      currentEffectRecord = { x: format(Decimal.div(hepteractEffective('acceleratorBoost'), 10), 2, true) }
      oneCost = format(Decimal.mul(1e10, craftCostMulti))
      break
    case 'multiplier':
      currentEffectRecord = {
        x: format(Decimal.mul(hepteractEffective('multiplier'), 1000), 2, true),
        y: format(Decimal.mul(hepteractEffective('multiplier'), 0.03), 2, true)
      }
      oneCost = format(Decimal.mul(1e130, craftCostMulti))
      break
  }

  effectText.textContent = i18next.t(`wowCubes.hepteractForge.descriptions.${type}.effect`)
  currentEffectText.textContent = i18next.t(
    `wowCubes.hepteractForge.descriptions.${type}.currentEffect`,
    currentEffectRecord
  )
  balanceText.textContent = i18next.t('wowCubes.hepteractForge.inventory', {
    x: format(player.hepteractCrafts[type].BAL, 0, true),
    y: format(player.hepteractCrafts[type].computeActualCap(), 0, true)
  })
  const record = typeof oneCost === 'string' ? { y: oneCost } : oneCost
  costText.textContent = i18next.t(`wowCubes.hepteractForge.descriptions.${type}.oneCost`, {
    x: format(Decimal.mul(player.hepteractCrafts[type].HEPTERACT_CONVERSION, craftCostMulti), 0, true),
    ...record
  })

  unlockedText.textContent = player.hepteractCrafts[type].UNLOCKED
    ? i18next.t('wowCubes.hepteractForge.unlocked')
    : i18next.t('wowCubes.hepteractForge.locked')
}

/**
 * Generates the description at the bottom of the page for Overflux Orb crafting
 */
export const hepteractToOverfluxOrbDescription = () => {
  DOMCacheGetOrSet('hepteractUnlockedText').style.display = 'none'
  DOMCacheGetOrSet('powderDayWarpText').style.display = 'none'
  DOMCacheGetOrSet('hepteractCostText').style.display = 'block'

  DOMCacheGetOrSet('hepteractCurrentEffectText').textContent = i18next.t('hepteracts.orbEffect', {
    x: format(calculateCubeQuarkMultiplier().sub(1).mul(100), 2, true)
  })
  DOMCacheGetOrSet('hepteractBalanceText').textContent = i18next.t('hepteracts.orbsPurchasedToday', {
    x: format(player.overfluxOrbs, 0, true)
  })
  DOMCacheGetOrSet('hepteractEffectText').textContent = i18next.t('hepteracts.amalgamate')
  DOMCacheGetOrSet('hepteractCostText').textContent = i18next.t('hepteracts.cost250k')
}

/**
 * Trades Hepteracts for Overflux Orbs at 250,000 : 1 ratio. If null or invalid will gracefully terminate.
 * @returns Alert of either purchase failure or success
 */
export const tradeHepteractToOverfluxOrb = async (buyMax?: boolean) => {
  const maxBuy = Decimal.floor(player.wowAbyssals.div(250000))
  let toUse: Decimal

  if (buyMax) {
    if (player.toggles[35]) {
      const craftYesPlz = await Confirm(i18next.t('hepteracts.craftMaxOrbs', { x: format(maxBuy, 0, true) }))
      if (!craftYesPlz) {
        return Alert(i18next.t('hepteracts.cancelled'))
      }
    }
    toUse = maxBuy
  } else {
    const hepteractInput = await Prompt(i18next.t('hepteracts.hepteractInput', { x: format(maxBuy, 0, true) }))
    if (hepteractInput === null) {
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.cancelled'))
      } else {
        return
      }
    }

    toUse = new Decimal(Number(hepteractInput))
    if (
      Decimal.isNaN(toUse)
      || !Decimal.isFinite(toUse)
      || !(toUse.floor().eq(toUse))
      || toUse.lte(0)
    ) {
      return Alert(i18next.t('general.validation.invalidNumber'))
    }
  }

  const buyAmount = Decimal.min(maxBuy, Decimal.floor(toUse))
  const beforeEffect = calculateCubeQuarkMultiplier()
  player.overfluxOrbs = player.overfluxOrbs.add(buyAmount)
  player.wowAbyssals = player.wowAbyssals.sub(new Decimal(250000).mul(buyAmount))
  const afterEffect = calculateCubeQuarkMultiplier()

  if (player.wowAbyssals.lt(0)) {
    player.wowAbyssals = new Decimal(0)
  }

  const powderGain = Decimal.mul(calculatePowderConversion().mult, buyAmount).div(100).mul(player.shopUpgrades.powderAuto)
  player.overfluxPowder = player.overfluxPowder.add(powderGain)

  const powderText = (powderGain.gt(0)) ? i18next.t('hepteracts.gainedPowder', { x: format(powderGain, 2, true) }) : ''
  if (player.toggles[35]) {
    return Alert(i18next.t('hepteracts.purchasedOrbs', {
      x: format(buyAmount, 0, true),
      y: format(Decimal.sub(afterEffect, beforeEffect).mul(100), 2, true),
      z: powderText
    }))
  }
}

export const toggleAutoBuyOrbs = (newValue?: boolean, firstLoad = false) => {
  const HTML = DOMCacheGetOrSet('hepteractToQuarkTradeAuto')

  if (!firstLoad) {
    // When newValue is empty, current value is toggled
    player.overfluxOrbsAutoBuy = newValue ?? !player.overfluxOrbsAutoBuy
  }

  HTML.textContent = player.overfluxOrbsAutoBuy ? i18next.t('general.autoOnColon') : i18next.t('general.autoOffColon')
  HTML.style.border = `2px solid ${player.overfluxOrbsAutoBuy ? 'green' : 'red'}`
}

/**
 * Generates the description at the bottom of the page for Overflux Powder Properties
 */
export const overfluxPowderDescription = () => {
  let powderEffectText: string
  if (player.platonicUpgrades[16] > 0) {
    powderEffectText = i18next.t('hepteracts.allCubeGainExtended', {
      x: format(calculateCubeMultFromPowder().sub(1).mul(100), 2, true),
      y: format(calculateQuarkMultFromPowder().sub(1).mul(100), 3, true),
      z: format(Decimal.min(1, player.overfluxPowder.div(1e5)).mul(2).mul(player.platonicUpgrades[16]), 2, true),
      a: format(Decimal.pow(player.overfluxPowder.add(1), 10 * player.platonicUpgrades[16]))
    })
  } else {
    powderEffectText = i18next.t('hepteracts.allCubeGain', {
      x: format(calculateCubeMultFromPowder().sub(1).mul(100), 2, true),
      y: format(calculateQuarkMultFromPowder().sub(1).mul(100), 3, true)
    })
  }
  DOMCacheGetOrSet('hepteractUnlockedText').style.display = 'none'
  DOMCacheGetOrSet('hepteractCurrentEffectText').textContent = i18next.t('hepteracts.powderEffect', {
    x: powderEffectText
  })
  DOMCacheGetOrSet('hepteractBalanceText').textContent = i18next.t('hepteracts.powderLumps', {
    x: format(player.overfluxPowder, 2, true)
  })
  DOMCacheGetOrSet('hepteractEffectText').textContent = i18next.t('hepteracts.expiredOrbs', {
    x: format(calculatePowderConversion().mult.recip(), 1, true)
  })
  DOMCacheGetOrSet('hepteractCostText').style.display = 'none'

  DOMCacheGetOrSet('powderDayWarpText').style.display = 'block'
  DOMCacheGetOrSet('powderDayWarpText').textContent = i18next.t('hepteracts.dayWarpsRemaining', {
    x: player.dailyPowderResetUses
  })
}

/**
 * Attempts to operate a 'Day Reset' which, if successful, resets Daily Cube counters for the player.
 * Note by Platonic: kinda rushed job but idk if it can be improved.
 * @returns Alert, either for success or failure of warping
 */
export const overfluxPowderWarp = async (auto: boolean) => {
  if (!auto) {
    if (player.autoWarpCheck) {
      return Alert(i18next.t('hepteracts.warpImpossible'))
    }
    if (player.dailyPowderResetUses <= 0) {
      return Alert(i18next.t('hepteracts.machineCooldown'))
    }
    if (player.overfluxPowder.lt(25)) {
      return Alert(i18next.t('hepteracts.atleastPowder'))
    }
    const c = await Confirm(i18next.t('hepteracts.stumbleMachine'))
    if (!c) {
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.walkAwayMachine'))
      }
    } else {
      player.overfluxPowder = player.overfluxPowder.sub(25)
      player.dailyPowderResetUses -= 1
      forcedDailyReset()
      if (player.toggles[35]) {
        return Alert(i18next.t('hepteracts.useMachine'))
      }
    }
  } else {
    if (player.autoWarpCheck) {
      const a = await Confirm(i18next.t('hepteracts.useAllWarpsPrompt'))
      if (a) {
        DOMCacheGetOrSet('warpAuto').textContent = i18next.t('general.autoOffColon')
        DOMCacheGetOrSet('warpAuto').style.border = '2px solid red'
        player.autoWarpCheck = false
        player.dailyPowderResetUses = 0
        return Alert(i18next.t('hepteracts.machineCooldown'))
      } else {
        if (player.toggles[35]) {
          return Alert(i18next.t('hepteracts.machineDidNotConsume'))
        }
      }
    } else {
      const a = await Confirm(i18next.t('hepteracts.boostQuarksPrompt'))
      if (a) {
        DOMCacheGetOrSet('warpAuto').textContent = i18next.t('general.autoOnColon')
        DOMCacheGetOrSet('warpAuto').style.border = '2px solid green'
        player.autoWarpCheck = true
        if (player.dailyPowderResetUses === 0) {
          return Alert(i18next.t('hepteracts.machineOverdrive'))
        }
        return Alert(i18next.t('hepteracts.machineInOverdrive'))
      } else {
        if (player.toggles[35]) {
          return Alert(i18next.t('hepteracts.machineUsualContinue'))
        }
      }
    }
  }
}

/**
 * Get the HepteractCrafts which are unlocked and auto = ON
 * @returns Array of HepteractCraft
 */
export const getAutoHepteractCrafts = () => {
  const autoHepteracts: HepteractCraft[] = []
  for (const craftName of Object.keys(player.hepteractCrafts)) {
    const craftKey = craftName as keyof Player['hepteractCrafts']
    if (player.hepteractCrafts[craftKey].AUTO && player.hepteractCrafts[craftKey].UNLOCKED) {
      autoHepteracts.push(player.hepteractCrafts[craftKey])
    }
  }
  return autoHepteracts
}

// Hepteract of Chronos [UNLOCKED]
export const ChronosHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 1e4,
  OTHER_CONVERSIONS: { researchPoints: 1e115 },
  HTML_STRING: 'chronos',
  UNLOCKED: true
})

// Hepteract of Hyperrealism [UNLOCKED]
export const HyperrealismHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 1e4,
  OTHER_CONVERSIONS: { runeshards: 1e80 },
  HTML_STRING: 'hyperrealism',
  UNLOCKED: true
})

// Hepteract of Too Many Quarks [UNLOCKED]
export const QuarkHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 1e4,
  OTHER_CONVERSIONS: { worlds: 100 },
  HTML_STRING: 'quark',
  UNLOCKED: true
})

// Hepteract of Challenge [LOCKED]
export const ChallengeHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 5e4,
  OTHER_CONVERSIONS: { wowPlatonicCubes: 1e11, wowCubes: 1e22 },
  HTML_STRING: 'challenge'
})

// Hepteract of The Abyssal [LOCKED]
export const AbyssHepteract = new HepteractCraft({
  BASE_CAP: 1,
  HEPTERACT_CONVERSION: 1e8,
  OTHER_CONVERSIONS: { wowCubes: 69 },
  HTML_STRING: 'abyss'
})

// Hepteract of Too Many Accelerator [LOCKED]
export const AcceleratorHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 1e5,
  OTHER_CONVERSIONS: { wowTesseracts: 1e14 },
  HTML_STRING: 'accelerator'
})

// Hepteract of Too Many Accelerator Boost [LOCKED]
export const AcceleratorBoostHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 2e5,
  OTHER_CONVERSIONS: { wowHypercubes: 1e10 },
  HTML_STRING: 'acceleratorBoost'
})

// Hepteract of Too Many Multiplier [LOCKED]
export const MultiplierHepteract = new HepteractCraft({
  BASE_CAP: 1000,
  HEPTERACT_CONVERSION: 3e5,
  OTHER_CONVERSIONS: { researchPoints: 1e130 },
  HTML_STRING: 'multiplier'
})
