/**
 * It returns a random string of a given length, where each character is a random letter from the alphabet.
 * @param {number} [length=1] - The length of the string to be returned.
 * @returns A random letter from the alphabet.
 */
const utilRandomAlphabetWithLength = (length = 1) => {
    let result = "";
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
};

module.exports = utilRandomAlphabetWithLength;