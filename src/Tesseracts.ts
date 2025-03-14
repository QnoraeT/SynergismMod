import Decimal from 'break_eternity.js'
import { player } from './Synergism'
import { Globals as G } from './Variables'

export const calculateTesseractBlessings = () => {
  // The visual updates are handled in visualUpdateCubes()
  const tesseractArray = [
    player.tesseractBlessings.accelerator,
    player.tesseractBlessings.multiplier,
    player.tesseractBlessings.offering,
    player.tesseractBlessings.runeExp,
    player.tesseractBlessings.obtainium,
    player.tesseractBlessings.antSpeed,
    player.tesseractBlessings.antSacrifice,
    player.tesseractBlessings.antELO,
    player.tesseractBlessings.talismanBonus,
    player.tesseractBlessings.globalSpeed
  ]

  for (let i = 0; i < 10; i++) {
    const scPow = Decimal.add(G.blessingDRPower[i]!, G.giftDRPower[i])
    let amt = tesseractArray[i]

    if (Decimal.gte(tesseractArray[i], 1000)) {
      amt = Decimal.div(amt, 1000).pow(scPow).sub(1).mul(1000).div(scPow).add(1000)
    }

    G.tesseractBonusMultiplier[i + 1] = amt
    G.tesseractBonusMultiplier[i + 1] = Decimal.mul(
      G.tesseractBonusMultiplier[i + 1]!,
      G.hypercubeBonusMultiplier[i + 1]!
    ).mul(G.giftbase[i]).add(1)
  }
}
