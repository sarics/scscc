import preferences from './storage/preferences';
import currRates from './storage/currRates';
import mutationObserver from './utils/mutationObserver';
import style from './utils/style';
import replacePrices from './replacePrices';
import refreshPrices from './refreshPrices';
import resetPrices from './resetPrices';

let started = false;
let paused = false;
const lastChanges = {};
const observer = mutationObserver(replacePrices);

const start = () => {
  if (started) return;
  started = true;

  observer.observe();

  if (preferences.get('style')) style.add();

  replacePrices();
};

const stop = () => {
  if (!started) return;
  started = false;

  observer.disconnect();

  style.remove();

  resetPrices();
};

const refresh = () => {
  if (!document.hidden) refreshPrices();
};

const onPreferencesChange = (newPrefs) => {
  if (paused) {
    lastChanges.preferences = [newPrefs];
    return;
  }

  if (!newPrefs.enabled || !newPrefs.toCurr) {
    stop();
    return;
  }

  if (started) {
    if (newPrefs.style) style.add();
    else style.remove();

    refresh();
  } else start();
};
preferences.onChange(onPreferencesChange);

const onCurrRatesChange = (newCurrRates, hasNew) => {
  if (!started) return;

  if (paused) {
    lastChanges.currRates = [newCurrRates, hasNew];
    return;
  }

  refresh();
  if (hasNew) replacePrices();
};
currRates.onChange(onCurrRatesChange);

const pause = () => {
  if (paused) return;
  paused = true;

  if (!started) return;

  observer.disconnect();
};

const resume = () => {
  if (!paused) return;
  paused = false;

  if (lastChanges.preferences) {
    onPreferencesChange(...lastChanges.preferences);
    delete lastChanges.preferences;
  }

  if (!started) {
    delete lastChanges.currRates;
    return;
  }

  observer.observe();

  if (lastChanges.currRates) {
    onCurrRatesChange(...lastChanges.currRates);
    delete lastChanges.currRates;
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
  else resume();
});
