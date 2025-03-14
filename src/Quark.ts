import Decimal, { type DecimalSource } from 'break_eternity.js'
import { calculateCubeQuarkMultiplier, calculateQuarkMultiplier } from './Calculate'
import { format, player } from './Synergism'

export const quarkHandler = () => {
  let maxTime = new Decimal(90000) // In Seconds
  if (player.researches[195] > 0) {
    maxTime = maxTime.add(18000 * player.researches[195]) // Research 8x20
  }

  // Part 2: Calculate quark gain per hour
  let baseQuarkPerHour = 5

  const quarkResearches = [99, 100, 125, 180, 195]
  for (const el of quarkResearches) {
    baseQuarkPerHour += player.researches[el]
  }

  baseQuarkPerHour *= +player.octeractUpgrades.octeractExportQuarks.getEffect().bonus

  const quarkPerHour = baseQuarkPerHour

  // Part 3: Calculates capacity of quarks on export
  const capacity = Decimal.floor(Decimal.mul(quarkPerHour, maxTime).div(3600))

  // Part 4: Calculate how many quarks are to be gained.
  const quarkGain = Decimal.floor(Decimal.mul(player.quarkstimer, quarkPerHour).div(3600))

  // Part 5 [June 9, 2021]: Calculate bonus awarded to cube quarks.
  const cubeMult = calculateCubeQuarkMultiplier()
  // Return maxTime, quarkPerHour, capacity and quarkGain as object
  return {
    maxTime,
    perHour: quarkPerHour,
    capacity,
    gain: quarkGain,
    cubeMult
  }
}

let bonus = new Decimal(0)

export const setQuarkBonus = (newBonus: DecimalSource) => bonus = new Decimal(newBonus)
export const getQuarkBonus = () => bonus

export class QuarkHandler {
  /** Quark amount */
  public QUARKS = new Decimal(0)

  constructor (quarks: DecimalSource) {
    this.QUARKS = new Decimal(quarks)
  }

  /*** Calculates the number of quarks to give with the current bonus. */
  applyBonus (amount: DecimalSource) {
    const nonPatreon = calculateQuarkMultiplier()
    return Decimal.mul(amount, Decimal.div(getQuarkBonus(), 100).add(1)).mul(nonPatreon)
  }

  /** Subtracts quarks, as the name suggests. */
  add (amount: DecimalSource, useBonus = true) {
    this.QUARKS = this.QUARKS.add(useBonus ? this.applyBonus(amount) : amount)
    player.quarksThisSingularity = Decimal.add(
      player.quarksThisSingularity,
      useBonus ? this.applyBonus(amount) : amount
    )
    return this
  }

  /** Add quarks, as suggested by the function's name. */
  sub (amount: DecimalSource) {
    this.QUARKS = Decimal.sub(this.QUARKS, amount).max(0)

    return this
  }

  public toString (val: number | Decimal): string {
    return format(Decimal.floor(this.applyBonus(val)), 0, true)
  }

  /**
   * Resets the amount of quarks saved but keeps the bonus amount.
   */
  public reset () {
    this.QUARKS = new Decimal(0)
  }

  [Symbol.toPrimitive] = (t: string) => t === 'number' ? this.QUARKS : null
}
