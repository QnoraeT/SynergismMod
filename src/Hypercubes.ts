import Decimal from 'break_eternity.js'
import { player } from './Synergism'
import { Globals as G } from './Variables'

type Bless = keyof typeof player['hypercubeBlessings']

export const calculateHypercubeBlessings = () => {
  // The visual updates are handled in visualUpdateCubes()

  // we use Object.keys here instead of a for-in loop because we need the index of the key.
  const keys = Object.keys(player.hypercubeBlessings)

  for (const key of keys) {
    const idx = keys.indexOf(key) + 1
    const scPow = G.benedictionDRPower[idx]!
    let obj = player.hypercubeBlessings[key as Bless]

    if (Decimal.gte(obj, 1000)) {
      obj = Decimal.div(obj, 1000).pow(scPow).sub(1).mul(1000).div(scPow).add(1000)
    }

    G.hypercubeBonusMultiplier[idx] = obj
    G.hypercubeBonusMultiplier[idx] = Decimal.mul(G.hypercubeBonusMultiplier[idx]!, G.platonicBonusMultiplier[4]).mul(
      G.benedictionbase[idx]!
    ).add(1)
  }
}
