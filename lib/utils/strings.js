// Utility functions for string processing.

/**
 * Counts the alphabetical characters in a string, case-insensitively.
 */
function countAlphabeticalChars(str) {
  return str.replace(/[^a-zäëïöüÿāēīōū]/ig, "").length
}

/**
 * Reports whether the given string consists solely of alphabetical characters,
 * and starts with a capital letter. Returns false for empty strings.
 */
function isCapitalized(str) {
  return /^[a-zäëïöüÿāēīōū]+$/i.test(str) && /^[A-ZÄËÏÖÜŸĀĒĪŌŪ]/.test(str)
}

/**
 * Reports whether the given string consists solely of lowercase alphabetical characters.
 * Returns false for empty strings.
 */
function isLowerCase(str) {
  return /^[a-zäëïöüÿāēīōū]+$/.test(str)
}

/**
 * Reports whether the given string consists solely of whitespace,
 * as defined by JavaScript's regex engine. Returns false for empty strings.
 */
function isWhitespace(str) {
  return /^\s+$/.test(str)
}

/**
 * Reports whether the given string consists solely of Unicode control characters.
 * Returns false for empty strings.
 */
function isControl(str) {
  return /^[\u{0000}-\u{001f}\u{007f}\u{0080}-\u{009f}]+$/u.test(str)
}

/**
 * Reports whether the given string is numeric (integer or floating point).
 * Commas are allowed as group delimiters, but adjacent commas aren't allowed.
 * Returns false for empty strings.
 */
function isNumeric(str) {
  if (!str || !str.length) return false

  if ("+-".includes(str[0])) str = str.slice(1)  // a single leading plus/minus is okay
  if (!/[1234567890]+/.test(str)) return false
  if (!/^[1234567890,.]+$/.test(str)) return false

  if (str.replace(/[^.]/ig, "").length > 1) return false  // only one period allowed
  if (str.includes(",,")) return false                    // adjacent commas not allowed

  return true
}

/**
 * Normalizes linebreaks in a string, converting both \r\n and bare \r to \n,
 * and ensuring that the last line in the string is terminated with a linebreak.
 */
function normalizeLinebreaks(str) {
  str = String(str).replace(/\r\n?/g, "\n")
  if (str.slice(-1) !== "\n") str += "\n"
  return str
}

/**
 * Pads a string on the left with an arbitrary character.
 * You must pass a string containing a single character in the `padChar`  parameter.
 */
function padLeft(str, width, padChar) {
  const padCount = width - String(str).length
  return (padCount > 0) ? padChar.repeat(padCount) + str : str
}

/**
 * Reports whether the given character is common English punctuation.
 */
function isPunctuation(ch) {
  return ".,;:?!".includes(ch)
}

/**
 * Splits a string into its "base" and (trailing) "punctuation" parts,
 * deferring to isPunctuation() to decide which characters are trailing punctuation.
 * Internal punctuation, i.e. followed by non-punctuation, is part of the "base".
 */
function splitPunctuation(str) {
  let firstPuncIndex
  for (firstPuncIndex = str.length; firstPuncIndex > 0; firstPuncIndex--) {
    if (!isPunctuation(str[firstPuncIndex - 1])) break
  }

  return {
    base: str.slice(0, firstPuncIndex),
    punctuation: str.slice(firstPuncIndex)
  }
}

module.exports = {
  countAlphabeticalChars,
  isCapitalized,
  isLowerCase,
  isWhitespace,
  isControl,
  isNumeric,
  normalizeLinebreaks,
  padLeft,
  isPunctuation,
  splitPunctuation
}
