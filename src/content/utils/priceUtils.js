export const checkPriceSpecCases = (txt, match, fromCurr) => {
  let chckchar;
  const charind = txt.indexOf(match);
  let checkedMatch = match;

  // skip other dollars
  // Australian (A$)
  // Barbadian (Bds$)
  // Belizean (BZ$)
  // Brunei (B$)
  // Canadian (CA$)
  // Cayman Islands (CI$)
  // East Caribbean (EC$)
  // Fiji (FJ$)
  // Guyanese (G$)
  // Hong Kong (HK$)
  // Jamaican (J$)
  // Liberian (L$ or LD$)
  // Namibian (N$)
  // New Zealand (NZ$)
  // Singaporean (S$)
  // Soloman Islands (SI$)
  // Taiwanese (NT$)
  // Trinidad and Tobago (TT$)
  // Tuvaluan (TV$)
  // Zimbabwean (Z$)
  // Chilean (CLP$)
  // Colombian (COL$)
  // Dominican (RD$)
  // Mexican (Mex$)
  // Nicaraguan córdoba (C$)
  // Brazilian real (R$)
  if (fromCurr === 'USD' && match.charAt(0) === '$') {
    chckchar = txt.charAt(charind - 1);
    if (
      /\w/.test(chckchar) &&
      /(A|Bds|BZ|B|CA|CI|EC|FJ|G|HK|J|L|LD|N|NZ|S|SI|NT|TT|TV|Z|CLP|COL|RD|Mex|C|R)$/.test(txt.slice(0, charind))
    ) return null;
  }

  // in case text is like: masseur 1234
  // or
  // in case text is like: 1234 europe
  const sind = match.search(/eur|usd|gbp/i);
  if (sind !== -1) {
    if (sind === 0) { // starts with eur(os)/usd/gbp
      // if there is any word character before it, skip it
      chckchar = txt.charAt(charind - 1);
      if (/\w/.test(chckchar)) return null;
    } else { // ends with eur(os)/usd/gbp
      // if there is any word character after it, skip it
      chckchar = txt.charAt(charind + match.length);
      if (/\w/.test(chckchar)) return null;
    }
  }

  // in case text is like: somestring1 234 $
  if (match.charAt(0).search(/\d/) !== -1) {
    // if there is a word character before it
    chckchar = txt.charAt(charind - 1);
    if (chckchar.search(/\w/) !== -1) {
      checkedMatch = match.replace(/^\d+\s/, '');  // convert only 234 $
    }
  }

  return checkedMatch;
};


export const cleanPrice = (price) => {
  // remove currency symbols and spaces
  let cleanedPrice = price.replace(/€|eur(os|o)?|\$|usd|£|gbp|,--|\s/ig, '');

  // if no decimal separator
  // remove possible "." or "," thousand separators
  if (cleanedPrice.search(/(\.|,)\d{1,2}$/) === -1) cleanedPrice = cleanedPrice.replace(/\.|,/g, '');
  // if decimal separator is "."
  // remove possible "," thousand separators
  else if (price.search(/\.\d{1,2}$/) !== -1) cleanedPrice = cleanedPrice.replace(/,/g, '');
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
