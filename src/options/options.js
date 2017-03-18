import './options.html';
import './options.css';

let options;

browser.runtime.getBackgroundPage()
  .then((bgWindow) => {
    options = bgWindow.OPTIONS;

    return browser.storage.local.get('preferences');
  })
  .then((storage) => {
    buildOptionsForm(storage.preferences);

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

function buildOptionsForm(preferences) {
  const tableElem = document.getElementById('options');

  options.forEach((option) => {
    const value = preferences[option.name];

    const trElem = document.createElement('tr');

    const labelTdElem = document.createElement('td');
    const labelElem = document.createElement('label');
    labelElem.htmlFor = `option-${option.name}`;
    labelElem.textContent = option.title;

    labelTdElem.appendChild(labelElem);
    trElem.appendChild(labelTdElem);

    const optionTdElem = document.createElement('td');
    let optionElem;
    if (option.type === 'string') {
      optionElem = document.createElement('input');
      optionElem.type = 'text';
      optionElem.name = option.name;
      optionElem.value = value || '';

      optionElem.addEventListener('input', onChange);
    } else if (option.type === 'bool') {
      optionElem = document.createElement('input');
      optionElem.type = 'checkbox';
      optionElem.name = option.name;
      if (value === true) optionElem.checked = true;

      optionElem.addEventListener('change', onChange);
    } else if (option.type === 'radio') {
      optionElem = document.createElement('div');

      option.options.forEach((opt) => {
        const optLabelElem = document.createElement('label');

        const radioElem = document.createElement('input');
        radioElem.type = 'radio';
        radioElem.name = option.name;
        radioElem.value = opt.value;
        if (value === opt.value) radioElem.setAttribute('checked', '');

        radioElem.addEventListener('change', onChange);

        optLabelElem.appendChild(radioElem);
        optLabelElem.appendChild(document.createTextNode(opt.label));
        optionElem.appendChild(optLabelElem);
      });
    } else if (option.type === 'menulist') {
      optionElem = document.createElement('select');
      optionElem.name = option.name;

      option.options.forEach((opt) => {
        const optElem = document.createElement('option');
        optElem.value = opt.value;
        optElem.textContent = opt.label;
        if (value === opt.value) optElem.setAttribute('selected', '');

        optionElem.appendChild(optElem);
      });

      optionElem.addEventListener('change', onChange);
    }

    if (optionElem) {
      optionElem.id = `option-${option.name}`;

      optionTdElem.appendChild(optionElem);
      trElem.appendChild(optionTdElem);
    }

    tableElem.appendChild(trElem);
  });

  document.body.appendChild(tableElem);
}

function refreshOptionsForm(changedPrefs) {
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
}

function onChange(event) {
  const target = event.target;
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

  if (Object.keys(changedPrefs).length) {
    browser.storage.local.get('preferences')
      .then((storage) => {
        browser.storage.local.set({ preferences: Object.assign({}, storage.preferences, changedPrefs) });
      });
  }
}
