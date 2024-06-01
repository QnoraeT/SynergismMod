import Decimal from 'break_eternity.js'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { format } from './Synergism'

/**
 * @param {Decimal} num the input
 * @param {any} type what type of scaling/softcap should be used
 * @param {boolean} inverse if there should be an inverse for it
 * @param {Decimal} start when the scale/softcap starts
 * @param {Decimal} str the overall strength of the scaling/softcap (1.0 = 100%, 0.5 = 50%) taken as a power of powScale
 * @param {Decimal} powScale inital value of the scaling/softcap that gets acted upon by str
 * @returns {Decimal}
 */
export const scale = (num: Decimal, type: number | string, inverse: boolean, start: Decimal, str: Decimal, powScale: number | Decimal): Decimal => {
  if (num.lte(start)) { return num; }
  str = Decimal.pow(powScale, str);
  switch (type) {
      // Polynomial
      case 0:
      case 0.1:
      case "P":
      case "P1":
          return inverse
                  ? num.sub(start).mul(str).div(start).add(1).root(str).mul(start)
                  : num.div(start).pow(str).sub(1).mul(start).div(str).add(start)
      case 0.2: // alemaninc
      case "P2":
          return inverse
                  ? num.div(start).root(str).sub(1).mul(str).add(1).mul(start)
                  : num.div(start).sub(1).div(str).add(1).pow(str).mul(start)
      // Exponential
      case 1:
      case 1.1:
      case "E":
      case "E1":
          return inverse 
                  ? Decimal.min(num, num.div(start).log(str).add(1).mul(start))
                  : Decimal.max(num, Decimal.pow(str, num.div(start).sub(1)).mul(start))
      case 1.2:
      case "E2":
          return inverse
                  ? num.mul(str).mul(str.ln()).div(start).lambertw().mul(start).div(str.ln())
                  : Decimal.pow(str, num.div(start).sub(1)).mul(num)
      case 1.3: // alemaninc
      case "E3":
          return inverse // poly exponential scaling
                  ? num.div(start).ln().mul(str.sub(1)).add(1).root(str.sub(1)).mul(start)
                  : num.div(start).pow(str.sub(1)).sub(1).div(str.sub(1)).exp().mul(start)
      // Semi-exponential
      case 2: 
      case 2.1:
      case "SE":
      case "SE1":
          return inverse // steep scaling
                  ? Decimal.pow(start, num.sub(start).mul(str).add(start).log(start).root(str))
                  : Decimal.pow(start, num.log(start).pow(str)).sub(start).div(str).add(start)
      case 2.2:
      case "SE2": // very shallow scaling
          return inverse
                  ? Decimal.pow(start, num.log(start).sub(1).mul(str).add(1).root(str))
                  : Decimal.pow(start, num.log(start).pow(str).sub(1).div(str).add(1))
      // convergent
      case 3: // alemaninc
      case 3.1:
      case "C":
      case "C1":
          return inverse
                  ? str.mul(num).add(start.pow(2)).sub(start.mul(num).mul(2)).div(str.sub(num))
                  : str.mul(num).sub(start.pow(2)).div(str.sub(start.mul(2)).add(num));
      default:
          throw new Error(`Scaling type ${type} doesn't exist`);
  }
}

export const isDecimal = (o: unknown): o is Decimal =>
  o instanceof Decimal
  || (typeof o === 'object'
    && o !== null
    && Object.keys(o).length === 2
    && 'mantissa' in o
    && 'exponent' in o)

/**
 * This function calculates the smallest integer increment/decrement that can be applied to a number that is
 * guaranteed to affect the numbers value
 * @param x
 * @returns {number} 1 if x < 2^53 and 2^ceil(log2(x)-53) otherwise
 * Since ceil(log2(x)-53) was 53 until 2^53+23, I changed it to floor(log2(x)-52)
 * This is incremented to 53 at 2^53-21 and is probably guaranteed thereafter. from by httpsnet
 */
export const smallestInc = (x = 0): number => {
  if (x <= Number.MAX_SAFE_INTEGER) {
    return 1
  } else {
    return 2 ** Math.floor(Math.log2(x) - 52)
  }
}

/**
 * Returns the sum of all contents in an array
 * @param array {(number|string)[]}
 * @returns {number}
 */
export const sumContentsNumber = (array: number[]): number => {
  let sum = 0
  for (let i = 0; i < array.length; i++) {
    sum = sum + array[i]
  }
  return sum
}

