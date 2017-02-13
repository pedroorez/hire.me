"use strict"; // eslint-disable-line
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const alphabetLength = alphabet.length;

module.exports.gen = () => {
  let alias = []; // eslint-disable-line
  for (let i = 0; i < 6; i += 1) {
    alias[i] = alphabet[Math.floor(Math.random() * alphabetLength)];
  }
  return alias.join('');
};

module.exports.check = alias => !alias.split('').some(v => alphabet.indexOf(v) < 0);
