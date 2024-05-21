import i18next from 'i18next'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { octeractGainPerSecond, scale } from './Calculate'
import type { IUpgradeData } from './DynamicUpgrade'
import { DynamicUpgrade } from './DynamicUpgrade'
import { format, formatTimeShort, player } from './Synergism'
import type { Player } from './types/Synergism'
import { Alert, Prompt } from './UpdateHTML'
import Decimal from "break_eternity.js";

export interface IOcteractData extends Omit<IUpgradeData, 'name' | 'description'> {
  costFormula(this: void, level: Decimal, baseCost: Decimal): Decimal
  target(this: void, level: Decimal, baseCost: Decimal): Decimal
  cacheUpdates?: (() => void)[] // TODO: Improve this type signature -Plat
  octeractsInvested?: number
  qualityOfLife?: boolean
}

export class OcteractUpgrade extends DynamicUpgrade {
  readonly costFormula: (level: Decimal, baseCost: Decimal) => Decimal
  readonly target: (level: Decimal, baseCost: Decimal) => Decimal
  public octeractsInvested = 0
  public qualityOfLife: boolean
  readonly cacheUpdates: (() => void)[] | undefined

  constructor (data: IOcteractData, key: string) {
    const name = i18next.t(`octeract.data.${key}.name`)
    const description = i18next.t(`octeract.data.${key}.description`)
    super({ ...data, name, description })
    this.costFormula = data.costFormula
    this.target = data.target
    this.octeractsInvested = data.octeractsInvested ?? 0
    this.qualityOfLife = data.qualityOfLife ?? false
    this.cacheUpdates = data.cacheUpdates ?? undefined
  }

  getCostTNL(): Decimal {
    if (this.level === this.maxLevel) {
      return new Decimal(0)
    }

    return this.costFormula(this.level, this.costPerLevel)
}

  /**
   * Buy levels up until togglebuy or maxed.
   * @returns An alert indicating cannot afford, already maxed or purchased with how many
   *          levels purchased
   */
  public async buyLevel (event: MouseEvent): Promise<void> {
    let purchased = 0
    let maxPurchasable = new Decimal(1)
    let OCTBudget = new Decimal(player.wowOcteracts)

    if (event.shiftKey) {
      maxPurchasable = new Decimal(1000000)
      const buy = new Decimal(Number(
        await Prompt(`${i18next.t('octeract.buyLevel.buyPrompt', { n: format(player.wowOcteracts, 0, true) })}`)
      ))

      if (Decimal.isNaN(buy) || !Decimal.isFinite(buy) || !Number.isInteger(buy)) { // nan + Infinity checks
        return Alert(i18next.t('general.validation.finite'))
      }

      if (buy.eq(-1)) {
        OCTBudget = new Decimal(player.wowOcteracts)
      } else if (buy.lte(0)) {
        return Alert(i18next.t('octeract.buyLevel.cancelPurchase'))
      } else {
        OCTBudget = buy
      }
      OCTBudget = Decimal.min(player.wowOcteracts, OCTBudget)
    }

    if (this.maxLevel.gt(0)) {
      maxPurchasable = Decimal.min(maxPurchasable, Decimal.sub(this.maxLevel, this.level))
    }

    if (maxPurchasable.eq(0)) {
      return Alert(i18next.t('octeract.buyLevel.alreadyMax'))
    }

    while (maxPurchasable.gt(0)) {
      const cost = this.getCostTNL()
      if (player.wowOcteracts.toLocaleString(cost) || OCTBudget.lt(cost)) {
        break
      } else {
        player.wowOcteracts = player.wowOcteracts.sub(cost)
        OCTBudget = OCTBudget.sub(cost)
        this.octeractsInvested = this.octeractsInvested.add(cost)
        this.level = this.level.add(1)
        purchased += 1
        maxPurchasable = maxPurchasable.sub(1)
      }
    }

    if (purchased === 0) {
      return Alert(i18next.t('octeract.buyLevel.cannotAfford'))
    }
    if (purchased > 1) {
      return Alert(`${i18next.t('octeract.buyLevel.multiBuy', { n: format(purchased) })}`)
    }

    if (this.name === player.octeractUpgrades.octeractAmbrosiaLuck.name) {
      player.caches.ambrosiaLuck.updateVal('OcteractBerries')
    }

    this.updateCaches()
    this.updateUpgradeHTML()
  }

