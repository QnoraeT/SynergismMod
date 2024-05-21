import { player } from './Synergism'
import { sumContents } from './Utility'
import { Globals as G } from './Variables'

import Decimal from "break_eternity.js";
import { achievementaward } from './Achievements'
import { CalcECC } from './Challenges'

export const calculatetax = () => {
  let exp = new Decimal(1)
  let compareB = new Decimal(0)
  let compareC = new Decimal(0)
  G.produceFirst = (player.firstGeneratedCoin.add(player.firstOwnedCoin)).times(G.globalCoinMultiplier).times(
    G.coinOneMulti
  )
    .times(player.firstProduceCoin)
  G.produceSecond = (player.secondGeneratedCoin.add(player.secondOwnedCoin)).times(G.globalCoinMultiplier).times(
    G.coinTwoMulti
  )
    .times(player.secondProduceCoin)
  G.produceThird = (player.thirdGeneratedCoin.add(player.thirdOwnedCoin)).times(G.globalCoinMultiplier).times(
    G.coinThreeMulti
  )
    .times(player.thirdProduceCoin)
  G.produceFourth = (player.fourthGeneratedCoin.add(player.fourthOwnedCoin)).times(G.globalCoinMultiplier).times(
    G.coinFourMulti
  )
    .times(player.fourthProduceCoin)
  G.produceFifth = (player.fifthGeneratedCoin.add(player.fifthOwnedCoin)).times(G.globalCoinMultiplier).times(
    G.coinFiveMulti
  )
    .times(player.fifthProduceCoin)
  G.produceTotal = G.produceFirst.add(G.produceSecond).add(G.produceThird).add(G.produceFourth)
    .add(G.produceFifth)

  if (G.produceFirst.lte(.0001)) {
    G.produceFirst = new Decimal(0)
  }
  if (G.produceSecond.lte(.0001)) {
    G.produceSecond = new Decimal(0)
  }
  if (G.produceThird.lte(.0001)) {
    G.produceThird = new Decimal(0)
  }
  if (G.produceFourth.lte(.0001)) {
    G.produceFourth = new Decimal(0)
  }
  if (G.produceFifth.lte(.0001)) {
    G.produceFifth = new Decimal(0)
  }

  G.producePerSecond = G.produceTotal.times(40)

  if (player.currentChallenge.reincarnation === 6) {
    exp = new Decimal(3 * Math.pow(1 + player.challengecompletions[6] / 25, 2))
  }
  if (player.currentChallenge.reincarnation === 9) {
    exp = new Decimal(0.005)
  }
  if (player.currentChallenge.ascension === 15) {
    exp = new Decimal(0.000005)
  }
  // im doing this to spite xander, basically changes w5x9 to not impact tax scaling in c13 || Sean#7236
  const c13effcompletions = Decimal.max(
    0,
    sumContents(player.challengecompletions).sub(player.challengecompletions[11]).sub(player.challengecompletions[12])
     .sub(player.challengecompletions[13]).sub(player.challengecompletions[14]).sub(player.challengecompletions[15])
      .sub(3 * player.cubeUpgrades[49]).sub(((player.singularityCount >= 15) ? 4 : 0))
      .sub(((player.singularityCount >= 20) ? 1 : 0))
  )
  if (player.currentChallenge.ascension === 13) {
    exp = exp.mul(700 * (1 + 1 / 6 * player.challengecompletions[13]))
    exp = exp.mul(Decimal.pow(1.05, c13effcompletions))
  }
  if (player.challengecompletions[6] > 0) {
    exp = exp.div(1.075)
  }
  let exponent = exp
  exponent = exponent.mul(1 - 1 / 20 * player.researches[51] - 1 / 40 * player.researches[52] - 1 / 80 * player.researches[53]
    - 1 / 160 * player.researches[54] - 1 / 320 * player.researches[55])
  exponent = exponent.mul(1
    - 0.05 / 1800 * (player.achievements[45] + player.achievements[46] + 2 * player.achievements[47])
      * Math.min(player.prestigecounter, 1800))
  exponent = exponent.mul(Math.pow(0.965, CalcECC('reincarnation', player.challengecompletions[6])))
  exponent = exponent.mul(Decimal.pow(6, Decimal.mul(G.rune2level, G.effectiveLevelMult).neg().div(1000)).mul(0.999).add(0.001))
  exponent = exponent.mul(0.01 + .99 * (Math.pow(4, Math.min(0, (400 - G.rune4level) / 1100))))
  exponent = exponent.mul(1 - 0.04 * player.achievements[82] - 0.04 * player.achievements[89] - 0.04 * player.achievements[96]
    - 0.04 * player.achievements[103] - 0.04 * player.achievements[110] - 0.0566 * player.achievements[117]
    - 0.0566 * player.achievements[124] - 0.0566 * player.achievements[131])
  exponent = exponent.mul(Math.pow(
    0.9925,
    player.achievements[118]
      * (player.challengecompletions[6] + player.challengecompletions[7] + player.challengecompletions[8]
        + player.challengecompletions[9] + player.challengecompletions[10])
  ))
  exponent = exponent.mul(0.005 + 0.995 * Math.pow(0.99, player.antUpgrades[2]! + G.bonusant3))
  exponent = exponent.div(Decimal.pow(
      Decimal.log(player.ascendShards.add(1), 10).add(1),
      1 + .2 / 60 * player.challengecompletions[10] * player.upgrades[125] + 0.1 * player.platonicUpgrades[5]
        + 0.2 * player.platonicUpgrades[10] + (G.platonicBonusMultiplier[5] - 1)
    ))
  exponent = exponent.mul(1 - 0.10 * (player.talismanRarity[1 - 1] - 1))
  exponent = exponent.mul(Math.pow(0.98, 3 / 5 * Math.log(1 + player.rareFragments) / Math.log(10) * player.researches[159]))
  exponent = exponent.mul(Math.pow(0.966, CalcECC('ascension', player.challengecompletions[13])))
  exponent = exponent.mul(1 - 0.666 * player.researches[200] / 100000)
  exponent = exponent.mul(1 - 0.666 * player.cubeUpgrades[50] / 100000)
  exponent = exponent.mul(G.challenge15Rewards.taxes)
  if (player.upgrades[121] > 0) {
    exponent = exponent.mul(0.5)
  }

  G.maxexponent = Decimal.floor(Decimal.div(63637.17045365926, exponent)).sub(1)
  const a2 = Decimal.min(G.maxexponent, Decimal.floor(Decimal.log(G.produceTotal.add(1), 10)))

  if (player.currentChallenge.ascension === 13 && G.maxexponent.lte(99999) && player.achievements[249] < 1) {
    // i don't think it makes sense to give the achievement as soon as the challenge is opened
    // as soon as the challenge is opened you don't have enough tax reducers to have max exponent above 100000
    // so for the achievement description to make sense i think it should require at least 1 challenge completion || Dorijanko
    if (c13effcompletions.gte(1)) {
      achievementaward(249)
    }
  }

  if (a2.gte(1)) {
    compareB = Decimal.pow(a2, 2).div(550)
  }

  compareC = Decimal.pow(G.maxexponent, 2).div(550)

  G.taxdivisor = Decimal.pow(1.01, Decimal.mul(compareB, exponent))
  G.taxdivisorcheck = Decimal.pow(1.01, Decimal.mul(compareC, exponent))
}
