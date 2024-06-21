import Decimal from 'break_eternity.js'
import { z, type ZodNumber, type ZodType } from 'zod'
import { BlueberryUpgrade, blueberryUpgradeData } from '../BlueberryUpgrades'
import { WowCubes, WowHypercubes, WowPlatonicCubes, WowTesseracts } from '../CubeExperimental'
import { createHepteract } from '../Hepteracts'
import { octeractData, OcteractUpgrade } from '../Octeracts'
import { QuarkHandler } from '../Quark'
import { singularityData, SingularityUpgrade } from '../singularity'
import { SingularityChallenge, singularityChallengeData } from '../SingularityChallenges'
import { blankSave } from '../Synergism'
import type { Player } from '../types/Synergism'
import { deepClone, padArray } from '../Utility'

const decimalSchema = z.custom<Decimal>((value) => {
  try {
    new Decimal(value)
    return true
  } catch {
    return false
  }
}).transform((decimalSource) => new Decimal(decimalSource))

const arrayStartingWithNull = (s: ZodType) =>
  z.array(z.union([z.null(), s]))
    .refine((arr) => arr.length > 0 && arr[0] === null, {
      message: 'First element must be null'
    })
    .refine((arr) => arr.slice(1).every((element) => typeof element === 'number'), {
      message: 'All elements after the first must be numbers'
    })

const arrayExtend = (array: number[], k: keyof Player) => {
  if (array.length < blankSave[k].length) {
    array.push(...Array(blankSave[k].length - array.length).fill(0))
  }
  return array
}

const ascendBuildingSchema = z.object({
  cost: decimalSchema,
  owned: decimalSchema,
  generated: decimalSchema,
  multiplier: decimalSchema
})

const singularityUpgradeSchema = (...keys: string[]) => {
  return z.object<Record<'level' | 'toggleBuy' | 'freeLevels' | typeof keys[number], ZodNumber>>({
    level: z.number(),
    toggleBuy: z.number(),
    freeLevels: z.number(),
    ...keys.reduce((accum, value) => {
      accum[value] = z.number()
      return accum
    }, {} as Record<string, ZodType>)
  })
}

const toggleSchema = z.record(z.string(), z.boolean()).transform((record) => {
  return Object.fromEntries(
    Object.entries(record).filter(([key, _value]) => /^\d+$/.test(key))
  )
})

const decimalStringSchema = z.string().regex(/^|-?\d+(\.\d{1,2})?$/)
const integerStringSchema = z.string().regex(/^\d+$/)

const hepteractCraftSchema = z.object({
  AUTO: z.boolean(),
  BAL: decimalSchema,
  BASE_CAP: decimalSchema,
  CAP: decimalSchema,
  DISCOUNT: decimalSchema,
  HEPTERACT_CONVERSION: decimalSchema,
  HTML_STRING: z.string(),
  OTHER_CONVERSIONS: z.record(z.string(), decimalSchema),
  UNLOCKED: z.boolean()
})