  /**
   * Given an upgrade, give a concise information regarding its data.
   * @returns A string that details the name, description, level statistic, and next level cost.
   */
  toString (): string {
    const costNextLevel = this.getCostTNL()
    const maxLevel = this.maxLevel.eq(-1)
      ? ''
      : `/${format(this.maxLevel, 0, true)}`
    const isMaxLevel = this.maxLevel === this.level
    const color = isMaxLevel ? 'plum' : 'white'

    let freeLevelInfo = this.freeLevels.gt(0)
      ? `<span style="color: orange"> [+${format(this.freeLevels, 1, true)}]</span>`
      : ''

    if (this.freeLevels > this.level) {
      freeLevelInfo = `${freeLevelInfo}<span style="color: var(--maroon-text-color)">${
        i18next.t('general.softCapped')
      }</span>`
    }

    const isAffordable = costNextLevel.lte(player.wowOcteracts)
    let affordTime = ''
    if (!isMaxLevel && !isAffordable) {
      const octPerSecond = octeractGainPerSecond()
      affordTime = octPerSecond.gt(0)
        ? formatTimeShort(Decimal.sub(costNextLevel, player.wowOcteracts).div(octPerSecond))
        : `${i18next.t('general.infinity')}`
    }
    const affordableInfo = isMaxLevel
      ? `<span style="color: plum"> ${i18next.t('general.maxed')}</span>`
      : isAffordable
      ? `<span style="color: var(--green-text-color)"> ${i18next.t('general.affordable')}</span>`
      : `<span style="color: yellow"> ${i18next.t('octeract.toString.becomeAffordable', { n: affordTime })}</span>`

    return `<span style="color: gold">${this.name}</span>
                <span style="color: lightblue">${this.description}</span>
                <span style="color: ${color}"> ${i18next.t('general.level')} ${
      format(this.level, 0, true)
    }${maxLevel}${freeLevelInfo}</span>
                <span style="color: gold">${this.getEffect().desc}</span>
                ${i18next.t('octeract.toString.costNextLevel')} ${
      format(costNextLevel, 2, true)
    } Octeracts${affordableInfo}
                ${i18next.t('general.spent')} Octeracts: ${format(this.octeractsInvested, 2, true)}`
  }

  public updateUpgradeHTML (): void {
    DOMCacheGetOrSet('singularityOcteractsMultiline').innerHTML = this.toString()
    DOMCacheGetOrSet('octeractAmount').innerHTML = i18next.t('octeract.amount', {
      octeracts: format(player.wowOcteracts, 2, true)
    })
  }

  public computeFreeLevelSoftcap (): Decimal {
    return Decimal.min(this.level, this.freeLevels).add(Decimal.sqrt(Decimal.max(0, Decimal.sub(this.freeLevels, this.level))))
  }

  public actualTotalLevels (): Decimal {
    if (player.singularityChallenges.noOcteracts.enabled && !this.qualityOfLife) {
      return new Decimal(0)
    }
    const actualFreeLevels = this.computeFreeLevelSoftcap()
    const linearLevels = Decimal.add(this.level, actualFreeLevels)
    return linearLevels // There is currently no 'improvement' to oct free upgrades.
  }

  public getEffect (): { bonus: Decimal; desc: string } {
    return this.effect(this.actualTotalLevels())
  }

  public refund (): void {
    player.wowOcteracts += this.octeractsInvested
    this.level = new Decimal(0)
    this.octeractsInvested = 0
  }

  updateCaches (): void {
    if (this.cacheUpdates !== undefined) {
      for (const cache of this.cacheUpdates) {
        cache()
      }
    }
  }
}

