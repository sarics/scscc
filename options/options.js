var manifest = chrome.runtime.getManifest();
var preferences = manifest.preferences;
var storagePrefs;
var bodyElem = document.body;

chrome.storage.local.get('preferences', function callback(storage) {
  storagePrefs = storage.preferences;

  buildOptionsForm();

  chrome.storage.onChanged.addListener(function listener(changes) {
    if (changes.preferences) {
      var changedPrefs = {};

      Object.keys(changes.preferences.newValue).forEach(function cb(prefKey) {
        var oldValue = storagePrefs[prefKey];
        var newValue = changes.preferences.newValue[prefKey];
        if (newValue !== oldValue) changedPrefs[prefKey] = newValue;
      });

      storagePrefs = changes.preferences.newValue;
      if (Object.keys(changedPrefs).length) refreshOptionsForm(changedPrefs);
    }
  });
});

function buildOptionsForm() {
  var tableElem = document.getElementById('options');

  preferences.forEach(function callback(pref) {
    var value = storagePrefs[pref.name];

    var trElem = document.createElement('tr');

    var labelTdElem = document.createElement('td');
    var labelElem = document.createElement('label');
    labelElem.htmlFor = 'pref-' + pref.name;
    labelElem.textContent = pref.title;

    labelTdElem.appendChild(labelElem);
    trElem.appendChild(labelTdElem);

    var formControlTdElem = document.createElement('td');
    var formControlElem;
    if (pref.type === 'string') {
      formControlElem = document.createElement('input');
      formControlElem.type = 'text';
      formControlElem.name = pref.name;
      formControlElem.value = value || '';

      formControlElem.addEventListener('input', onChange);
    } else if (pref.type === 'bool') {
      formControlElem = document.createElement('input');
      formControlElem.type = 'checkbox';
      formControlElem.name = pref.name;
      if (value === true) formControlElem.checked = true;

      formControlElem.addEventListener('change', onChange);
    } else if (pref.type === 'radio') {
      formControlElem = document.createElement('div');

      pref.options.forEach(function cb(opt) {
        var optLabelElem = document.createElement('label');

        var radioElem = document.createElement('input');
        radioElem.type = 'radio';
        radioElem.name = pref.name;
        radioElem.value = opt.value;
        if (value === opt.value) radioElem.setAttribute('checked', '');

        radioElem.addEventListener('change', onChange);

        optLabelElem.appendChild(radioElem);
        optLabelElem.appendChild(document.createTextNode(opt.label));
        formControlElem.appendChild(optLabelElem);
      });
    } else if (pref.type === 'menulist') {
      formControlElem = document.createElement('select');
      formControlElem.name = pref.name;

      pref.options.forEach(function cb(opt) {
        var optionElem = document.createElement('option');
        optionElem.value = opt.value;
        optionElem.textContent = opt.label;
        if (value === opt.value) optionElem.setAttribute('selected', '');

        formControlElem.appendChild(optionElem);
      });

      formControlElem.addEventListener('change', onChange);
    }

    if (formControlElem) {
      formControlElem.id = 'pref-' + pref.name;
      formControlElem.className = 'form-control';

      formControlTdElem.appendChild(formControlElem);
      trElem.appendChild(formControlTdElem);
    }

    tableElem.appendChild(trElem);
  });

  bodyElem.appendChild(tableElem);
}

function refreshOptionsForm(changedPrefs) {
  Object.keys(changedPrefs).forEach(function callback(prefName) {
    var formControlElem = document.querySelector('[name="' + prefName + '"]');

    if (formControlElem) {
      if (formControlElem.type === 'radio') {
        var radioElem = document.querySelector('[name="' + prefName + '"][value="' + changedPrefs[prefName] + '"]');
        if (radioElem) radioElem.checked = true;
      } else if (formControlElem.type === 'checkbox') {
        formControlElem.checked = changedPrefs[prefName];
      } else {
        formControlElem.value = changedPrefs[prefName];
      }
    }
  });
}

function onChange(event) {
  var target = event.target;
  var prefName = target.name;
  var prefValue = target.type === 'checkbox' ? target.checked : target.value;

  var changedPrefs = {};
  changedPrefs[prefName] = prefValue;

  // change the symbol on currency change
  if (prefName === 'toCurr') {
    changedPrefs.symbol = prefValue;
  }

  // if a space inserted before the symbol, remove it, and set symbSep to true
  if (prefName === 'symbol' && (prefValue.charAt(0) === ' ' || prefValue.charAt(prefValue.length - 1) === ' ')) {
    if (!storagePrefs.symbSep) changedPrefs.symbSep = true;

    target.value = prefValue.trim();
    delete changedPrefs.symbol;
  }

  // don't var to set the same thousand and decimal separator
  if (prefName === 'sepTho' && prefValue === storagePrefs.sepDec) {
    changedPrefs.sepDec = prefValue === ',' ? '.' : ',';
  } else if (prefName === 'sepDec' && prefValue === storagePrefs.sepTho) {
    changedPrefs.sepTho = prefValue === ',' ? '.' : ',';
  }

  if (Object.keys(changedPrefs).length) chrome.storage.local.set({ preferences: Object.assign({}, storagePrefs, changedPrefs) });
}
