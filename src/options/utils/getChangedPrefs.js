export default (target) => {
  const prefName = target.name;
  const prefValue = target.type === 'checkbox' ? target.checked : target.value;
  const changedPrefs = {};
  changedPrefs[prefName] = prefValue;

  // change the symbol on currency change
  if (prefName === 'toCurr') {
    changedPrefs.symbol = prefValue;
  }

  // if a space inserted before the symbol, remove it, and set symbSep to true
  if (prefName === 'symbol' && (prefValue.charAt(0) === ' ' || prefValue.charAt(prefValue.length - 1) === ' ')) {
    const symbSepElem = document.getElementById('option-symbSep');
    if (!symbSepElem.checked) changedPrefs.symbSep = true;

    target.value = prefValue.trim();
    delete changedPrefs.symbol;
  }

  // don't const to set the same thousand and decimal separator
  if (prefName === 'sepTho' && [',', '.'].indexOf(prefValue) !== -1) {
    const sepDecElem = document.getElementById('option-sepDec');
    if (sepDecElem.value === prefValue) {
      changedPrefs.sepDec = prefValue === ',' ? '.' : ',';
    }
  } else if (prefName === 'sepDec') {
    const sepThoElem = document.getElementById('option-sepTho');
    if (sepThoElem.value === prefValue) {
      changedPrefs.sepTho = prefValue === ',' ? '.' : ',';
    }
  }

  return changedPrefs;
};
