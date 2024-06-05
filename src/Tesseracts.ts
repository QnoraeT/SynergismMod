import { player } from './Synergism'
import { Globals as G } from './Variables'
import Decimal from 'break_eternity.js'

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
    let power = 1
    let mult = 1
    if (Decimal.gte(tesseractArray[i], 1000) && i !== 5) {
      power = G.giftDRPower[i]
      mult *= Math.pow(1000, 1 - G.giftDRPower[i])
    }

    G.tesseractBonusMultiplier[i + 1] = Decimal.mul(mult, G.giftbase[i]).mul(Decimal.pow(tesseractArray[i], power)).mul(G.hypercubeBonusMultiplier[i + 1]!).add(1)
  }
}
