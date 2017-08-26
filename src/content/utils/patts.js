export const numPatt = '(((\\d{1,3}((,|\\.|\\s)\\d{3})+|(\\d+))((\\.|,)\\d{1,9})?)|(\\.\\d{1,9}))(,--)?';
export const symbPatts = {
  EUR: '(€|eur(os|o)?)',
  USD: '((us\\s?)?\\$|usd)',
  GBP: '(£|gbp)',
};

export const currPatts = Object.keys(symbPatts)
  .reduce((patts, fromCurr) => {
    const beforePatt = new RegExp(`${symbPatts[fromCurr]}\\s?${numPatt}`, 'gi');
    const afterPatt = new RegExp(`${numPatt}\\s?${symbPatts[fromCurr]}`, 'gi');

    return patts.concat([{ from: fromCurr, patt: beforePatt }, { from: fromCurr, patt: afterPatt }]);
  }, []);

const allSymbPatt = Object.keys(symbPatts).reduce((patt, curr) => `${patt}|${symbPatts[curr].replace(/^\((.*)\)$/, '$1')}`, '\\s|,--');
export const cleanSymbPatt = new RegExp(allSymbPatt, 'gi');

const alphabeticChars = UNICODE_ALPHABETIC;
export const wordPatt = `[${alphabeticChars}]`;
export const nonWordPatt = `[^${alphabeticChars}]`;
