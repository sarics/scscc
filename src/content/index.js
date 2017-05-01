import preferences from './storage/preferences';
import currRates from './storage/currRates';
import mutationObserver from './utils/mutationObserver';
import style from './utils/style';
import replacePrices from './replacePrices';
import refreshPrices from './refreshPrices';
import resetPrices from './resetPrices';

let started = false;
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
  if (!started) return;

  if (document.hidden) {
    observer.disconnect();
  } else {
    observer.observe();

    refreshPrices();
  }
};


preferences.onChange((newPrefs) => {
  if (!newPrefs.enabled || !newPrefs.toCurr) {
    stop();
    return;
  }

  if (started) {
    if (newPrefs.style) style.add();
    else style.remove();

    refresh();
  } else start();
});

currRates.onChange((newCurrRates, hasNew) => {
  if (!started) return;

  refresh();
  if (hasNew) replacePrices();
});

document.addEventListener('visibilitychange', refresh);
