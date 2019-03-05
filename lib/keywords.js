// All of the Rockstar keywords.

// variables
const PREFIXES = ["a", "an", "the", "my", "your"]
const PRONOUNS = ["it", "he", "she", "him", "her", "they", "them", "ze", "hir", "zie", "zir", "xe", "xem", "ve", "ver"]

// assigment operator
const ASSIGMENT = ["is", "was", "were", "says"]  // !!! should include "are" (not for poetic literals? os is that an oversight in the spec?)

// arithmetic operators
const ADDITION = ["plus", "with"]
const SUBTRACTION = ["minus", "without"]
const MULTIPLICATION = ["times", "of"]
const DIVISION = ["over"]
const ALL_ARITHMETIC = [].concat(ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION)

// comparison operators
const COMPARISON = ["is", "isn't", "isnt", "ain't", "aint"]  // !!! should also allow "are", "aren't", "arent"
const GREATER = ["higher", "greater", "bigger", "stronger"]
const LESS = ["lower", "less", "smaller", "weaker"]
const GREATER_OR_EQUAL = ["high", "great", "big", "strong"]
const LESS_OR_EQUAL = ["low", "little", "small", "weak"]

// type literals ("literal words")
const UNDEFINED = ["mysterious"]
const NULL = ["null", "nothing", "nowhere", "nobody", "empty", "gone"]
const TRUE = ["true", "right", "yes", "ok"]
const FALSE = ["false", "wrong", "no", "lies"]
const MAYBE = ["maybe", "definitely"]  // reserved but unused
const ALL_LITERALS = [].concat(UNDEFINED, NULL, TRUE, FALSE, MAYBE)

// built-in I/O
const INPUT = ["listen"]
const OUTPUT = ["say", "shout", "whisper", "scream"]

// other reserved keywords not mentioned above
const OTHER_KEYWORDS = [
  "put", "into",                             // assignment
  "build", "up", "knock", "down",            // increment and decrement
  "if", "else", "while", "until",            // conditionals and loops
  "break", "continue", "take", "to", "top",  // loop flow control
  "takes", "taking", "give", "back",         // functions
  "as", "than", "not",                       // used in comparison expressions
  "and", "or",                               // used in expressions, function declarations
]

// all the keywords
const ALL_KEYWORDS = [].concat(
  PREFIXES, PRONOUNS,
  ASSIGMENT,
  ALL_ARITHMETIC,
  COMPARISON, GREATER, LESS, GREATER_OR_EQUAL, LESS_OR_EQUAL,
  ALL_LITERALS,
  INPUT, OUTPUT,
  OTHER_KEYWORDS
)

module.exports = {
  PREFIXES, PRONOUNS,
  ASSIGMENT,
  ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, ALL_ARITHMETIC,
  COMPARISON, GREATER, LESS, GREATER_OR_EQUAL, LESS_OR_EQUAL,
  UNDEFINED, NULL, TRUE, FALSE, MAYBE, ALL_LITERALS,
  INPUT, OUTPUT,
  OTHER_KEYWORDS,
  ALL_KEYWORDS
}