export const sumContentsDecimal = (array: (number | Decimal)[]): Decimal => {
  let sum = new Decimal(0)
  for (let i = 0; i < array.length; i++) {
    sum = sum.add(array[i])
  }
  return sum
}

/**
 * Returns the product of all contents in an array
 * @param array {number[]}
 * @returns {number}
 */
export const productContentsNumber = (array: number[]): number => {
  let product = 1
  for (let i = 0; i < array.length; i++) {
    product = product * array[i]
  }
  return product
}

export const productContentsDecimal = (array: (string | number | Decimal)[]): Decimal => {
  let product = new Decimal(1)
  for (let i = 0; i < array.length; i++) {
    product = product.mul(array[i])
  }
  return product
}

export const sortWithIndices = (toSort: number[]) => {
  return Array
    .from([...toSort.keys()])
    .sort((a, b) => toSort[a] < toSort[b] ? -1 : +(toSort[b] < toSort[a]))
}

/**
 * Identical to @see {DOMCacheGetOrSet} but casts the type.
 * @param id {string}
 */
export const getElementById = <T extends HTMLElement>(id: string) => DOMCacheGetOrSet(id) as T

/**
 * Remove leading indents at the beginning of new lines in a template literal.
 */
export const stripIndents = (raw: TemplateStringsArray, ...args: unknown[]): string => {
  const r = String.raw({ raw }, ...args)

  return r
    .replace(/^[^\S\r\n]+/gm, '')
    .trim()
}

/**
 * Pads an array (a) with param (b) (c) times
 * @param a array to be padded
 * @param b item to pad to array
 * @param length Length to pad array to
 */
export const padArray = <T>(a: T[], b: T, length: number) => {
  for (let i = 0; i < length; i++) {
    if (!(i in a)) {
      a[i] = b
    }
  }

  return a
}

export const updateClassList = (targetElement: string, additions: string[], removals: string[]) => {
  const target = DOMCacheGetOrSet(targetElement)
  for (const addition of additions) {
    target.classList.add(addition)
  }
  for (const removal of removals) {
    target.classList.remove(removal)
  }
}

export const btoa = (s: string) => {
  try {
    return window.btoa(s)
  } catch (err) {
    console.error('An error occurred:', err)
    // e.code = 5
    return null
  }
}

/**
 * Creates a string of the ordinal representation of an integer.
 * @param int An integer, which can be negative or positive.
 * @returns A string which follows the conventions of ordinal numbers
 *          in standard English
 */
export const toOrdinal = (int: number): string => {
  let suffix = 'th'
  if (int % 10 === 1) {
    suffix = (int % 100 === 11) ? 'th' : 'st'
  }
  if (int % 10 === 2) {
    suffix = (int % 100 === 12) ? 'th' : 'nd'
  }
  if (int % 10 === 3) {
    suffix = (int % 100 === 13) ? 'th' : 'rd'
  }

  return format(int, 0, true) + suffix
}

export const formatMS = (ms: number) =>
  Object.entries({
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60
  })
    .filter((f) => f[1] > 0)
    .map((t) => `${t[1]}${t[0]}`)
    .join(' ') || '0s'

export const formatS = (s: number) => {
  return formatMS(1000 * s)
}

export const cleanString = (s: string): string => {
  let cleaned = ''

  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)

    cleaned += code > 255 ? '_' : s[i]
  }

  return cleaned
}

export function assert (condition: unknown): asserts condition {
  if (!condition) {
    throw new TypeError('assertion failed')
  }
}

export function limitRange (number: number, min: number, max: number): number {
  if (number < min) {
    return max
  } else if (number > max) {
    return min
  }

  return number
}

export const createDeferredPromise = <T>() => {
  let resolve!: (unknown: T) => void
  let reject!: (err: Error) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { resolve, reject, promise }
}

/**
 * ((x + start) ^ poly / (poly * start ^ (poly - 1))) - start / poly
 * @param {Decimal} x 
 * @param {Decimal} poly 
 * @param {Decimal} start 
 * @param {Boolean} inverse
 * @returns {Decimal}
 */
export const smoothPoly = (x: Decimal, poly: Decimal, start: Decimal, inverse: boolean): Decimal => {
  return inverse
      ? x.add(start.div(poly)).mul(poly.mul(start.pow(poly.sub(1)))).root(poly).sub(start)
      : x.add(start).pow(poly).div(poly.mul(start.pow(poly.sub(1)))).sub(start.div(poly))
}