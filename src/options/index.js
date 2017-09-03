import getOptionTrElem from './utils/getOptionTrElem';
import getButtonTrElem from './utils/getButtonTrElem';
import getChangedPrefs from './utils/getChangedPrefs';


const onChange = (event) => {
  const target = event.target;
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
  const tableElem = document.getElementById('options');

  options.forEach((option) => {
    const value = preferences[option.name];
    const optionTrElem = getOptionTrElem(option, value, onChange);

    tableElem.appendChild(optionTrElem);
  });

  const buttonTrElem = getButtonTrElem('Reset exchange rates', onReset);

  tableElem.appendChild(buttonTrElem);
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
