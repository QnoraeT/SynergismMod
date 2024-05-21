import Decimal from 'break_eternity.js'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { format } from './Synergism'

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
export const smallestInc = (x = new Decimal(0)): Decimal => {
  if (x.lte(Number.MAX_SAFE_INTEGER)) {
    return new Decimal(1)
  } else {
    return Decimal.pow(2, Decimal.floor(Decimal.log2(x).sub(52)))
  }
}

/**
 * Returns the sum of all contents in an array
 * @param array {(Decimal)[]}
 * @returns {Decimal}
 */
export const sumContents = (array: (number | Decimal)[]): Decimal => {
  let sum = new Decimal(0)
  for (let i in array) {
    sum = sum.add(array[i])
  }
  return sum
}

/**
 * Returns the product of all contents in an array
 * @param array {Decimal[]}
 * @returns {Decimal}
 */
export const productContents = (array: (number | Decimal)[]): Decimal => {
  let sum = new Decimal(0)
  for (let i in array) {
    sum = sum.mul(array[i])
  }
  return sum
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