// all targets are based on level
export const octeractData: Record<keyof Player['octeractUpgrades'], IOcteractData> = {
  octeractStarter: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).mul(baseCost)
      // y = a(x+1)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1)
    },
    maxLevel: new Decimal(1),
    costPerLevel: new Decimal(1e-15),
    effect: (n: Decimal) => {
      return {
        bonus: n.gt(0) ? new Decimal(1) : new Decimal(0),
        get desc () {
          return i18next.t('octeract.data.octeractStarter.effect', { n: (n.gt(0)) ? '' : 'not' })
        }
      }
    }
  },
  octeractGain: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.pow(5.5).sub(1).mul(1.3).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1).div(1.3).add(1).root(5.5)
    },
    maxLevel: new Decimal(1e8),
    costPerLevel: new Decimal(1e-8),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.011).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractGain.effect', { n: format(n, 0, true) })
        }
      }
    }
  },
  octeractGain2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level.sqrt().div(3)).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log10().mul(3).pow(2)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e10),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.01).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractGain2.effect', { n: format(n, 0, true) })
        }
      }
    }
  },
  octeractQuarkGain: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      let i = level
      i = scale(i, 0.2, false, new Decimal(10000), new Decimal(1), new Decimal(2))
      i = scale(i, 1.1, false, new Decimal(1000), new Decimal(1), new Decimal(2))
      return i.add(1).pow(6.15).sub(1).mul(2).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      let i = amt.div(baseCost).sub(1).div(2).add(1).root(6.15).sub(1)
      i = scale(i, 1.1, true, new Decimal(1000), new Decimal(1), new Decimal(2))
      i = scale(i, 0.2, true, new Decimal(10000), new Decimal(1), new Decimal(2))
      return i
    },
    maxLevel: new Decimal(20000),
    costPerLevel: new Decimal(1e-7),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.011).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractQuarkGain.effect', { n: format(n.mul(1.1), 0, true) })
        }
      }
    }
  },
  octeractQuarkGain2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e20, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e20)
    },
    maxLevel: new Decimal(5),
    costPerLevel: new Decimal(1e22),
    effect: (n: Decimal) => {
      return {
        bonus: n.gt(0) ? new Decimal(1) : new Decimal(0),
        get desc () {
          return i18next.t('octeract.data.octeractQuarkGain2.effect', { n: n.gt(0) ? '' : 'NOT' })
        }
      }
    }
  },
  octeractCorruption: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e10, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e10)
    },
    maxLevel: new Decimal(2),
    costPerLevel: new Decimal(10),
    effect: (n: Decimal) => {
      return {
        bonus: n,
        get desc () {
          return i18next.t('octeract.data.octeractCorruption.effect', { n })
        }
      }
    }
  },
  octeractGQCostReduce: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(2, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log2()
    },
    maxLevel: new Decimal(50),
    costPerLevel: new Decimal(1e-9),
    effect: (n: Decimal) => {
      return {
        bonus: Decimal.sub(1, n.div(100)),
        get desc () {
          return i18next.t('octeract.data.octeractGQCostReduce.effect', { n })
        }
      }
    }
  },
  octeractExportQuarks: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).cbrt().sub(1)
    },
    maxLevel: new Decimal(100),
    costPerLevel: new Decimal(1),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.4).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractExportQuarks.effect', { n: format(n.mul(40), 0, true) })
        }
      }
    }
  },
  octeractImprovedDaily: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1.6, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1.6)
    },
    maxLevel: new Decimal(50),
    costPerLevel: new Decimal(1e-3),
    effect: (n: Decimal) => {
      return {
        bonus: n,
        get desc () {
          return i18next.t('octeract.data.octeractImprovedDaily.effect', { n })
        }
      }
    },
    qualityOfLife: true
  },
  octeractImprovedDaily2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(2, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log2()
    },
    maxLevel: new Decimal(50),
    costPerLevel: new Decimal(1e-2),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.01).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedDaily2.effect', { n })
        }
      }
    },
    qualityOfLife: true
  },
  octeractImprovedDaily3: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(20, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(20)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e20),
    effect: (n: Decimal) => {
      return {
        bonus: n,
        get desc () {
          return i18next.t('octeract.data.octeractImprovedDaily3.effect', { n: `${n} +${n.mul(0.5)}%` })
        }
      }
    },
    qualityOfLife: true
  },
  octeractImprovedQuarkHept: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e6, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e6)
    },
    maxLevel: new Decimal(3),
    costPerLevel: new Decimal(0.1),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedQuarkHept.effect', { n: format(n.div(100), 2, true) })
        }
      }
    }
  },
  octeractImprovedGlobalSpeed: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).root(3).sub(1)
    },
    maxLevel: new Decimal(1000),
    costPerLevel: new Decimal(1e-5),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedGlobalSpeed.effect', { n: format(n, 0, true) })
        }
      }
    }
  },
  octeractImprovedAscensionSpeed: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e9, level.div(100)).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e9).mul(100)
    },
    maxLevel: new Decimal(100),
    costPerLevel: new Decimal(100),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(2000),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedAscensionSpeed.effect', { n: format(n.div(20), 2, true) })
        }
      }
    }
  },
  octeractImprovedAscensionSpeed2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e12, level.div(250)).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e12).mul(250)
    },
    maxLevel: new Decimal(250),
    costPerLevel: new Decimal(1e5),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(2000),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedAscensionSpeed2.effect', { n: format(n.div(50), 2, true) })
        }
      }
    }
  },
  octeractImprovedFree: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).cbrt().sub(1)
    },
    maxLevel: new Decimal(1),
    costPerLevel: new Decimal(100),
    effect: (n: Decimal) => {
      return {
        bonus: n.gt(0) ? new Decimal(1) : new Decimal(0),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedFree.effect', { n: (n.gt(0)) ? '' : 'NOT' })
        }
      }
    }
  },
  octeractImprovedFree2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).cbrt().sub(1)
    },
    maxLevel: new Decimal(1),
    costPerLevel: new Decimal(1e7),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.05),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedFree2.effect', { n: format(n.mul(0.05), 2, true) })
        }
      }
    }
  },
  octeractImprovedFree3: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).cbrt().sub(1)
    },
    maxLevel: new Decimal(1),
    costPerLevel: new Decimal(1e17),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.05),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedFree3.effect', { n: format(n.mul(0.05), 2, true) })
        }
      }
    }
  },
  octeractImprovedFree4: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e20, level.div(40)).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e20).mul(40)
    },
    maxLevel: new Decimal(40),
    costPerLevel: new Decimal(1e20),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.001).add((n.gt(0)) ? 0.01 : 0),
        get desc () {
          return i18next.t('octeract.data.octeractImprovedFree4.effect', {
            n: format(n.mul(0.001).add((n.gt(0)) ? 0.01 : 0), 3, true)
          })
        }
      }
    }
  },
  octeractSingUpgradeCap: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e3, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e3)
    },
    maxLevel: new Decimal(10),
    costPerLevel: new Decimal(1e10),
    effect: (n: Decimal) => {
      return {
        bonus: n,
        get desc () {
          return i18next.t('octeract.data.octeractSingUpgradeCap.effect', { n })
        }
      }
    },
    qualityOfLife: true
  },
  octeractOfferings1: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      let i = level.add(1).pow(5).mul(baseCost)
      i = scale(i, 1.1, false, new Decimal(25), new Decimal(1), new Decimal(10))
      return i
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      let i = amt.div(baseCost).root(5).sub(1)
      i = scale(i, 1.1, true, new Decimal(25), new Decimal(1), new Decimal(10))
      return i
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e-15),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.01).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractOfferings1.effect', { n: format(n) })
        }
      }
    }
  },
  octeractObtainium1: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      let i = level.add(1).pow(5).mul(baseCost)
      i = scale(i, 1.1, false, new Decimal(25), new Decimal(1), new Decimal(10))
      return i
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      let i = amt.div(baseCost).root(5).sub(1)
      i = scale(i, 1.1, true, new Decimal(25), new Decimal(1), new Decimal(10))
      return i
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e-15),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.01).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractObtainium1.effect', { n: format(n) })
        }
      }
    }
  },
  octeractAscensions: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(3).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).cbrt().sub(1)
    },
    maxLevel: new Decimal(1000000),
    costPerLevel: new Decimal(1),
    effect: (n: Decimal) => {
      return {
        bonus: Decimal.mul(n.div(100).add(1), Decimal.floor(n.div(10).floor()).mul(0.02).add(1)),
        get desc () {
          return i18next.t('octeract.data.octeractAscensions.effect', {
            n: format(this.bonus.sub(1).mul(100), 1, true)
          })
        }
      }
    }
  },
  octeractAscensions2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level.sqrt().div(3)).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log10().mul(3).pow(2)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e12),
    effect: (n: Decimal) => {
      return {
        bonus: Decimal.mul(n.div(100).add(1), Decimal.floor(n.div(10).floor()).mul(0.02).add(1)),
        get desc () {
          return i18next.t('octeract.data.octeractAscensions2.effect', {
            n: format(this.bonus.sub(1).mul(100), 1, true)
          })
        }
      }
    }
  },
  octeractAscensionsOcteractGain: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(40, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(40)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1000),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100),
        get desc () {
          return i18next.t('octeract.data.octeractAscensionsOcteractGain.effect', { n: format(n, 1, true) })
        }
      }
    }
  },
  octeractFastForward: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(1e8, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(1e8)
    },
    maxLevel: new Decimal(2),
    costPerLevel: new Decimal(1e8),
    effect: (n: Decimal) => {
      return {
        bonus: n,
        get desc () {
          return i18next.t('octeract.data.octeractFastForward.effect', { n100: n.mul(100), n })
        }
      }
    }
  },
  octeractAutoPotionSpeed: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(10)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1e-10),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(0.04).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAutoPotionSpeed.effect', { n: n.mul(4) })
        }
      }
    }
  },
  octeractAutoPotionEfficiency: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(10)
    },
    maxLevel: new Decimal(100),
    costPerLevel: new Decimal(3.16e-10),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(50).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAutoPotionEfficiency.effect', { n: n.mul(2) })
        }
      }
    }
  },
  octeractOneMindImprover: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      let i = level
      i = scale(i, 0.2, false, new Decimal(10), new Decimal(1), new Decimal(1.2))
      return Decimal.pow(1e5, i).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      let i = amt.div(baseCost).log(1e5)
      i = scale(i, 0.2, true, new Decimal(10), new Decimal(1), new Decimal(1.2))
      return i
    },
    maxLevel: new Decimal(16),
    costPerLevel: new Decimal(1e25),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(150).add(0.55),
        get desc () {
          return i18next.t('octeract.data.octeractOneMindImprover.effect', { n: format(this.bonus, 3, true) })
        }
      }
    },
    qualityOfLife: true
  },
  octeractAmbrosiaLuck: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(10)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1.11111e59),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(4),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaLuck.effect', { n: format(n.mul(4)) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaLuck.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaLuck2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(5.1).sub(1).mul(4).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1).div(4).add(1).root(5.1).sub(1)
    },
    maxLevel: new Decimal(30),
    costPerLevel: new Decimal(1),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(2),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaLuck2.effect', { n: format(n.mul(2)) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaLuck.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaLuck3: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(7.15).sub(1).mul(4).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1).div(4).add(1).root(7.15).sub(1)
    },
    maxLevel: new Decimal(30),
    costPerLevel: new Decimal(1e30),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(3),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaLuck3.effect', { n: format(n.mul(3)) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaLuck.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaLuck4: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(3, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(3)
    },
    maxLevel: new Decimal(50),
    costPerLevel: new Decimal(5e69),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(5),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaLuck4.effect', { n: format(n.mul(5)) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaLuck.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaGeneration: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(10, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(10)
    },
    maxLevel: new Decimal(-1),
    costPerLevel: new Decimal(1.11111e59),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaGeneration.effect', { n: format(n) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaGeneration.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaGeneration2: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(5.1).sub(1).mul(4).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1).div(4).add(1).root(5.1).sub(1)
    },
    maxLevel: new Decimal(20),
    costPerLevel: new Decimal(1),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaGeneration2.effect', { n: format(n) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaGeneration.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaGeneration3: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return level.add(1).pow(7.15).sub(1).mul(4).add(1).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).sub(1).div(4).add(1).root(7.15).sub(1)
    },

    maxLevel: new Decimal(35),
    costPerLevel: new Decimal(1e30),
    effect: (n: Decimal) => {
      return {
        bonus: n.div(100).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaGeneration3.effect', { n: format(n) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaGeneration.updateVal('OcteractBerries')]
  },
  octeractAmbrosiaGeneration4: {
    costFormula: (level: Decimal, baseCost: Decimal) => {
      return Decimal.pow(3, level).mul(baseCost)
    },
    target: (amt: Decimal, baseCost: Decimal) => {
      if (amt.lt(baseCost)) { return new Decimal(0) }
      return amt.div(baseCost).log(3)
    },
    maxLevel: new Decimal(50),
    costPerLevel: new Decimal(5e69),
    effect: (n: Decimal) => {
      return {
        bonus: n.mul(2).div(100).add(1),
        get desc () {
          return i18next.t('octeract.data.octeractAmbrosiaGeneration4.effect', { n: format(this.bonus.sub(1).mul(100)) })
        }
      }
    },
    qualityOfLife: true,
    cacheUpdates: [() => player.caches.ambrosiaGeneration.updateVal('OcteractBerries')]
  }
}
