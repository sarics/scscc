import getOptionRowElem from './utils/getOptionRowElem';
import getButtonRowElem from './utils/getButtonRowElem';
import getChangedPrefs from './utils/getChangedPrefs';


const onChange = ({ target }) => {
  const changedPrefs = getChangedPrefs(target);

  if (Object.keys(changedPrefs).length) {
    browser.storage.local.get('preferences')
      .then((storage) => {
        browser.storage.local.set({ preferences: Object.assign({}, storage.preferences, changedPrefs) });
      });
  }
};

const onReset = () => {
  browser.storage.local.set({ currRates: {} });
};

const buildOptionsForm = (options, preferences) => {
  const optionsElem = document.getElementById('options');

  options.forEach((option) => {
    const value = preferences[option.name];
    const optionRowElem = getOptionRowElem(option, value, onChange);

    optionsElem.appendChild(optionRowElem);
  });

  const buttonRowElem = getButtonRowElem('Reset exchange rates', onReset);

  optionsElem.appendChild(buttonRowElem);
};

const refreshOptionsForm = (changedPrefs) => {
  Object.keys(changedPrefs).forEach((prefName) => {
    const optionElem = document.querySelector(`[name="${prefName}"]`);

    if (optionElem) {
      if (optionElem.type === 'radio') {
        const radioElem = document.querySelector(`[name="${prefName}"][value="${changedPrefs[prefName]}"]`);
        if (radioElem) radioElem.checked = true;
      } else if (optionElem.type === 'checkbox') {
        optionElem.checked = changedPrefs[prefName];
      } else {
        optionElem.value = changedPrefs[prefName];
      }
    }
  });
};

Promise.all([browser.runtime.getBackgroundPage(), browser.storage.local.get('preferences')])
  .then(([bgWindow, storage]) => {
    buildOptionsForm(bgWindow.OPTIONS, storage.preferences);

    browser.storage.onChanged.addListener((changes) => {
      if (changes.preferences) {
        const oldPrefs = changes.preferences.oldValue;
        const newPrefs = changes.preferences.newValue;
        const changedPrefs = {};

        Object.keys(changes.preferences.newValue).forEach((prefKey) => {
          if (oldPrefs[prefKey] !== newPrefs[prefKey]) changedPrefs[prefKey] = newPrefs[prefKey];
        });

        if (Object.keys(changedPrefs).length) refreshOptionsForm(changedPrefs);
      }
    });
  });