export const playerSchema = z.object({
  firstPlayed: z.string().datetime().optional().default(() => new Date().toISOString()),
  worlds: z.number().transform((quarks) => new QuarkHandler({ quarks })),

  coins: decimalSchema,
  coinsThisPrestige: decimalSchema,
  coinsThisTranscension: decimalSchema,
  coinsThisReincarnation: decimalSchema,
  coinsTotal: decimalSchema,

  firstOwnedCoin: decimalSchema,
  firstGeneratedCoin: decimalSchema,
  firstCostCoin: decimalSchema,
  firstProduceCoin: decimalSchema,

  secondOwnedCoin: decimalSchema,
  secondGeneratedCoin: decimalSchema,
  secondCostCoin: decimalSchema,
  secondProduceCoin: decimalSchema,

  thirdOwnedCoin: decimalSchema,
  thirdGeneratedCoin: decimalSchema,
  thirdCostCoin: decimalSchema,
  thirdProduceCoin: decimalSchema,

  fourthOwnedCoin: decimalSchema,
  fourthGeneratedCoin: decimalSchema,
  fourthCostCoin: decimalSchema,
  fourthProduceCoin: decimalSchema,

  fifthOwnedCoin: decimalSchema,
  fifthGeneratedCoin: decimalSchema,
  fifthCostCoin: decimalSchema,
  fifthProduceCoin: decimalSchema,

  firstOwnedDiamonds: decimalSchema,
  firstGeneratedDiamonds: decimalSchema,
  firstCostDiamonds: decimalSchema,
  firstProduceDiamonds: decimalSchema,

  secondOwnedDiamonds: decimalSchema,
  secondGeneratedDiamonds: decimalSchema,
  secondCostDiamonds: decimalSchema,
  secondProduceDiamonds: decimalSchema,

  thirdOwnedDiamonds: decimalSchema,
  thirdGeneratedDiamonds: decimalSchema,
  thirdCostDiamonds: decimalSchema,
  thirdProduceDiamonds: decimalSchema,

  fourthOwnedDiamonds: decimalSchema,
  fourthGeneratedDiamonds: decimalSchema,
  fourthCostDiamonds: decimalSchema,
  fourthProduceDiamonds: decimalSchema,

  fifthOwnedDiamonds: decimalSchema,
  fifthGeneratedDiamonds: decimalSchema,
  fifthCostDiamonds: decimalSchema,
  fifthProduceDiamonds: decimalSchema,

  firstOwnedMythos: decimalSchema,
  firstGeneratedMythos: decimalSchema,
  firstCostMythos: decimalSchema,
  firstProduceMythos: decimalSchema,

  secondOwnedMythos: decimalSchema,
  secondGeneratedMythos: decimalSchema,
  secondCostMythos: decimalSchema,
  secondProduceMythos: decimalSchema,

  thirdOwnedMythos: decimalSchema,
  thirdGeneratedMythos: decimalSchema,
  thirdCostMythos: decimalSchema,
  thirdProduceMythos: decimalSchema,

  fourthOwnedMythos: decimalSchema,
  fourthGeneratedMythos: decimalSchema,
  fourthCostMythos: decimalSchema,
  fourthProduceMythos: decimalSchema,

  fifthOwnedMythos: decimalSchema,
  fifthGeneratedMythos: decimalSchema,
  fifthCostMythos: decimalSchema,
  fifthProduceMythos: decimalSchema,

  firstOwnedParticles: decimalSchema,
  firstGeneratedParticles: decimalSchema,
  firstCostParticles: decimalSchema,
  firstProduceParticles: decimalSchema,

  secondOwnedParticles: decimalSchema,
  secondGeneratedParticles: decimalSchema,
  secondCostParticles: decimalSchema,
  secondProduceParticles: decimalSchema,

  thirdOwnedParticles: decimalSchema,
  thirdGeneratedParticles: decimalSchema,
  thirdCostParticles: decimalSchema,
  thirdProduceParticles: decimalSchema,

  fourthOwnedParticles: decimalSchema,
  fourthGeneratedParticles: decimalSchema,
  fourthCostParticles: decimalSchema,
  fourthProduceParticles: decimalSchema,

  fifthOwnedParticles: decimalSchema,
  fifthGeneratedParticles: decimalSchema,
  fifthCostParticles: decimalSchema,
  fifthProduceParticles: decimalSchema,

  firstOwnedAnts: decimalSchema.default(() => blankSave.firstOwnedAnts),
  firstGeneratedAnts: decimalSchema,
  firstCostAnts: decimalSchema,
  firstProduceAnts: decimalSchema,

  secondOwnedAnts: decimalSchema.default(() => blankSave.secondOwnedAnts),
  secondGeneratedAnts: decimalSchema,
  secondCostAnts: decimalSchema,
  secondProduceAnts: decimalSchema,

  thirdOwnedAnts: decimalSchema.default(() => blankSave.thirdOwnedAnts),
  thirdGeneratedAnts: decimalSchema,
  thirdCostAnts: decimalSchema,
  thirdProduceAnts: decimalSchema,

  fourthOwnedAnts: decimalSchema.default(() => blankSave.fourthOwnedAnts),
  fourthGeneratedAnts: decimalSchema,
  fourthCostAnts: decimalSchema,
  fourthProduceAnts: decimalSchema,

  fifthOwnedAnts: decimalSchema.default(() => blankSave.fifthOwnedAnts),
  fifthGeneratedAnts: decimalSchema,
  fifthCostAnts: decimalSchema,
  fifthProduceAnts: decimalSchema,

  sixthOwnedAnts: decimalSchema.default(() => blankSave.sixthOwnedAnts),
  sixthGeneratedAnts: decimalSchema,
  sixthCostAnts: decimalSchema,
  sixthProduceAnts: decimalSchema,

  seventhOwnedAnts: decimalSchema.default(() => blankSave.seventhOwnedAnts),
  seventhGeneratedAnts: decimalSchema,
  seventhCostAnts: decimalSchema,
  seventhProduceAnts: decimalSchema,

  eighthOwnedAnts: decimalSchema.default(() => blankSave.eighthOwnedAnts),
  eighthGeneratedAnts: decimalSchema,
  eighthCostAnts: decimalSchema,
  eighthProduceAnts: decimalSchema,

  ascendBuilding1: ascendBuildingSchema.default(() => deepClone(blankSave.ascendBuilding1)),
  ascendBuilding2: ascendBuildingSchema.default(() => deepClone(blankSave.ascendBuilding2)),
  ascendBuilding3: ascendBuildingSchema.default(() => deepClone(blankSave.ascendBuilding3)),
  ascendBuilding4: ascendBuildingSchema.default(() => deepClone(blankSave.ascendBuilding4)),
  ascendBuilding5: ascendBuildingSchema.default(() => deepClone(blankSave.ascendBuilding5)),

  multiplierCost: decimalSchema,
  multiplierBought: decimalSchema,

  acceleratorCost: decimalSchema,
  acceleratorBought: decimalSchema,

  acceleratorBoostCost: decimalSchema,
  acceleratorBoostBought: decimalSchema,

  upgrades: z.number().array().transform((array) => {
    if (array.length < blankSave.upgrades.length) {
      array.push(...blankSave.upgrades.slice(0, blankSave.upgrades.length - array.length))
    }

    return array
  }),

  prestigeCount: z.number(),
  transcendCount: z.number(),
  reincarnationCount: z.number(),

  prestigePoints: decimalSchema,
  transcendPoints: decimalSchema,
  reincarnationPoints: decimalSchema,

  prestigeShards: decimalSchema,
  transcendShards: decimalSchema,
  reincarnationShards: decimalSchema,

  toggles: toggleSchema,

  challengecompletions: z.union([
    z.number().array(),
    z.record(z.string(), z.number()).transform((value) => {
      const challengeCompletions = Object.values(value)
      padArray(
        challengeCompletions,
        0,
        blankSave.challengecompletions.length
      )
      return challengeCompletions
    })
  ]),
  highestchallengecompletions: z.union([
    z.union([z.number(), z.null()]).array(),
    z.record(z.string(), z.number()).transform((value) => {
      const highestChallengeCompletions = Object.values(value)
      padArray(
        highestChallengeCompletions,
        0,
        blankSave.highestchallengecompletions.length
      )
      return highestChallengeCompletions
    })
  ]),
  challenge15Exponent: decimalSchema.default(() => blankSave.challenge15Exponent),
  highestChallenge15Exponent: decimalSchema.default(() => blankSave.highestChallenge15Exponent),

  retrychallenges: z.boolean().default(() => blankSave.retrychallenges),
  currentChallenge: z.union([
    z.string().transform(() => ({ ...blankSave.currentChallenge })),
    z.object({
      transcension: z.number(),
      reincarnation: z.number(),
      ascension: z.number()
    }).default(() => ({ ...blankSave.currentChallenge }))
  ]),
  researchPoints: z.number(),
  obtainiumtimer: z.number(),
  obtainiumpersecond: decimalSchema.default(() => blankSave.obtainiumpersecond),
  maxobtainiumpersecond: decimalSchema.default(() => blankSave.maxobtainiumpersecond),
  maxobtainium: decimalSchema.default(() => blankSave.maxobtainium),

  researches: z.number().array(),

  unlocks: z.record(z.string(), z.boolean()),
  achievements: z.number().array().transform((array) => arrayExtend(array, 'achievements')),

  achievementPoints: z.number(),

  prestigenomultiplier: z.boolean(),
  prestigenoaccelerator: z.boolean(),
  transcendnomultiplier: z.boolean(),
  transcendnoaccelerator: z.boolean(),
  reincarnatenomultiplier: z.boolean(),
  reincarnatenoaccelerator: z.boolean(),
  prestigenocoinupgrades: z.boolean(),
  transcendnocoinupgrades: z.boolean(),
  transcendnocoinorprestigeupgrades: z.boolean(),
  reincarnatenocoinupgrades: z.boolean(),
  reincarnatenocoinorprestigeupgrades: z.boolean(),
  reincarnatenocoinprestigeortranscendupgrades: z.boolean(),
  reincarnatenocoinprestigetranscendorgeneratorupgrades: z.boolean(),

  crystalUpgrades: z.number().array(),
  crystalUpgradesCost: decimalSchema.array().default(() => [...blankSave.crystalUpgradesCost]),

  runelevels: z.number().array(),
  runeexp: z.union([z.number(), z.null()]).array().transform((value) => value.map((val) => val === null ? 0 : val)),
  runeshards: z.number(),
  maxofferings: decimalSchema.default(() => blankSave.maxofferings),
  offeringpersecond: decimalSchema.default(() => blankSave.offeringpersecond),

  prestigecounter: z.number(),
  transcendcounter: z.number(),
  reincarnationcounter: z.number(),
  offlinetick: z.number(),

  prestigeamount: z.union([decimalSchema, decimalStringSchema]).default(() => blankSave.prestigeamount),
  transcendamount: z.union([decimalSchema, decimalStringSchema]).default(() => blankSave.transcendamount),
  reincarnationamount: z.union([decimalSchema, decimalStringSchema]).default(() => blankSave.reincarnationamount),

  fastestprestige: z.number(),
  fastesttranscend: z.number(),
  fastestreincarnate: z.number(),

  resettoggle1: z.number().default(() => blankSave.resettoggle1),
  resettoggle2: z.number().default(() => blankSave.resettoggle2),
  resettoggle3: z.number().default(() => blankSave.resettoggle3),
  resettoggle4: z.number().default(() => blankSave.resettoggle4),

  tesseractAutoBuyerToggle: z.number().default(() => blankSave.tesseractAutoBuyerToggle),
  tesseractAutoBuyerAmount: z.number().default(() => blankSave.tesseractAutoBuyerAmount),

  coinbuyamount: z.number(),
  crystalbuyamount: z.number(),
  mythosbuyamount: z.number(),
  particlebuyamount: z.number(),
  offeringbuyamount: z.number(),
  tesseractbuyamount: z.number().default(() => blankSave.tesseractbuyamount),

  shoptoggles: z.record(z.string(), z.boolean()),
  tabnumber: z.number(),
  subtabNumber: z.number().default(() => blankSave.subtabNumber),

  codes: z.array(z.tuple([z.number(), z.boolean()])).transform((tuple) => new Map(tuple)).default(() =>
    deepClone([...blankSave.codes])
  ),

  loaded1009: z.boolean().default(() => blankSave.loaded1009),
  loaded1009hotfix1: z.boolean().default(() => blankSave.loaded1009hotfix1),
  loaded10091: z.boolean().default(() => blankSave.loaded10091),
  loaded1010: z.boolean().default(() => blankSave.loaded1010),
  loaded10101: z.boolean().default(() => blankSave.loaded10101),

  shopUpgrades: z.record(z.string(), z.union([z.number(), z.null(), z.boolean()]))
    .transform((object) => {
      return Object.fromEntries(
        Object.keys(blankSave.shopUpgrades).map((key) => {
          const value = object[key] ?? blankSave.shopUpgrades[key as keyof typeof blankSave['shopUpgrades']]
          return value === null ? [key, 0] : [key, Number(value)]
        })
      )
    })
    .default(() => ({ ...blankSave.shopUpgrades })),

  shopBuyMaxToggle: z.union([z.boolean(), z.string()]).default(() => blankSave.shopBuyMaxToggle),
  shopHideToggle: z.boolean().default(() => blankSave.shopHideToggle),
  shopConfirmationToggle: z.boolean().default(() => blankSave.shopConfirmationToggle),
  autoPotionTimer: decimalSchema.default(() => blankSave.autoPotionTimer),
  autoPotionTimerObtainium: decimalSchema.default(() => blankSave.autoPotionTimerObtainium),

  autoSacrificeToggle: z.boolean().default(() => blankSave.autoSacrificeToggle),
  autoBuyFragment: z.boolean().default(() => blankSave.autoBuyFragment),
  autoFortifyToggle: z.boolean().default(() => blankSave.autoFortifyToggle),
  autoEnhanceToggle: z.boolean().default(() => blankSave.autoEnhanceToggle),
  autoResearchToggle: z.boolean(),
  researchBuyMaxToggle: z.boolean().default(() => blankSave.researchBuyMaxToggle),
  autoResearchMode: z.string().default(() => blankSave.autoResearchMode),
  autoResearch: z.number().default(() => blankSave.autoResearch),
  autoSacrifice: z.number().default(() => blankSave.autoSacrifice),
  sacrificeTimer: decimalSchema.default(() => blankSave.sacrificeTimer),
  quarkstimer: decimalSchema.default(() => blankSave.quarkstimer),
  goldenQuarksTimer: decimalSchema.default(() => blankSave.goldenQuarksTimer),

  antPoints: decimalSchema,
  antUpgrades: z.union([z.number().array(), arrayStartingWithNull(z.number()).transform((array) => array.slice(1))])
    .default(() => [...blankSave.antUpgrades]),
  antSacrificePoints: z.union([decimalSchema, z.null().transform(() => Number.MAX_VALUE)]).default(() =>
    blankSave.antSacrificePoints
  ),
  antSacrificeTimer: decimalSchema.default(() => blankSave.antSacrificeTimer),
  antSacrificeTimerReal: decimalSchema.default(() => blankSave.antSacrificeTimerReal),

  talismanLevels: z.union([z.number().array(), arrayStartingWithNull(z.number()).transform((array) => array.slice(1))])
    .default(() => [...blankSave.talismanLevels]),
  talismanRarity: z.union([z.number().array(), arrayStartingWithNull(z.number()).transform((array) => array.slice(1))])
    .default(() => [...blankSave.talismanRarity]),
  talismanOne: arrayStartingWithNull(z.number()).default(() => blankSave.talismanOne),
  talismanTwo: arrayStartingWithNull(z.number()).default(() => blankSave.talismanTwo),
  talismanThree: arrayStartingWithNull(z.number()).default(() => blankSave.talismanThree),
  talismanFour: arrayStartingWithNull(z.number()).default(() => blankSave.talismanFour),
  talismanFive: arrayStartingWithNull(z.number()).default(() => blankSave.talismanFive),
  talismanSix: arrayStartingWithNull(z.number()).default(() => blankSave.talismanSix),
  talismanSeven: arrayStartingWithNull(z.number()).default(() => blankSave.talismanSeven),
  talismanShards: decimalSchema.default(() => blankSave.talismanShards),
  commonFragments: decimalSchema.default(() => blankSave.commonFragments),
  uncommonFragments: decimalSchema.default(() => blankSave.uncommonFragments),
  rareFragments: decimalSchema.default(() => blankSave.rareFragments),
  epicFragments: decimalSchema.default(() => blankSave.epicFragments),
  legendaryFragments: decimalSchema.default(() => blankSave.legendaryFragments),
  mythicalFragments: decimalSchema.default(() => blankSave.mythicalFragments),

  buyTalismanShardPercent: z.number().default(() => blankSave.buyTalismanShardPercent),

  autoAntSacrifice: z.boolean().default(() => blankSave.autoAntSacrifice),
  autoAntSacTimer: z.number().default(() => blankSave.autoAntSacTimer),
  autoAntSacrificeMode: z.number().default(() => blankSave.autoAntSacrificeMode),
  antMax: z.boolean().default(() => blankSave.antMax),

  ascensionCount: decimalSchema.default(() => blankSave.ascensionCount),
  ascensionCounter: decimalSchema.default(() => blankSave.ascensionCounter),
  ascensionCounterReal: decimalSchema.default(() => blankSave.ascensionCounterReal),
  ascensionCounterRealReal: decimalSchema.default(() => blankSave.ascensionCounterRealReal),
  cubeUpgrades: arrayStartingWithNull(z.number())
    .transform((array) => arrayExtend(array, 'cubeUpgrades'))
    .default(() => [...blankSave.cubeUpgrades]),
  cubeUpgradesBuyMaxToggle: z.boolean().default(() => blankSave.cubeUpgradesBuyMaxToggle),
  autoCubeUpgradesToggle: z.boolean().default(() => blankSave.autoCubeUpgradesToggle),
  autoPlatonicUpgradesToggle: z.boolean().default(() => blankSave.autoPlatonicUpgradesToggle),
  platonicUpgrades: z.number().array().default(() => [...blankSave.platonicUpgrades]),
  wowCubes: decimalSchema.default(() => blankSave.wowCubes.value).transform((cubes) => new WowCubes(cubes)),
  wowTesseracts: decimalSchema.default(() => blankSave.wowTesseracts.value).transform((tesseract) =>
    new WowTesseracts(tesseract)
  ),
  wowHypercubes: decimalSchema.default(() => blankSave.wowHypercubes.value).transform((cubes) =>
    new WowHypercubes(cubes)
  ),
  wowPlatonicCubes: decimalSchema.default(() => blankSave.wowPlatonicCubes.value).transform((cubes) =>
    new WowPlatonicCubes(cubes)
  ),
  saveOfferingToggle: z.boolean().default(() => blankSave.saveOfferingToggle),
  wowAbyssals: decimalSchema.default(() => blankSave.wowAbyssals),
  wowOcteracts: decimalSchema.default(() => blankSave.wowOcteracts),
  totalWowOcteracts: decimalSchema.default(() => blankSave.totalWowOcteracts),
  cubeBlessings: z.record(z.string(), decimalSchema).default(() => ({ ...blankSave.cubeBlessings })),
  tesseractBlessings: z.record(z.string(), decimalSchema).default(() => ({ ...blankSave.tesseractBlessings })),
  hypercubeBlessings: z.record(z.string(), decimalSchema).default(() => ({ ...blankSave.hypercubeBlessings })),
  platonicBlessings: z.record(z.string(), decimalSchema).default(() => ({ ...blankSave.platonicBlessings })),

  hepteractCrafts: z.object({
    chronos: hepteractCraftSchema,
    hyperrealism: hepteractCraftSchema,
    quark: hepteractCraftSchema,
    challenge: hepteractCraftSchema,
    abyss: hepteractCraftSchema,
    accelerator: hepteractCraftSchema,
    acceleratorBoost: hepteractCraftSchema,
    multiplier: hepteractCraftSchema
  }).transform((crafts) => {
    return Object.fromEntries(
      Object.entries(blankSave.hepteractCrafts).map(([key, value]) => {
        return [
          key,
          createHepteract({
            ...value,
            ...crafts[key as keyof typeof crafts]
          })
        ]
      })
    )
  }).default(() => blankSave.hepteractCrafts),

  ascendShards: decimalSchema.default(() => deepClone(blankSave.ascendShards)),
  autoAscend: z.boolean().default(() => blankSave.autoAscend),
  autoAscendMode: z.string().default(() => blankSave.autoAscendMode),
  autoAscendThreshold: z.number().default(() => blankSave.autoAscendThreshold),
  autoOpenCubes: z.boolean().default(() => blankSave.autoOpenCubes),
  openCubes: z.number().default(() => blankSave.openCubes),
  autoOpenTesseracts: z.boolean().default(() => blankSave.autoOpenTesseracts),
  openTesseracts: z.number().default(() => blankSave.openTesseracts),
  autoOpenHypercubes: z.boolean().default(() => blankSave.autoOpenHypercubes),
  openHypercubes: z.number().default(() => blankSave.openHypercubes),
  autoOpenPlatonicsCubes: z.boolean().default(() => blankSave.autoOpenPlatonicsCubes),
  openPlatonicsCubes: z.number().default(() => blankSave.openPlatonicsCubes),
  roombaResearchIndex: z.number().default(() => blankSave.roombaResearchIndex),
  ascStatToggles: z.record(integerStringSchema, z.boolean()).default(() => ({ ...blankSave.ascStatToggles })),

  prototypeCorruptions: z.number().array().default(() => [...blankSave.prototypeCorruptions]),
  usedCorruptions: z.number().array().default(() => [...blankSave.usedCorruptions]),
  corruptionLoadouts: z.record(integerStringSchema, z.number().array()).default(() =>
    deepClone(blankSave.corruptionLoadouts)
  ),
  corruptionLoadoutNames: z.string().array().default(() => blankSave.corruptionLoadoutNames.slice()).default(
    () => [...blankSave.corruptionLoadoutNames]
  ),
  corruptionShowStats: z.boolean().default(() => blankSave.corruptionShowStats),

  constantUpgrades: arrayStartingWithNull(z.number()).default(() => [...blankSave.constantUpgrades]),
  // TODO: real types
  history: z.object({
    ants: z.any().array(),
    ascend: z.any().array().default(() => [...blankSave.history.ascend]),
    reset: z.any().array().default(() => [...blankSave.history.reset]),
    singularity: z.any().array().default(() => [...blankSave.history.singularity])
  }).default(() => deepClone(blankSave.history)),
  historyShowPerSecond: z.boolean().default(() => blankSave.historyShowPerSecond),

  autoChallengeRunning: z.boolean().default(() => blankSave.autoChallengeRunning),
  autoChallengeIndex: z.number().default(() => blankSave.autoChallengeIndex),
  autoChallengeToggles: z.boolean().array().default(() => [...blankSave.autoChallengeToggles]),
  autoChallengeStartExponent: z.number().default(() => blankSave.autoChallengeStartExponent),
  autoChallengeTimer: z.record(z.string(), z.number()).default(() => ({ ...blankSave.autoChallengeTimer })),

  runeBlessingLevels: decimalSchema.array().default(() => [...blankSave.runeBlessingLevels]),
  runeSpiritLevels: decimalSchema.array().default(() => [...blankSave.runeSpiritLevels]),
  runeBlessingBuyAmount: z.number().default(() => blankSave.runeBlessingBuyAmount),
  runeSpiritBuyAmount: z.number().default(() => blankSave.runeSpiritBuyAmount),

  autoTesseracts: z.boolean().array().default(() => [...blankSave.autoTesseracts]),

  saveString: z.string().default(() => blankSave.saveString),
  exporttest: z.union([z.string(), z.boolean()]).transform((value) => {
    if (typeof value === 'string') {
      return value === 'YES!'
    }

    return value
  }),

  dayCheck: z.string().datetime().nullable().default(() => blankSave.dayCheck as null).transform((value) => {
    return value === null ? value : new Date(value)
  }),
  dayTimer: z.number().default(() => blankSave.dayTimer),
  cubeOpenedDaily: decimalSchema.default(() => blankSave.cubeOpenedDaily),
  cubeQuarkDaily: decimalSchema.default(() => blankSave.cubeQuarkDaily),
  tesseractOpenedDaily: decimalSchema.default(() => blankSave.tesseractOpenedDaily),
  tesseractQuarkDaily: decimalSchema.default(() => blankSave.tesseractQuarkDaily),
  hypercubeOpenedDaily: decimalSchema.default(() => blankSave.hypercubeOpenedDaily),
  hypercubeQuarkDaily: decimalSchema.default(() => blankSave.hypercubeQuarkDaily),
  platonicCubeOpenedDaily: decimalSchema.default(() => blankSave.platonicCubeOpenedDaily),
  platonicCubeQuarkDaily: decimalSchema.default(() => blankSave.platonicCubeQuarkDaily),
  overfluxOrbs: decimalSchema.default(() => blankSave.overfluxOrbs),
  overfluxOrbsAutoBuy: z.boolean().default(() => blankSave.overfluxOrbsAutoBuy),
  overfluxPowder: decimalSchema.default(() => blankSave.overfluxPowder),
  dailyPowderResetUses: z.number().default(() => blankSave.dailyPowderResetUses),
  autoWarpCheck: z.boolean().default(() => blankSave.autoWarpCheck),
  loadedOct4Hotfix: z.boolean().default(() => blankSave.loadedOct4Hotfix),
  loadedNov13Vers: z.boolean().default(() => blankSave.loadedNov13Vers),
  loadedDec16Vers: z.boolean().default(() => blankSave.loadedDec16Vers),
  loadedV253: z.boolean().default(() => blankSave.loadedV253),
  loadedV255: z.boolean().default(() => blankSave.loadedV255),
  loadedV297Hotfix1: z.boolean().default(() => blankSave.loadedV297Hotfix1),
  loadedV2927Hotfix1: z.boolean().default(() => blankSave.loadedV2927Hotfix1),
  loadedV2930Hotfix1: z.boolean().default(() => blankSave.loadedV2930Hotfix1),
  loadedV2931Hotfix1: z.boolean().default(() => blankSave.loadedV2931Hotfix1),
  loadedV21003Hotfix1: z.boolean().default(() => blankSave.loadedV21003Hotfix1),
  loadedV21007Hotfix1: z.boolean().default(() => blankSave.loadedV21007Hotfix1),
  version: z.string().default(() => blankSave.version),
  rngCode: z.number().default(() => blankSave.rngCode),
  promoCodeTiming: z.record(z.string(), z.number()).default(() => ({ time: Date.now() - 60 * 1000 * 15 })),
  singularityCount: z.number().default(() => blankSave.singularityCount),
  highestSingularityCount: z.number().default(() => blankSave.highestSingularityCount),
  singularityCounter: z.number().default(() => blankSave.singularityCount),
  goldenQuarks: decimalSchema.default(() => blankSave.goldenQuarks),
  quarksThisSingularity: decimalSchema.nullable().default(() => blankSave.quarksThisSingularity),
  totalQuarksEver: decimalSchema.default(() => blankSave.totalQuarksEver),
  hotkeys: z.record(integerStringSchema, z.string().array()).default(() => blankSave.hotkeys),
  theme: z.string().default(() => blankSave.theme),
  iconSet: z.number().default(() => blankSave.iconSet),
  notation: z.string().default(() => blankSave.notation),

  // TODO: why is this on player?
  singularityUpgrades: z.record(z.string(), singularityUpgradeSchema('goldenQuarksInvested'))
    .transform((upgrades) =>
      Object.fromEntries(
        Object.keys(singularityData).map((k) => {
          const { level, goldenQuarksInvested, toggleBuy, freeLevels } = upgrades[k] ?? singularityData[k]

          return [
            k,
            new SingularityUpgrade({
              maxLevel: singularityData[k].maxLevel,
              costPerLevel: singularityData[k].costPerLevel,

              level: level as number,
              goldenQuarksInvested,
              toggleBuy: toggleBuy as number,
              freeLevels: freeLevels as number,
              minimumSingularity: singularityData[k].minimumSingularity,
              effect: singularityData[k].effect,
              canExceedCap: singularityData[k].canExceedCap,
              specialCostForm: singularityData[k].specialCostForm,
              qualityOfLife: singularityData[k].qualityOfLife,
              cacheUpdates: singularityData[k].cacheUpdates
            }, k)
          ]
        })
      )
    )
    .default(() => {
      const v = JSON.parse(JSON.stringify(blankSave.singularityUpgrades))
      console.log('DEFAULT SING UPGRADES', v)
      return v
    }),
  octeractUpgrades: z.record(z.string(), singularityUpgradeSchema('octeractsInvested'))
  .transform((upgrades) =>
    Object.fromEntries(
      Object.keys(octeractData).map((k) => {
        const { level, octeractsInvested, toggleBuy, freeLevels } = upgrades[k] ?? octeractData[k]

        return [
          k,
          new OcteractUpgrade({
            maxLevel: octeractData[k].maxLevel,
            costPerLevel: octeractData[k].costPerLevel,
            level: level as number,
            octeractsInvested,
            toggleBuy: toggleBuy as number,
            effect: octeractData[k].effect,
            costFormula: octeractData[k].costFormula,
            freeLevels: freeLevels as number,
            qualityOfLife: octeractData[k].qualityOfLife,
            cacheUpdates: octeractData[k].cacheUpdates
          }, k)
        ]
      })
    )
    )
    .default(() => JSON.parse(JSON.stringify(blankSave.octeractUpgrades))),

  dailyCodeUsed: z.boolean().default(() => blankSave.dailyCodeUsed),
  hepteractAutoCraftPercentage: z.number().default(() => blankSave.hepteractAutoCraftPercentage),
  octeractTimer: decimalSchema.default(() => blankSave.octeractTimer),
  insideSingularityChallenge: z.boolean().default(() => blankSave.insideSingularityChallenge),

  singularityChallenges: z.record(
    z.string(),
    z.object({
      completions: z.number(),
      highestSingularityCompleted: z.number(),
      enabled: z.boolean()
    })
  )
  .transform((upgrades) =>
    Object.fromEntries(
      Object.keys(blankSave.singularityChallenges).map((k) => {
        const { completions, highestSingularityCompleted, enabled } = upgrades[k]
        ?? blankSave.singularityChallenges[k]

        return [
          k,
          new SingularityChallenge({
            baseReq: singularityChallengeData[k].baseReq,
            completions,
            maxCompletions: singularityChallengeData[k].maxCompletions,
            unlockSingularity: singularityChallengeData[k].unlockSingularity,
            HTMLTag: singularityChallengeData[k].HTMLTag,
            highestSingularityCompleted,
            enabled,
            singularityRequirement: singularityChallengeData[k].singularityRequirement,
            scalingrewardcount: singularityChallengeData[k].scalingrewardcount,
            uniquerewardcount: singularityChallengeData[k].uniquerewardcount,
            effect: singularityChallengeData[k].effect,
            cacheUpdates: singularityChallengeData[k].cacheUpdates
          }, k)
        ]
      })
    )
  )
  .default(() => JSON.parse(JSON.stringify(blankSave.singularityChallenges))),

  ambrosia: decimalSchema.default(() => blankSave.ambrosia),
  lifetimeAmbrosia: decimalSchema.default(() => blankSave.lifetimeAmbrosia),
  blueberryTime: decimalSchema.default(() => blankSave.blueberryTime),
  visitedAmbrosiaSubtab: z.boolean().default(() => blankSave.visitedAmbrosiaSubtab),
  spentBlueberries: z.number().default(() => blankSave.spentBlueberries),
  // TODO: is this right?
  blueberryUpgrades: z.record(z.string(), singularityUpgradeSchema('blueberriesInvested', 'ambrosiaInvested'))
    .transform((upgrades) =>
      Object.fromEntries(
        Object.keys(blankSave.blueberryUpgrades).map((k) => {
          const { level, ambrosiaInvested, blueberriesInvested, toggleBuy, freeLevels } = upgrades[k]
            ?? blankSave.blueberryUpgrades[k]

          return [
            k,
            new BlueberryUpgrade({
              maxLevel: blueberryUpgradeData[k].maxLevel,
              costPerLevel: blueberryUpgradeData[k].costPerLevel,
              level: level as number,
              ambrosiaInvested,
              blueberriesInvested,
              toggleBuy: toggleBuy as number,
              blueberryCost: blueberryUpgradeData[k].blueberryCost,
              rewards: blueberryUpgradeData[k].rewards,
              costFormula: blueberryUpgradeData[k].costFormula,
              freeLevels: freeLevels as number,
              prerequisites: blueberryUpgradeData[k].prerequisites,
              cacheUpdates: blueberryUpgradeData[k].cacheUpdates
            }, k)
          ]
        })
      )
    )
    .default(() => JSON.parse(JSON.stringify(blankSave.blueberryUpgrades))),

  // TODO: what type?
  blueberryLoadouts: z.record(integerStringSchema, z.any()).default(() => blankSave.blueberryLoadouts),
  blueberryLoadoutMode: z.string().default(() => blankSave.blueberryLoadoutMode),

  ultimateProgress: decimalSchema.default(() => blankSave.ultimateProgress),
  ultimatePixels: decimalSchema.default(() => blankSave.ultimatePixels),

  // TODO: what type?
  caches: z.record(z.string(), z.any())
    .transform(() => {
      // Object.values(blankSave.caches).map((cache) => cache.reset())
      return blankSave.caches
    })
    .default(() => {
      // Object.values(blankSave.caches).map((cache) => cache.reset())
      return blankSave.caches
    }),

  lastExportedSave: z.number().default(() => blankSave.lastExportedSave)
})