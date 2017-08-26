import { cleanSymbPatt, wordPatt } from './patts';

const alphabeticPatt = new RegExp(wordPatt);
const alphaNumericPatt = new RegExp(wordPatt.replace(/^\[/, '[0-9'));

export const checkPriceSpecCases = (txt, match) => {
  const charind = txt.indexOf(match);

  const bChar = txt.charAt(charind - 1);
  const aChar = txt.charAt(charind + match.length);

  // in case text is like: somestring1 234 $
  // if there is a word character before it
  if (/^\d/.test(match) && alphabeticPatt.test(bChar)) {
    if (/^\d+\s+\d/.test(match)) return match.replace(/^\d+\s+/, ''); // convert only 234 $
    return null;
  }

  if (alphaNumericPatt.test(bChar) || alphaNumericPatt.test(aChar)) return null;

  return match;
};


export const cleanPrice = (price) => {
  // remove currency symbols and spaces
  let cleanedPrice = price.replace(cleanSymbPatt, '');

  // if no decimal separator
  // remove possible "." or "," thousand separators
  if (!/(\.|,)\d{1,2}$/.test(cleanedPrice)) cleanedPrice = cleanedPrice.replace(/\.|,/g, '');
  // if decimal separator is "."
  // remove possible "," thousand separators
  else if (/\.\d{1,2}$/.test(cleanedPrice)) cleanedPrice = cleanedPrice.replace(/,/g, '');
  // if decimal separptor is ","
  else {
    // remove possible "." thousand separators
    cleanedPrice = cleanedPrice.replace(/\./g, '');
    // replace dec separator to "."
    cleanedPrice = cleanedPrice.replace(/,/g, '.');
  }

  return cleanedPrice;
};


export const formatPrice = (price, preferences) => {
  // set rounding
  let formattedPrice = (preferences.round) ? price.toFixed(0) : price.toFixed(2);

  // set decimal separator
  if (preferences.sepDec !== '.') formattedPrice = formattedPrice.replace('.', preferences.sepDec);

  // set thousand separator
  if (preferences.sepTho !== '') {
    for (let i = ((preferences.round) ? formattedPrice.length : formattedPrice.indexOf(preferences.sepDec)) - 3; i > 0; i -= 3) {
      formattedPrice = formattedPrice.slice(0, i) + preferences.sepTho + formattedPrice.slice(i);
    }
  }

  // add symbol
  if (preferences.symbPos === 'a') {
    formattedPrice = formattedPrice + ((preferences.symbSep) ? ' ' : '') + preferences.symbol;
  } else {
    formattedPrice = preferences.symbol + ((preferences.symbSep) ? ' ' : '') + formattedPrice;
  }

  return formattedPrice;
};
