// Import necessary packages
const syllables = require('syllables');
const Phonetics = require('phonetics');

// Function to determine if a word is difficult to pronounce
function isDifficultToPronounce(word) {

    console.log(word);
    // Define thresholds for various factors
    const lengthThreshold = 6; // Word length threshold
    const complexityThreshold = 10; // Phonetic complexity threshold (arbitrary)

    // Check word length
    if (word.length > lengthThreshold) {
        return true;
    }

    // Count syllables
    const syllables_words = syllables(word);
    if (syllables_words > 5) { // Adjust syllable threshold as needed
        return true;
    }

    // 2. Consonant Clusters
  const consonantClusterRegex = /[bcdfghjklmnpqrstvwxyz]{3,}/gi;
  const clusters = word.match(consonantClusterRegex);

  console.log(clusters);

  // 3. Phoneme Complexity (based on your data)
  const complexityValues = {
    m: 0, a: 5, h: 5, g: 2, t: 0, d: 0, f: 6, s: 5, w: 0, c: 5, n: 0, b: 3, i: 3, e: 2, o: 5,
  };

  const wordComplexity = word.split("").reduce((acc, char) => {
    return acc + (complexityValues[char.toLowerCase()] || 0);
  }, 0);

  // 4. Combine factors and adjust thresholds as needed
  return (clusters && clusters.length) || wordComplexity > 15;


}

// Function to get difficult-to-pronounce words from an English paragraph
function getDifficultWordsFromParagraph(paragraph) {
    // Tokenize the paragraph into words
    const words = paragraph.split(/\s+/);

    // Filter difficult-to-pronounce words
    const difficultWords = words.filter(word => isDifficultToPronounce(word));

    console.log(difficultWords)
    return difficultWords;

}

// Export the function
module.exports = {getDifficultWordsFromParagraph};
