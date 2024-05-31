import { player } from './Synergism'
import { sumContentsDecimal } from './Utility'
import { Globals as G } from './Variables'

import Decimal from 'break_eternity.js'
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
    exp = new Decimal(Decimal.div(player.challengecompletions[6], 25).add(1).pow(2).mul(3))
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
    Decimal.sub(sumContentsDecimal(player.challengecompletions), player.challengecompletions[11]).sub(player.challengecompletions[12])
    .sub(player.challengecompletions[13]).sub(player.challengecompletions[14]).sub(player.challengecompletions[15])
    .sub(player.cubeUpgrades[49].mul(3)).sub(((player.singularityCount >= 15) ? 4 : 0))
    .sub(((player.singularityCount >= 20) ? 1 : 0))
  )
  if (player.currentChallenge.ascension === 13) {
    exp = exp.mul(Decimal.div(player.challengecompletions[13], 6).add(1).mul(700))
    exp = exp.mul(Decimal.pow(1.05, c13effcompletions))
  }
  if (player.challengecompletions[6].gt(0)) {
    exp = exp.div(1.075)
  }
  let exponent = exp
  exponent = exponent.mul(Decimal.sub(1, Decimal.div(player.researches[51], 20).add(Decimal.div(player.researches[52], 40)).add(Decimal.div(player.researches[53], 80)).add(Decimal.div(player.researches[54], 160)).add(Decimal.div(player.researches[55], 320))))
  exponent = exponent.mul(Decimal.sub(1, Decimal.add(player.achievements[45], player.achievements[46]).add(Decimal.mul(2, player.achievements[47])).mul(Decimal.min(player.prestigecounter, 1800)).mul(0.05 / 1800)))
  exponent = exponent.mul(Decimal.pow(0.965, CalcECC('reincarnation', player.challengecompletions[6])))
  exponent = exponent.mul(Decimal.pow(6, Decimal.mul(G.rune2level, G.effectiveLevelMult).div(-1000)).mul(0.999).add(0.001))
  exponent = exponent.mul(Decimal.pow(4, Decimal.min(0, Decimal.sub(400, G.rune4level).div(1100))).mul(0.99).add(0.01))

  exponent = exponent.mul(1 - 0.04 * player.achievements[82] - 0.04 * player.achievements[89] - 0.04 * player.achievements[96]
    - 0.04 * player.achievements[103] - 0.04 * player.achievements[110] - 0.0566 * player.achievements[117]
    - 0.0566 * player.achievements[124] - 0.0566 * player.achievements[131])
  exponent = exponent.mul(Decimal.pow(
    0.9925,
    Decimal.mul(player.achievements[118], Decimal.add(player.challengecompletions[6], player.challengecompletions[7]).add(player.challengecompletions[8])
      .add(player.challengecompletions[9]).add(player.challengecompletions[10]))
  ))
  exponent = exponent.mul(Decimal.pow(0.99, Decimal.add(player.antUpgrades[2]!, G.bonusant3)).mul(0.995).add(0.005))
  exponent = exponent.div(
    Decimal.pow(
      player.ascendShards.add(1).log10().add(1),
      Decimal.mul(player.challengecompletions[10], player.upgrades[125]).mul(.2 / 60).add(1)
      .add(Decimal.mul(0.1, player.platonicUpgrades[5]))
      .add(Decimal.mul(0.2, player.platonicUpgrades[10] ))
      .add(Decimal.sub(G.platonicBonusMultiplier[5], 1))
    ))
  exponent = exponent.mul(Decimal.sub(1, Decimal.sub(player.talismanRarity[1 - 1], 1).mul(0.1)))
  exponent = exponent.mul(Decimal.pow(0.98, Decimal.add(player.rareFragments, 1).log10().mul(player.researches[159]).mul(0.6)))
  
  exponent = exponent.mul(Decimal.pow(0.966, CalcECC('ascension', player.challengecompletions[13])))
  exponent = exponent.mul(Decimal.sub(1, Decimal.div(player.researches[200], 100000).mul(0.666)))
  exponent = exponent.mul(Decimal.sub(1, Decimal.div(player.cubeUpgrades[50], 100000).mul(0.666)))
  exponent = exponent.mul(G.challenge15Rewards.taxes)
  if (Decimal.gt(player.upgrades[121], 0)) {
    exponent = exponent.mul(0.5)
  }
  // Cap the calculation overflow bug || httpsnet
  // cap ._.
  // if (exponent < 1e-300) {
  //   exponent = 1e-300
  // }
  G.maxexponent = Decimal.div(275, (Decimal.log(1.01, 10).mul(exponent))).floor().sub(1)
  const a2 = G.maxexponent.min(G.produceTotal.add(1).log10().floor())

  if (player.currentChallenge.ascension === 13 && G.maxexponent.lte(99999) && player.achievements[249] < 1) {
    // i don't think it makes sense to give the achievement as soon as the challenge is opened
    // as soon as the challenge is opened you don't have enough tax reducers to have max exponent above 100000
    // so for the achievement description to make sense i think it should require at least 1 challenge completion || Dorijanko
    if (c13effcompletions.gte(1)) {
      achievementaward(249)
    }
  }

  if (a2.gte(1)) {
    compareB = a2.pow(2).div(550)
  }

  compareC = G.maxexponent.pow(2).div(550)

  G.taxdivisor = Decimal.pow(1.01, compareB.mul(exponent))
  G.taxdivisorcheck = Decimal.pow(1.01, compareC.mul(exponent))
}
