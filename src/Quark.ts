/* Functions which Handle Quark Gains,  */

import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateCubeQuarkMultiplier, calculateQuarkMultiplier } from './Calculate'
import { format, player } from './Synergism'
import { Alert } from './UpdateHTML'
import Decimal, { type DecimalSource } from 'break_eternity.js'


const getBonus = async (): Promise<null | DecimalSource> => {
  if (!navigator.onLine) {
    return null
  }
  if (document.visibilityState === 'hidden') {
    return null
  }

  try {
    const r = await fetch('https://synergism-quarks.khafra.workers.dev/')
    const j = await r.json() as { bonus: DecimalSource }

    return j.bonus
  } catch (e) {
    console.log(`workers.dev: ${(e as Error).message}`)
  }

  try {
    const r = await fetch('https://api.github.com/gists/44be6ad2dcf0d44d6a29dffe1d66a84a', {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })

    const t = await r.json() as { files: Record<string, { content: string }> }
    const b = Number(t.files['SynergismQuarkBoost.txt'].content)

    return b
  } catch (e) {
    console.log(`GitHub Gist: ${(e as Error).message}`)
  }

  return null
}

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

export class QuarkHandler {
  /** Global quark bonus */
  public BONUS = new Decimal(0)
  /** Quark amount */
  public QUARKS = new Decimal(0)

  private interval: ReturnType<typeof setInterval> | null = null

  constructor ({ bonus, quarks }: { bonus?: DecimalSource; quarks: DecimalSource }) {
    this.QUARKS = new Decimal(quarks)

    if (bonus) {
      this.BONUS = new Decimal(bonus)
    } else {
      void this.getBonus()
    }

    if (this.interval) clearInterval(this.interval)

    // although the values are cached for 15 mins, refresh every 5
    this.interval = setInterval(this.getBonus.bind(this), 60 * 1000 * 5)
  }

  /*** Calculates the number of quarks to give with the current bonus. */
  applyBonus (amount: DecimalSource) {
    const nonPatreon = calculateQuarkMultiplier()
    return Decimal.mul(amount, Decimal.div(this.BONUS, 100).add(1)).mul(nonPatreon)
  }

  /** Subtracts quarks, as the name suggests. */
  add (amount: DecimalSource, useBonus = true) {
    this.QUARKS = this.QUARKS.add(useBonus ? this.applyBonus(amount) : amount)
    player.quarksThisSingularity = Decimal.add(player.quarksThisSingularity, useBonus ? this.applyBonus(amount) : amount)
    return this
  }

  /** Add quarks, as suggested by the function's name. */
  sub (amount: DecimalSource) {
    this.QUARKS = Decimal.sub(this.QUARKS, amount).max(0)

    return this
  }

  async getBonus () {
    const el = DOMCacheGetOrSet('currentBonus')

    if (location.hostname === 'synergism.cc') {
      return
    }

    if (localStorage.getItem('quarkBonus') !== null) { // is in cache
      const { bonus, fetched } = JSON.parse(localStorage.getItem('quarkBonus')!) as { bonus: DecimalSource; fetched: number }
      if (Date.now() - fetched < 60 * 1000 * 15) { // cache is younger than 15 minutes
        el.textContent = `Generous patrons give you a bonus of ${bonus}% more Quarks!`
        return this.BONUS = new Decimal(bonus)
      }
    } else if (!navigator.onLine) {
      return el.textContent = 'Current Bonus: N/A% (offline)!'
    } else if (document.hidden) {
      return el.textContent = 'Current Bonus: N/A% (unfocused)!'
    }

    const b = await getBonus()

    if (b === null) {
      return
    } else if (Number.isNaN(b) || typeof b !== 'number') {
      return Alert('No bonus could be applied, a network error occurred! [Invalid Bonus] :(')
    } else if (!Number.isFinite(b)) {
      return Alert('No bonus could be applied, an error occurred. [Infinity] :(')
    } else if (b < 0) {
      return Alert('No bonus could be applied, an error occurred. [Zero] :(')
    }

    el.textContent = `Generous patrons give you a bonus of ${b}% more Quarks!`
    localStorage.setItem('quarkBonus', JSON.stringify({ bonus: b, fetched: Date.now() }))
    this.BONUS = new Decimal(b)
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
