const manifest = browser.runtime.getManifest();

// show notification about exchange rate updates if enabled in preferences
export default (fromCurr, toCurr, oldValue, newValue) => {
  if (oldValue === newValue) return;

  const opts = {
    type: 'basic',
    title: manifest.name,
    iconUrl: browser.runtime.getURL(manifest.icons[48]),
  };

  if (oldValue) {  // on update
    opts.message = `${fromCurr} to ${toCurr} exchange rate updated:\n${oldValue} → ${newValue}`;
  } else {  // on frist get
    opts.message = `${fromCurr} to ${toCurr} exchange rate got:\n${newValue}`;
  }

  browser.notifications.create(opts);
};
