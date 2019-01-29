// Jovi's code-generator loader.
// Generators create code in a target language using a Rockstar AST.
// The only supported generator (for now) generates JavaScript.

/**
 * Loads and returns the generator for the given target language.
 * The language's name is not case-sensitive.
 */
function loadGenerator(targetLanguage) {
  // alias
  if (targetLanguage === "js") targetLanguage = "javascript"

  // try to load the language's generator
  if (!/^[a-z]+$/i.test(targetLanguage)) {
    throw { message: `Target language '${targetLanguage}' is not supported`, language: targetLanguage }
  }

  try {
    return require(`./${targetLanguage.toLowerCase()}.js`)
  }
  catch (err) {
    throw { message: err.message, language: targetLanguage, cause: err }
  }
}

module.exports = { loadGenerator }
