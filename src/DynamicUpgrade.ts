import i18next from 'i18next'
import { format } from './Synergism'
import { Alert, Prompt } from './UpdateHTML'
import Decimal from "break_eternity.js";

export interface IUpgradeData {
  name: string
  description: string
  level?: Decimal
  maxLevel: Decimal
  costPerLevel: Decimal
  toggleBuy?: number
  effect?(this: void, n: Decimal): { bonus: Decimal; desc: string }
  freeLevels?: Decimal
}

export abstract class DynamicUpgrade {
  public name: string
  readonly description: string
  public level = new Decimal(0)
  public freeLevels = new Decimal(0)
  readonly maxLevel: Decimal // -1 = infinitely levelable
  readonly costPerLevel: Decimal
  public toggleBuy = 1 // -1 = buy MAX (or 1000 in case of infinity levels!)
  readonly effect: (n: Decimal) => { bonus: Decimal; desc: string }

  constructor (data: IUpgradeData) {
    this.name = data.name
    this.description = data.description
    this.level = data.level ?? new Decimal(0)
    this.freeLevels = data.freeLevels ?? new Decimal(0)
    this.maxLevel = data.maxLevel
    this.costPerLevel = data.costPerLevel
    this.toggleBuy = data.toggleBuy ?? 1
    this.effect = data.effect ?? ((n: Decimal) => ({ bonus: n, desc: 'WIP not implemented' }))
  }

  public async changeToggle (): Promise<void> {
    // Is null unless given an explicit number
    const newToggle = await Prompt(i18next.t('dynamicUpgrades.validation.setPurchaseAmount', { x: this.name }))
    const newToggleAmount = Number(newToggle)

    if (newToggle === null) {
      return Alert(i18next.t('dynamicUpgrades.validation.toggleKept', { x: format(this.toggleBuy) }))
    }

    if (!Number.isInteger(newToggle)) {
      return Alert(i18next.t('general.validation.fraction'))
    }
    if (newToggleAmount < -1) {
      return Alert(i18next.t('dynamicUpgrades.validation.onlyNegativeOne'))
    }
    if (newToggleAmount === 0) {
      return Alert(i18next.t('dynamicUpgrades.validation.notZero'))
    }

    this.toggleBuy = newToggleAmount
    const m = newToggleAmount === -1
      ? i18next.t('dynamicUpgrades.toggleMax')
      : i18next.t('dynamicUpgrades.toggle', { x: format(this.toggleBuy) })

    return Alert(m)
  }

  public getEffect (): { bonus: Decimal; desc: string } {
    const effectiveLevel = Decimal.add(this.level, Decimal.min(this.level, this.freeLevels)).add(Decimal.sqrt(Decimal.max(0, Decimal.sub(this.freeLevels, this.level))))
    return this.effect(effectiveLevel)
  }

  abstract toString (): string
  abstract updateUpgradeHTML (): void
  abstract getCostTNL (): number
  public abstract buyLevel (event: MouseEvent): Promise<void> | void
}
