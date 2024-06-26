import { player } from './Synergism'
import { Globals as G } from './Variables'
import Decimal from 'break_eternity.js'

export const calculatePlatonicBlessings = () => {
  // The visual updates are handled in visualUpdateCubes()
  const platonicArray = Object.values(player.platonicBlessings)
  const DRThreshold = [4e6, 4e6, 4e6, 8e4, 1e4, 1e4, 1e4, 1e4]
  for (let i = 0; i < platonicArray.length; i++) {
    const scPow = G.platonicDRPower[i]
    let amt = platonicArray[i]
    
    if (i === 6 && Decimal.gte(amt, 1e20)) {
      amt = Decimal.div(amt, 1e20).pow(0.5).sub(1).mul(1e20).div(0.5).add(1e20)
    }

    if (Decimal.gte(amt, DRThreshold[i])) {
      amt = Decimal.div(amt, DRThreshold[i]).pow(scPow).sub(1).mul(DRThreshold[i]).div(scPow).add(DRThreshold[i])
    }
  
    G.platonicBonusMultiplier[i] = amt
    G.platonicBonusMultiplier[i] = Decimal.mul(G.platonicBonusMultiplier[i]!, G.platonicCubeBase[i]).add(1)

    if (i === 5 && G.platonicBonusMultiplier[i].gte(2)) {
      G.platonicBonusMultiplier[i] = G.platonicBonusMultiplier[i].sub(1).ln().div(10).add(2)
    }
  }
}
