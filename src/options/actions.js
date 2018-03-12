const actions = {
  preferences: {
    handleChange: ({ type, name, value }) => (preferences) => {
      const changedPrefs = {
        [name]: type === 'text' ? value.trim() : value,
      };

      // change the symbol on currency change
      if (name === 'toCurr') {
        changedPrefs.symbol = value;
      }

      // if a space inserted before or after the symbol, remove it, and set symbSep to true
      if (name === 'symbol' && value !== value.trim() && !preferences.symbSep) {
        changedPrefs.symbSep = true;
      }

      // don't let to set the same thousand and decimal separator
      if (name === 'sepTho' && preferences.sepDec === value) {
        changedPrefs.sepDec = value === ',' ? '.' : ',';
      }
      if (name === 'sepDec' && preferences.sepTho === value) {
        changedPrefs.sepTho = value === ',' ? '.' : ',';
      }

      const newPrefs = { ...preferences, ...changedPrefs };

      browser.storage.local.set({ preferences: newPrefs });
    },

    set: (newPrefs) => () => newPrefs,
  },
};

export default actions;
