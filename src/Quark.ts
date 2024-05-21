/* Functions which Handle Quark Gains,  */

import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateCubeQuarkMultiplier, calculateQuarkMultiplier } from './Calculate'
import { format, player } from './Synergism'
import { Alert } from './UpdateHTML'
import Decimal from "break_eternity.js";

const getBonus = async (): Promise<null | number | Decimal> => {
  if (!navigator.onLine) {
    return null
  }
  if (document.visibilityState === 'hidden') {
    return null
  }

  try {
    const r = await fetch('https://synergism-quarks.khafra.workers.dev/')
    const j = await r.json() as { bonus: number | Decimal }

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
    const b = new Decimal(t.files['SynergismQuarkBoost.txt'].content)

    return b
  } catch (e) {
    console.log(`GitHub Gist: ${(e as Error).message}`)
  }

  return null
}

export const quarkHandler = () => {
  let maxTime = 90000 // In Seconds
  if (player.researches[195] > 0) {
    maxTime += 18000 * player.researches[195] // Research 8x20
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
  const capacity = Math.floor(quarkPerHour * maxTime / 3600)

  // Part 4: Calculate how many quarks are to be gained.
  const quarkGain = Math.floor(player.quarkstimer * quarkPerHour / 3600)

  // Part 5 [June 9, 2021]: Calculate bonus awarded to cube quarks.
  const cubeMult = calculateCubeQuarkMultiplier()
  // Return maxTime, quarkPerHour, capacity and quarkGain as object
  return {
    maxTime,
    perHour: new Decimal(quarkPerHour),
    capacity,
    gain: new Decimal(quarkGain),
    cubeMult
  }
}

export class QuarkHandler {
  /** Global quark bonus */
  public BONUS = new Decimal(0)
  /** Quark amount */
  private QUARKS = new Decimal(0)

  private interval: ReturnType<typeof setInterval> | null = null

  constructor ({ bonus, quarks }: { bonus?: number | Decimal; quarks: number | Decimal }) {
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
  applyBonus (amount: number | Decimal) {
    const nonPatreon = calculateQuarkMultiplier()
    return Decimal.mul(amount, this.BONUS.div(100).add(1)).mul(nonPatreon)
  }

  /** Subtracts quarks, as the name suggests. */
  add (amount: number | Decimal, useBonus = true) {
    this.QUARKS = this.QUARKS.add(useBonus ? this.applyBonus(amount) : amount)
    player.quarksThisSingularity = player.quarksThisSingularity.add(useBonus ? this.applyBonus(amount) : amount)
    return this
  }

  /** Add quarks, as suggested by the function's name. */
  sub (amount: number | Decimal) {
    this.QUARKS = this.QUARKS.sub(amount)
    if (Decimal.lt(this.QUARKS, 0)) {
      this.QUARKS = new Decimal(0)
    }

    return this
  }

  async getBonus () {
    const el = DOMCacheGetOrSet('currentBonus')

    if (location.hostname === 'synergism.cc') {
      return
    }

    if (localStorage.getItem('quarkBonus') !== null) { // is in cache
      const { bonus, fetched } = JSON.parse(localStorage.getItem('quarkBonus')!) as { bonus: number | Decimal; fetched: number }
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
    } else if (Decimal.isNaN(b) || typeof b !== 'number') {
      return Alert('No bonus could be applied, a network error occurred! [Invalid Bonus] :(')
    } else if (!Decimal.isFinite(b)) {
      return Alert('No bonus could be applied, an error occurred. [Infinity] :(')
    } else if (Decimal.lt(b, 0)) {
      return Alert('No bonus could be applied, an error occurred. [Zero] :(')
    }

    el.textContent = `Generous patrons give you a bonus of ${format(b)}% more Quarks!`
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
